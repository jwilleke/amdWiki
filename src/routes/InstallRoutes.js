const express = require('express');
const InstallService = require('../services/InstallService');

/**
 * InstallRoutes - Handles first-run installation routes
 *
 * Provides routes for:
 * - GET /install - Display installation form
 * - POST /install - Process installation
 *
 * Routes are only accessible when installation is required.
 *
 * @class InstallRoutes
 */
class InstallRoutes {
  /**
   * Creates a new InstallRoutes instance
   *
   * @constructor
   * @param {WikiEngine} engine - The wiki engine instance
   */
  constructor(engine) {
    this.engine = engine;
    this.router = express.Router();
    this.installService = new InstallService(engine);
    this.#setupRoutes();
  }

  /**
   * Setup install routes
   *
   * @private
   */
  #setupRoutes() {
    // GET /install - Show installation form
    this.router.get('/', async (req, res) => {
      try {
        // Check if install is required
        const installRequired = await this.installService.isInstallRequired();

        if (!installRequired) {
          return res.redirect('/');
        }

        // Check for partial installation
        const partialState = await this.installService.detectPartialInstallation();

        // Render install form
        res.render('install', {
          formData: req.session.installFormData || {},
          sessionSecret: this.installService.generateSessionSecret(),
          messages: {
            info: req.session.installSuccess || 'Please complete the following fields to set up your wiki.',
            error: req.session.installError,
            warning: partialState.isPartial ?
              'Partial installation detected. Please reset before continuing.' : null
          },
          partialInstallation: partialState
        });

        // Clear session data
        delete req.session.installFormData;
        delete req.session.installError;
        delete req.session.installSuccess;
      } catch (error) {
        console.error('Error displaying install form:', error);
        res.status(500).send('Error loading installation page');
      }
    });

    // POST /install - Process installation
    this.router.post('/', async (req, res) => {
      try {
        // Check if install is required
        const installRequired = await this.installService.isInstallRequired();

        if (!installRequired) {
          return res.redirect('/');
        }

        // Extract form data
        const installData = {
          applicationName: req.body.applicationName,
          baseURL: req.body.baseURL,
          adminUsername: 'admin', // Fixed - not from form
          adminPassword: req.body.adminPassword,
          adminPasswordConfirm: req.body.adminPasswordConfirm,
          adminEmail: 'admin@localhost', // Fixed - not from form
          orgName: req.body.orgName,
          orgLegalName: req.body.orgLegalName,
          orgDescription: req.body.orgDescription,
          orgFoundingDate: req.body.orgFoundingDate,
          orgAddressLocality: req.body.orgAddressLocality,
          orgAddressRegion: req.body.orgAddressRegion,
          orgAddressCountry: req.body.orgAddressCountry,
          sessionSecret: req.body.sessionSecret,
          copyStartupPages: req.body.copyStartupPages === 'on'
        };

        // Process installation
        const result = await this.installService.processInstallation(installData);

        if (!result.success) {
          // Save form data and error to session
          req.session.installFormData = installData;
          req.session.installError = result.error;
          return res.redirect('/install');
        }

        // Installation successful - reload config
        await this.engine.getManager('ConfigurationManager').reload();

        // Show success page
        res.render('install-success', {
          applicationName: installData.applicationName,
          baseURL: installData.baseURL,
          adminUsername: installData.adminUsername,
          pagesCopied: installData.copyStartupPages
        });

      } catch (error) {
        console.error('Error processing installation:', error);
        req.session.installError = error.message;
        req.session.installFormData = req.body;
        res.redirect('/install');
      }
    });

    // POST /install/reset - Reset partial installation
    this.router.post('/reset', async (req, res) => {
      try {
        // Reset the installation
        const result = await this.installService.resetInstallation();

        if (!result.success) {
          req.session.installError = result.error;
        } else {
          req.session.installSuccess = result.message;
        }

        res.redirect('/install');
      } catch (error) {
        console.error('Error resetting installation:', error);
        req.session.installError = `Reset failed: ${error.message}`;
        res.redirect('/install');
      }
    });

    // GET /install/status - Check installation status (API endpoint)
    this.router.get('/status', async (req, res) => {
      try {
        const partialState = await this.installService.detectPartialInstallation();
        const installRequired = await this.installService.isInstallRequired();
        const missingPages = await this.installService.detectMissingPagesOnly();

        res.json({
          installRequired,
          partialInstallation: partialState,
          missingPagesOnly: missingPages
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // POST /install/create-pages - Create pages folder and copy required pages
    this.router.post('/create-pages', async (req, res) => {
      try {
        // Check if only pages are missing
        const missingPages = await this.installService.detectMissingPagesOnly();

        if (!missingPages.missingPagesOnly) {
          return res.status(400).json({
            success: false,
            error: 'Pages folder already exists or installation is not complete'
          });
        }

        // Create pages folder and copy required pages
        const result = await this.installService.createPagesFolder();

        if (!result.success) {
          return res.status(500).json(result);
        }

        res.json(result);
      } catch (error) {
        console.error('Error creating pages folder:', error);
        res.status(500).json({
          success: false,
          error: `Failed to create pages folder: ${error.message}`
        });
      }
    });
  }

  /**
   * Get the router instance
   *
   * @returns {express.Router}
   */
  getRouter() {
    return this.router;
  }
}

module.exports = InstallRoutes;
