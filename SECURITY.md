# Security Guidelines

This document outlines security best practices and policies for this project. All contributors must follow these guidelines. **Core rule: NEVER put unencrypted secrets in Git** (see [CODE_STANDARDS.md](./CODE_STANDARDS.md#guiding-principles)).

## Table of Contents

- [Secret Management](#secret-management)
- [Dependency Management](#dependency-management)
- [Code Security](#code-security)
- [Input Validation](#input-validation)
- [Authentication & Authorization](#authentication--authorization)
- [Data Protection](#data-protection)
- [Deployment Security](#deployment-security)
- [Security Incident Response](#security-incident-response)

## Secret Management

### Never Commit Secrets

**Critical Rule:** Never commit passwords, API keys, tokens, or other secrets to version control.

### What Counts as a Secret

- Database credentials
- API keys and tokens
- JWT secrets
- OAuth secrets
- Private encryption keys
- AWS access keys
- Payment processor keys
- Any sensitive configuration

### How to Handle Secrets

#### Local Development

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Fill in your local values in `.env`

3. Never commit `.env` (it's in `.gitignore`)

4. Each developer has their own `.env` with different values

#### Production Deployment

1. Use GitHub repository secrets:
   - Go to **Settings → Secrets and variables → Actions**
   - Add secrets needed for deployment

2. Use environment-specific secrets:
   - Staging secrets separate from production
   - Production secrets with restricted access

3. Reference in workflows:

   ```yaml
   - name: Deploy
     env:
      DATABASE_URL: ${{ secrets.DATABASE_URL }}
      API_KEY: ${{ secrets.API_KEY }}
     run: npm run deploy
   ```

### Secret Rotation

- Rotate secrets regularly (at least quarterly)
- Immediately rotate compromised secrets
- Document secret rotation dates in team records
- Use secret management tools (AWS Secrets Manager, HashiCorp Vault, etc.)

### Checking for Accidental Commits

If you accidentally commit a secret:

1. **Immediately rotate the secret** (change the password/key)
2. Remove from git history:

   ```bash
   git filter-branch --tree-filter 'rm -f .env' HEAD
   # Or use git-filter-repo for better results
   ```

3. Force push only if you're the only one with local copies
4. Notify team and rotate all related credentials

## Dependency Management

### Regular Audits

Run dependency audits regularly:

```bash
# Check for vulnerabilities
npm audit

# Check only production dependencies
npm audit --production

# Get detailed report
npm audit --json
```

### Automated Security Checks

This project includes GitHub Actions workflows that automatically audit dependencies:

- CI workflow runs `npm audit` on every pull request
- Security audit job checks for known vulnerabilities
- Moderate severity issues prevent merge

### Updating Dependencies

1. **Regular updates:**

   ```bash
   npm update
   npm outdated  # See what can be updated
   ```

2. **Patch security issues immediately:**

   ```bash
   npm audit fix
   ```

3. **Major version updates:**
   - Test thoroughly before merging
   - Check changelog for breaking changes
   - Update code if necessary

4. **Audit before commit:**

   ```bash
   npm audit
   npm run lint
   npm run test
   ```

### Vulnerable Dependencies

If a critical vulnerability is found:

1. Check if there's a patch available
2. If no patch: remove package and find alternative
3. If unfixable: use `npm audit ignore` only temporarily
4. Always document why and for how long

## Code Security

### TypeScript Strict Mode

All code uses `strict: true` in `tsconfig.json`:

- Catches null/undefined errors at compile time
- Requires explicit types
- Prevents implicit `any`
- Catches accidental type coercion

### No Console Logs in Production

ESLint prevents `console.log` in production code:

```typescript
// ❌ Bad - will fail linting
console.log('User password:', password);

// ✅ Good - use proper logging
logger.info('User authentication attempt', { userId });
```

#### If You Need Logging

- Use structured logging library (Winston, Pino, Bunyan)
- Never log sensitive data (passwords, tokens, API keys)
- Use appropriate log levels (info, warn, error)

### Secure Defaults

- Default to deny (require explicit allow)
- Assume untrusted input by default
- Use parameterized queries for database
- Validate on both client and server
- Use HTTPS everywhere in production

## Input Validation

### Always Validate Input

#### Server-Side Validation (Required)

```typescript
// ✅ Good - validate all user input
function createUser(email: string, password: string): User {
  if (!email || !email.includes('@')) {
    throw new Error('Invalid email format');
  }
  
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
  
  return saveUser({ email, password: hashPassword(password) });
}
```

#### Client-Side Validation (Convenience Only)

- Use for better UX
- Never rely on it for security
- Always validate on server

### SQL Injection Prevention

Always use parameterized queries:

```typescript
// ❌ Bad - vulnerable to SQL injection
const user = await db.query(`SELECT * FROM users WHERE id = ${userId}`);

// ✅ Good - parameterized query
const user = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

// ✅ Good - with ORM like Prisma
const user = await prisma.user.findUnique({ where: { id: userId } });
```

### XSS Prevention (Cross-Site Scripting)

- Never insert user input directly into HTML
- Use templating engines that escape by default
- Sanitize HTML if you must allow it
- Use Content Security Policy (CSP) headers

## Authentication & Authorization

### Password Requirements

Enforce strong passwords:

```typescript
const PASSWORD_REQUIREMENTS = {
  minLength: 12,
  requireUppercase: true,
  requireNumbers: true,
  requireSpecialChars: true
};
```

### Password Hashing

#### Never Store Plain Text Passwords

```typescript
import bcrypt from 'bcrypt';

// When creating user
const hashedPassword = await bcrypt.hash(password, 10);
await saveUser({ email, password: hashedPassword });

// When verifying
const isValid = await bcrypt.compare(inputPassword, storedHash);
```

### JWT/Token Management

- Set short expiration times (15-30 minutes)
- Use refresh tokens for longer sessions
- Store tokens securely (HttpOnly cookies, not localStorage)
- Include token revocation mechanism
- Never include sensitive data in JWT payload

### Session Security

- Use secure session cookies (HttpOnly, Secure, SameSite flags)
- Implement session timeout
- Invalidate sessions on logout
- Store session data server-side, not in JWT

## Data Protection

### HTTPS Only

- All traffic must use HTTPS in production
- Redirect HTTP to HTTPS
- Use HSTS headers to enforce HTTPS
- Use TLS 1.2 or higher

### Data Minimization

- Collect only necessary data
- Delete data when no longer needed
- Implement data retention policies
- Allow users to request data deletion (GDPR compliance)

### Database Security

- Use encrypted connections to database
- Never hardcode credentials
- Restrict database user permissions (principle of least privilege)
- Enable database audit logging
- Regular backups with encryption
- Test disaster recovery procedures

### Encryption

- Encrypt sensitive data at rest
- Encrypt data in transit (HTTPS/TLS)
- Use strong encryption algorithms (AES-256, RSA-2048+)
- Secure key management (don't hardcode keys)
- Rotate encryption keys periodically

## Deployment Security

### Environment Separation

Maintain separate environments:

- **Development**: Local, lenient security
- **Staging**: Production-like, test environment
- **Production**: Maximum security, restricted access

### Secure Deployment

1. **Code review required** before production deployment
2. **Automated tests must pass** (CI/CD pipeline)
3. **Security scans must pass** (no high/critical vulnerabilities)
4. **Secrets injected at runtime** (never in code)
5. **Immutable deployments** (rollback capability)
6. **Monitoring and alerting enabled**

### Access Control

- Limit production access to authorized personnel
- Use role-based access control (RBAC)
- Implement multi-factor authentication (MFA)
- Use temporary credentials, not long-lived keys
- Log all access to production systems
- Use GitHub branch protection rules

### Container Security (if using Docker)

- Use minimal base images (alpine)
- Run as non-root user
- Scan images for vulnerabilities
- Keep base images updated
- Don't commit secrets in Dockerfile

## Security Incident Response

### Vulnerability Discovery

If you discover a vulnerability:

1. **Do not** create a public GitHub issue
2. **Do not** commit details in code comments
3. **Do** email security contact privately
4. **Do** provide:
   - Detailed description
   - Steps to reproduce
   - Severity assessment
   - Your recommendation

### Vulnerability Response Timeline

- **Critical (CVSS 9.0-10)**: Fix within 24 hours
- **High (CVSS 7.0-8.9)**: Fix within 1 week
- **Medium (CVSS 4.0-6.9)**: Fix within 2 weeks
- **Low (CVSS 0.1-3.9)**: Fix within 30 days

### Public Disclosure

After fix is deployed:

1. Update CHANGELOG with fix
2. Create security advisory (if critical)
3. Notify users if credentials exposed
4. Follow responsible disclosure practices

## Security Checklist

Before deploying to production:

- [ ] All dependencies audited and current
- [ ] No hardcoded secrets in code
- [ ] Environment variables configured via `.env` or secrets
- [ ] HTTPS enabled and enforced
- [ ] Authentication/authorization working correctly
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention in place (parameterized queries)
- [ ] XSS protection enabled (CSP headers, sanitization)
- [ ] CSRF protection if applicable
- [ ] Rate limiting on authentication endpoints
- [ ] Logging doesn't include sensitive data
- [ ] Error messages don't leak sensitive information
- [ ] Database credentials use least privilege access
- [ ] Backup and disaster recovery tested
- [ ] Security headers configured (CSP, X-Frame-Options, etc.)
- [ ] 3rd party services have security review
- [ ] Team members trained on security practices

## Tools & Resources

### Security Tools

- **npm audit** - Check for known vulnerabilities
- **OWASP ZAP** - Automated security scanning
- **Snyk** - Continuous vulnerability scanning
- **GitHub Advanced Security** - Code scanning and secret scanning
- **Dependabot** - Automated dependency updates

### Learning Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Top 10 for API](https://owasp.org/www-project-api-security/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/nodejs-security/)
- [npm Security Documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [CWE/SANS Top 25](https://cwe.mitre.org/top25/)

## Related Documents

- [CODE_STANDARDS.md](./CODE_STANDARDS.md) - Code quality standards
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [.github/workflows/README.md](.github/workflows/README.md) - CI/CD pipeline documentation
- [.env.example](.env.example) - Environment variable template

## Questions?

If you have security questions or concerns:

1. Check this document first
2. Review OWASP resources
3. Consult with team security lead
4. For critical issues: use private disclosure channel

Remember: **Security is everyone's responsibility.**
