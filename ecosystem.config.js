const path = require('path');

// Generate unique app name based on directory
const dirName = path.basename(__dirname);
const appName = `amdWiki-${dirName}`;

module.exports = {
  apps: [{
    name: appName,
    script: 'app.js',
    cwd: __dirname,

    // Node.js args - enable native TypeScript support (Node 22.6+)
    node_args: '--experimental-strip-types',

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

    // Logging - all logs go to ./data/logs directory
    out_file: './data/logs/pm2-out.log',
    error_file: './data/logs/pm2-error.log',
    log_file: './data/logs/pm2-combined.log',

    // Log rotation
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,

    // Process management
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',

    // Error handling
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000
  }]
};
