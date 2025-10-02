# GitHub Setup Guide for First Deployment

## Overview
This guide walks you through configuring GitHub secrets, permissions, and environments to enable successful CI/CD deployment.

## Prerequisites
- GitHub repository: `grimm00/pokedex`
- Admin access to the repository
- Basic understanding of GitHub settings

## Step 1: Configure GitHub Secrets

### 1.1 Navigate to Repository Settings
1. Go to your GitHub repository: https://github.com/grimm00/pokedex
2. Click on **Settings** tab (top right)
3. In the left sidebar, click **Secrets and variables** → **Actions**

### 1.2 Add Required Secrets
Click **New repository secret** for each of the following:

#### Database Configuration
- **Name**: `DATABASE_URL`
- **Value**: `sqlite:///instance/pokedex_dev.db`
- **Description**: SQLite database connection string

#### Authentication
- **Name**: `JWT_SECRET_KEY`
- **Value**: `your-super-secret-jwt-key-here-change-this-in-production`
- **Description**: JWT signing key for authentication tokens

#### Cache Configuration
- **Name**: `REDIS_URL`
- **Value**: `redis://localhost:6379/0`
- **Description**: Redis connection string for caching

#### Application Configuration
- **Name**: `SECRET_KEY`
- **Value**: `your-super-secret-flask-key-here-change-this-in-production`
- **Description**: Flask secret key for sessions

#### External API (if needed)
- **Name**: `POKEAPI_BASE_URL`
- **Value**: `https://pokeapi.co/api/v2`
- **Description**: PokeAPI base URL for Pokemon data

### 1.3 Verify Secrets
After adding all secrets, you should see:
- DATABASE_URL
- JWT_SECRET_KEY
- REDIS_URL
- SECRET_KEY
- POKEAPI_BASE_URL

## Step 2: Configure Workflow Permissions

### 2.1 Navigate to Actions Settings
1. In repository settings, click **Actions** → **General**
2. Scroll down to **Workflow permissions**

### 2.2 Set Permissions
- Select **Read and write permissions**
- Check **Allow GitHub Actions to create and approve pull requests**
- Click **Save**

### 2.3 Additional Security Settings
- **Fork pull request workflows from outside collaborators**: Require approval for first-time contributors
- **Allow actions and reusable workflows**: Allow all actions and reusable workflows

## Step 3: Set up GitHub Environments

### 3.1 Navigate to Environments
1. In repository settings, click **Environments**
2. Click **New environment**

### 3.2 Create Staging Environment
- **Environment name**: `staging`
- **Description**: `Staging environment for testing deployments`
- Click **Configure environment**

#### Staging Environment Settings
- **Required reviewers**: None (for now)
- **Wait timer**: 0 minutes
- **Deployment branches**: All branches
- **Environment secrets**: Add the same secrets as repository secrets
- Click **Save protection rules**

### 3.3 Create Production Environment
- **Environment name**: `production`
- **Description**: `Production environment for live deployments`
- Click **Configure environment`

#### Production Environment Settings
- **Required reviewers**: Add yourself as a reviewer
- **Wait timer**: 5 minutes (optional)
- **Deployment branches**: Only `main` branch
- **Environment secrets**: Add production-specific secrets (use different values)
- Click **Save protection rules**

## Step 4: Verify Configuration

### 4.1 Check Repository Secrets
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Verify all required secrets are present
3. Check that values are correct

### 4.2 Check Workflow Permissions
1. Go to **Settings** → **Actions** → **General**
2. Verify permissions are set to "Read and write"
3. Verify "Allow GitHub Actions to create and approve pull requests" is checked

### 4.3 Check Environments
1. Go to **Settings** → **Environments**
2. Verify `staging` and `production` environments exist
3. Check that protection rules are configured correctly

## Step 5: Test Configuration

### 5.1 Trigger Workflow
1. Go to **Actions** tab in your repository
2. Click on **Continuous Integration** workflow
3. Click **Re-run all jobs** to test with new configuration

### 5.2 Monitor Results
- Watch for any remaining errors
- Check that security scanning now works
- Verify deployment steps complete successfully

## Troubleshooting

### Common Issues

#### Secret Not Found
- **Error**: `Secret not found: DATABASE_URL`
- **Solution**: Double-check secret name and ensure it's added to repository secrets

#### Permission Denied
- **Error**: `Resource not accessible by integration`
- **Solution**: Verify workflow permissions are set to "Read and write"

#### Environment Not Found
- **Error**: `Environment 'staging' not found`
- **Solution**: Create the environment in repository settings

#### SARIF Upload Failed
- **Error**: `Resource not accessible by integration`
- **Solution**: This is a known issue with security scanning - it will work after permissions are fixed

### Verification Commands

After configuration, you can verify using GitHub CLI:

```bash
# Check repository secrets
gh secret list

# Check workflow runs
gh run list --limit 5

# Check specific workflow
gh run view <run-id>
```

## Security Notes

### Production Secrets
- Use strong, unique values for production secrets
- Consider using GitHub's secret scanning
- Rotate secrets regularly
- Never commit secrets to code

### Environment Isolation
- Use different secret values for staging and production
- Consider using different databases for each environment
- Implement proper access controls

## Next Steps

After completing this setup:

1. **Monitor First Deployment** - Watch the workflows run successfully
2. **Test Staging Environment** - Verify staging deployment works
3. **Configure Production** - Set up production-specific configurations
4. **Set up Monitoring** - Configure alerts and notifications
5. **Document Process** - Update deployment documentation

## Support

If you encounter issues:

1. Check the GitHub Actions logs for specific error messages
2. Verify all secrets are correctly named and have values
3. Ensure permissions are properly configured
4. Check that environments exist and are accessible

## Quick Reference

### Required Secrets
- `DATABASE_URL`
- `JWT_SECRET_KEY`
- `REDIS_URL`
- `SECRET_KEY`
- `POKEAPI_BASE_URL`

### Required Permissions
- Read and write permissions
- Allow GitHub Actions to create and approve pull requests

### Required Environments
- `staging` (no protection rules)
- `production` (with protection rules)

---

**Last Updated**: January 20, 2025  
**Status**: Ready for first deployment configuration
