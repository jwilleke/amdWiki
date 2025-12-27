/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
 
/* eslint-disable no-console */

import express, { Router, Request, Response } from 'express';
import InstallService from '../services/InstallService';

/**
 * Installation form data
 */
interface InstallFormData {
  applicationName: string;
  baseURL: string;
  adminUsername: string;
  adminPassword: string;
  adminPasswordConfirm: string;
  adminEmail: string;
  orgName: string;
  orgLegalName: string;
  orgDescription: string;
  orgFoundingDate: string;
  orgAddressLocality: string;
  orgAddressRegion: string;
  orgAddressCountry: string;
  sessionSecret: string;
  copyStartupPages: boolean;
}

/**
 * Installation result from service
 */
interface InstallResult {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * Partial installation state
 */
interface PartialInstallationState {
  isPartial: boolean;
  steps?: {
    configWritten?: boolean;
    organizationCreated?: boolean;
    adminCreated?: boolean;
    pagesCopied?: boolean;
  };
}

/**
 * Missing pages detection result
 */
interface MissingPagesResult {
  missingPagesOnly: boolean;
}

/**
 * Extended Request type with session data
 */
interface InstallRequest extends Request {
  session: any;
  body: any;
}

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
  private engine: any;
  private router: Router;
  private installService: any;

  /**
   * Creates a new InstallRoutes instance
   *
   * @constructor
   * @param {any} engine - The wiki engine instance
   */
  constructor(engine: any) {
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
  #setupRoutes(): void {
    // GET /install - Show installation form
    this.router.get('/', async (req: InstallRequest, res: Response): Promise<void> => {
      try {
        // Check if install is required
        const installRequired: boolean = await this.installService.isInstallRequired();

        if (!installRequired) {
          res.redirect('/');
          return;
        }

        // Check for partial installation
        const partialState: PartialInstallationState = await this.installService.detectPartialInstallation();

        // Render install form
        res.render('install', {
          formData: req.session.installFormData || {},
          sessionSecret: this.installService.generateSessionSecret(),
          messages: {
            info: req.session.installSuccess || 'Please complete the following fields to set up your wiki.',
            error: req.session.installError,
            warning: partialState.isPartial ?
              'Installation is incomplete from a previous attempt. Complete the form below to finish the setup.' : null
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
    this.router.post('/', async (req: InstallRequest, res: Response): Promise<void> => {
      try {
        // Check if install is required
        const installRequired: boolean = await this.installService.isInstallRequired();

        if (!installRequired) {
          res.redirect('/');
          return;
        }

        // Extract form data
        const installData: InstallFormData = {
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
        const result: InstallResult = await this.installService.processInstallation(installData);

        if (!result.success) {
          // Save form data and error to session
          req.session.installFormData = installData;
          req.session.installError = result.error;
          res.redirect('/install');
          return;
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

      } catch (error: any) {
        console.error('Error processing installation:', error);
        req.session.installError = error.message;
        req.session.installFormData = req.body;
        res.redirect('/install');
      }
    });

    // POST /install/reset - Reset partial installation
    this.router.post('/reset', async (req: InstallRequest, res: Response): Promise<void> => {
      try {
        // Reset the installation
        const result: InstallResult = await this.installService.resetInstallation();

        if (!result.success) {
          req.session.installError = result.error;
        } else {
          req.session.installSuccess = result.message;
        }

        res.redirect('/install');
      } catch (error: any) {
        console.error('Error resetting installation:', error);
        req.session.installError = `Reset failed: ${error.message}`;
        res.redirect('/install');
      }
    });

    // GET /install/status - Check installation status (API endpoint)
    this.router.get('/status', async (req: Request, res: Response): Promise<void> => {
      try {
        const partialState: PartialInstallationState = await this.installService.detectPartialInstallation();
        const installRequired: boolean = await this.installService.isInstallRequired();
        const missingPages: MissingPagesResult = await this.installService.detectMissingPagesOnly();

        res.json({
          installRequired,
          partialInstallation: partialState,
          missingPagesOnly: missingPages
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // POST /install/create-pages - Create pages folder and copy required pages
    this.router.post('/create-pages', async (req: Request, res: Response): Promise<void> => {
      try {
        // Check if only pages are missing
        const missingPages: MissingPagesResult = await this.installService.detectMissingPagesOnly();

        if (!missingPages.missingPagesOnly) {
          res.status(400).json({
            success: false,
            error: 'Pages folder already exists or installation is not complete'
          });
          return;
        }

        // Create pages folder and copy required pages
        const result: InstallResult = await this.installService.createPagesFolder();

        if (!result.success) {
          res.status(500).json(result);
          return;
        }

        res.json(result);
      } catch (error: any) {
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
   * @returns {Router}
   */
  getRouter(): Router {
    return this.router;
  }
}

export default InstallRoutes;
module.exports = InstallRoutes;
