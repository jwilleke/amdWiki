const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const WikiEngine = require('./src/WikiEngine');
const WikiRoutes = require('./src/routes/WikiRoutes');

class WikiApp {
  constructor() {
    this.app = express();
    this.engine = null;
    this.routes = null;
  }

  async initialize() {
    console.log('🚀 Starting amdWiki application...');
    
    try {
      // Initialize WikiEngine
      console.log('🔧 Initializing WikiEngine...');
      this.engine = new WikiEngine();
      
      // Load configuration from file if exists, otherwise use defaults
      let config;
      try {
        const configData = await fs.readFile('./config/wiki.json', 'utf8');
        config = JSON.parse(configData);
        console.log('📁 Loaded configuration from file');
      } catch (err) {
        console.log('⚙️  Using default configuration');
        config = {
          name: 'amdWiki',
          pagesDirectory: './pages',
          port: 3000,
          managers: {
            pageManager: { enabled: true },
            pluginManager: { enabled: true },
            renderingManager: { enabled: true },
            searchManager: { enabled: true }
          }
        };
      }
      
      await this.engine.initialize(config);
      
      // Setup Express middleware
      this.setupMiddleware();
      
      // Initialize routes
      console.log('🛣️  Setting up routes...');
      this.routes = new WikiRoutes(this.engine);
      this.routes.registerRoutes(this.app);
      
      console.log('✅ WikiApp initialized successfully');
      
    } catch (err) {
      console.error('❌ Failed to initialize WikiApp:', err);
      throw err;
    }
  }

  setupMiddleware() {
    console.log('🔧 Setting up Express middleware...');
    
    // Body parsing middleware
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
    
    // Static files
    this.app.use(express.static(path.join(__dirname, 'public')));
    
    // View engine
    this.app.set('view engine', 'ejs');
    this.app.set('views', path.join(__dirname, 'views'));
    
    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
      next();
    });
    
    // Error handling middleware
    this.app.use((err, req, res, next) => {
      console.error('Express error:', err);
      res.status(500).send('Internal Server Error');
    });
  }

  async start(port) {
    const serverPort = port || this.engine.getConfig().get('server.port') || 3000;
    
    return new Promise(async (resolve, reject) => {
      try {
        const pageCount = (await this.engine.getManager('PageManager').getPageNames()).length;
        
        this.server = this.app.listen(serverPort, (err) => {
          if (err) {
            reject(err);
          } else {
            console.log(`🌐 amdWiki server running on http://localhost:${serverPort}`);
            console.log(`📚 Serving ${pageCount} pages`);
            resolve();
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  async stop() {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          console.log('🛑 amdWiki server stopped');
          resolve();
        });
      });
    }
  }
}

// If this file is run directly, start the server
if (require.main === module) {
  const app = new WikiApp();
  
  app.initialize()
    .then(() => app.start())
    .catch(err => {
      console.error('Failed to start application:', err);
      process.exit(1);
    });
  
  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    await app.stop();
    process.exit(0);
  });
}

module.exports = WikiApp;
