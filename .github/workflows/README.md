# GitHub Actions Workflows

This directory contains CI/CD pipeline definitions for automated testing, linting, security checks, and deployments.

**Related documentation:**

- [SECURITY.md](../../SECURITY.md) - Secret management and security best practices
- [CODE_STANDARDS.md](../../CODE_STANDARDS.md) - Code quality standards that CI/CD enforces
- [CONTRIBUTING.md](../../CONTRIBUTING.md) - Development workflow

## Available Workflows

### `ci.yml` - Continuous Integration

**Triggered on:** Push to `master` or `develop`, Pull Requests

**What it does:**

1. **Lint and Test** (Node 18.x and 20.x)
   - Installs dependencies
   - Runs ESLint for code quality
   - Type-checks with TypeScript
   - Runs test suite
   - Generates coverage reports

2. **Security Audit**
   - Audits npm dependencies for vulnerabilities
   - Checks for known security issues
   - Runs in parallel with other checks

3. **Build**
   - Builds the TypeScript project
   - Uploads build artifacts for verification

**When it passes:** All code quality checks pass, tests pass, builds successfully

**When it fails:** Will block PR merges and notify on push

### `deploy.yml` - Deployment Pipeline

**Triggered on:** Push to `master` branch or manual workflow_dispatch

**What it does:**

1. Sets up Node.js environment
2. Installs dependencies
3. Runs full test suite
4. Builds project
5. Placeholder for deployment steps (configure for your platform)

**Deployment Targets (configure as needed):**

- AWS Lambda, EC2, or Elastic Beanstalk
- Heroku
- DigitalOcean
- Google Cloud Run
- Azure App Service
- Kubernetes clusters
- Docker registries

**How to configure:** Edit the deployment steps section in `deploy.yml` for your platform

## Setting Up Secrets

For deployment workflows, configure GitHub repository secrets. See [SECURITY.md](../../SECURITY.md#secret-management) for detailed secret management guidelines.

Quick setup:

1. Go to **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Add secrets like:
   - `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
   - `HEROKU_API_KEY`
   - `DOCKER_REGISTRY_TOKEN`
   - `DATABASE_URL` (for migrations)

**Example usage in workflow:**

```yaml
- name: Deploy to Heroku
  env:
    HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
  run: heroku deploy --app my-app-name
```

## CI/CD Best Practices

### Branch Protection

Protect your `master` branch:

1. Go to **Settings → Branches**
2. Click **Add rule** for `master` branch
3. Require:
   - ✅ Pull request reviews before merging
   - ✅ Status checks to pass before merging (select CI workflow)
   - ✅ Dismiss stale pull request approvals when new commits are pushed

### Monitoring

- Check **Actions** tab to view workflow runs
- Failed workflows will notify contributors
- View logs for detailed error information

## Common Configurations

### Change Node Versions

Edit matrix in `ci.yml`:

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x, 22.x]
```

### Add Custom Test Commands

Add to `ci.yml` under test jobs:

```yaml
- name: Run integration tests
  run: npm run test:integration

- name: Run e2e tests
  run: npm run test:e2e
```

### Add Linting for Markdown

Add to `ci.yml`:

```yaml
- name: Lint Markdown
  run: npx markdownlint-cli '**/*.md'
```

### Deploy to Docker Registry

Example for `deploy.yml`:

```yaml
- name: Build and push Docker image
  env:
    REGISTRY: ghcr.io
    IMAGE_NAME: ${{ github.repository }}
  run: |
    docker build . -t $REGISTRY/$IMAGE_NAME:${{ github.sha }}
    docker push $REGISTRY/$IMAGE_NAME:${{ github.sha }}
```

### Deploy to AWS Lambda

Example for `deploy.yml`:

```yaml
- name: Deploy to AWS Lambda
  uses: appleboy/lambda-action@master
  with:
    aws_access_key_id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws_secret_access_key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws_region: us-east-1
    function_name: my-function-name
    zip_file: dist/lambda.zip
```

## Troubleshooting

### Workflow not triggering

- Verify branch name matches (check for typos)
- Check `.yml` file syntax (YAML is indentation-sensitive)
- Ensure workflow file is in `.github/workflows/` directory

### Dependency caching issues

Clear cache:

1. Go to **Settings → Actions → Runners**
2. Click **Remove** on cached items
3. Re-run workflow

### npm audit failing

Update `npm audit` level in `ci.yml`:

```yaml
- name: Audit npm dependencies
  run: npm audit --audit-level=low  # Change from moderate
```

## See Also

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [SECURITY.md](../SECURITY.md) - Security guidelines and best practices
- [CODE_STANDARDS.md](../CODE_STANDARDS.md) - Code quality standards
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution workflow
