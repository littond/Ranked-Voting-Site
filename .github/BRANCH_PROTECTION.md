# Branch Protection Setup Guide

To ensure code quality and prevent broken code from reaching production, set up these branch protection rules in your GitHub repository.

## Required Branch Protection Rules

### For `main` branch:

1. **Go to**: Repository Settings → Branches → Add Rule
2. **Branch name pattern**: `main`
3. **Enable these protections**:

   ✅ **Require a pull request before merging**
   - Require approvals: 1
   - Dismiss stale PR approvals when new commits are pushed
   - Require review from code owners (if you have a CODEOWNERS file)

   ✅ **Require status checks to pass before merging**
   - Require branches to be up to date before merging
   - Required status checks:
     - `Backend Tests`
     - `Frontend Tests & Build` 
     - `Security Audit`
     - `Integration Tests`

   ✅ **Require conversation resolution before merging**

   ✅ **Require signed commits** (optional but recommended)

   ✅ **Include administrators** (applies rules to admins too)

### For `dev` branch:

1. **Branch name pattern**: `dev`
2. **Enable these protections**:

   ✅ **Require a pull request before merging**
   - Require approvals: 1

   ✅ **Require status checks to pass before merging**
   - Required status checks:
     - `Backend Tests`
     - `Frontend Tests & Build`

## Workflow

```
feature/new-feature → dev → main
      ↓              ↓      ↓
   PR + CI      PR + CI  Deploy
```

1. **Feature Development**: Create feature branches from `dev`
2. **Development Testing**: PR to `dev` runs CI checks
3. **Production Release**: PR from `dev` to `main` runs full CI suite
4. **Deployment**: Successful merge to `main` triggers deployment

## Status Checks

The CI workflows will automatically report status to GitHub:

- ✅ **Backend Tests**: Jest test suite (44 tests)
- ✅ **Frontend Tests**: ESLint + Build verification
- ✅ **Security Audit**: npm audit for vulnerabilities
- ✅ **Integration Tests**: End-to-end testing
- ✅ **Coverage**: Code coverage reporting

## Benefits

- 🛡️ **Prevents broken code** from reaching production
- 🔍 **Enforces code review** before merging
- 🧪 **Ensures all tests pass** before deployment
- 📊 **Maintains high code quality** standards
- 🚀 **Enables confident releases** with automated checks 