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

        // Render install form
        res.render('install', {
          formData: req.session.installFormData || {},
          sessionSecret: this.installService.generateSessionSecret(),
          messages: {
            info: 'Please complete the following fields to set up your wiki.',
            error: req.session.installError
          }
        });

        // Clear session data
        delete req.session.installFormData;
        delete req.session.installError;
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
          adminUsername: req.body.adminUsername,
          adminPassword: req.body.adminPassword,
          adminPasswordConfirm: req.body.adminPasswordConfirm,
          adminEmail: req.body.adminEmail,
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
