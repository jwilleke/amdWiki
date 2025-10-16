module.exports = {
  apps: [{
    name: 'amdWiki',
    script: 'app.js',
    cwd: __dirname,

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

    // Logging - all logs go to ./logs directory
    out_file: './logs/pm2-out.log',
    error_file: './logs/pm2-error.log',
    log_file: './logs/pm2-combined.log',

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
    restart_delay: 4000,

    // PID file
    pid_file: './.amdwiki.pid'
  }]
};
