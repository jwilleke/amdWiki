# amdWiki Project

JSPWiki-style wiki with advanced search capabilities

Read docs/development/CONTRIBUTING.md

## Commands
- Start: `npm start` or `npm run dev`
- Test: `npm test`
- Test with watch: `npm run test:watch`
- Test with coverage: `npm run test:coverage`
- PM2 start: `pm2 start app.js --name "server"`

## Project Structure
- `/src/` - Core application code
- `/pages/` - Wiki pages content
- `/templates/` - Page templates
- `/config/` - Configuration files
- `/tests/` - Test files
- `/docs/` - Documentation
- `/users/` - User data
- `/views/` - EJS view templates

## Key Features
- Advanced search with Lunr.js
- User management and ACL
- Plugin system
- Multiple export formats
- Schema management for persons/organizations
- Audit logging and notifications

## Technology Stack
- Node.js + Express
- EJS templating
- Markdown processing with Showdown
- BCrypt for authentication
- Winston for logging
- Jest for testing

## Development Notes
- Server runs on port 3000
- Uses CommonJS modules
- Session-based authentication
- File-based data storage
