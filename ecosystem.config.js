const path = require('path');

// Generate unique app name based on directory
const dirName = path.basename(__dirname);
const appName = `amdWiki-${dirName}`;

module.exports = {
  apps: [{
    name: appName,
    script: 'app.js',
    cwd: __dirname,

    // Run pre-compiled JavaScript from dist/ (no tsx needed)
    // IMPORTANT: Run 'npm run build' before starting with PM2

    // Environment
    env: {
      NODE_ENV: 'production'
    },
    env_development: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    },

    // Logging - use FAST_STORAGE (operational data dir), falling back to legacy INSTANCE_DATA_FOLDER
    out_file: path.join(process.env.FAST_STORAGE || process.env.INSTANCE_DATA_FOLDER || './data', 'logs/pm2-out.log'),
    error_file: path.join(process.env.FAST_STORAGE || process.env.INSTANCE_DATA_FOLDER || './data', 'logs/pm2-error.log'),
    log_file: path.join(process.env.FAST_STORAGE || process.env.INSTANCE_DATA_FOLDER || './data', 'logs/pm2-combined.log'),

    // Log rotation
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,

    // Process management
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: process.env.PM2_MAX_MEMORY || '4G',

    // Error handling
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000
  }]
};
