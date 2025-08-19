# Validation Commands Reference

This file contains validation commands for different technology stacks used in enterprise development.

## Universal Code Quality Validation

### General Coding Standards Compliance

```bash
# File size validation (500 lines max for source files)
find . -name "*.js" -o -name "*.ts" -o -name "*.py" -o -name "*.java" -o -name "*.cs" | \
  xargs wc -l | awk '$1 > 500 {print "VIOLATION: " $2 " has " $1 " lines (max 500)"}'

# Function size validation (50 lines max - language specific)
# JavaScript/TypeScript
rg "function.*\{[\s\S]{3000,}" --type typescript
rg "const.*=.*\{[\s\S]{3000,}" --type typescript

# Python
rg "def .*:[\s\S]{2500,}" --type python

# Java/C#
rg "(public|private).*\{[\s\S]{3000,}" --type java

# Documentation validation (public APIs must have docs)
# Missing JSDoc in TypeScript
rg "export (function|class|interface)" --type typescript -A 5 | rg -v "/\*\*"

# Missing docstrings in Python
rg "def [^_].*:" --type python -A 3 | rg -v '"""'

# Search tool compliance validation
grep -r "grep\|find.*-name" . --include="*.md" --include="*.sh" | \
  grep -v "rg\|ripgrep" | \
  head -5 && echo "VIOLATION: Use 'rg' instead of grep/find"

# TDD validation (tests should exist for implementations)
# Check for missing test files
find src -name "*.js" -o -name "*.ts" -o -name "*.py" | \
  while read file; do
    testfile=$(echo $file | sed 's/src/tests/' | sed 's/\.\(js\|ts\|py\)/.test.\1/')
    [ ! -f "$testfile" ] && echo "MISSING TEST: $testfile for $file"
  done
```

### SOLID Principles Validation

```bash
# Single Responsibility - Large classes/files
rg "class.*\{[\s\S]{5000,}" . | head -5
rg "interface.*\{[\s\S]{2000,}" . | head -5

# God class detection (too many methods)
rg "class.*\{" -A 200 . | rg -c "^\s*(public|private).*\(" | \
  awk '$1 > 20 {print "VIOLATION: Class has " $1 " methods (max ~15)"}'

# Deep inheritance detection
rg "extends.*extends\|implements.*,.*,.*," . | head -5

# Dependency Inversion violations (concrete dependencies)
rg "new [A-Z][a-zA-Z]*\(" --type typescript -C 3 | \
  grep -v "(test|spec|mock)" | head -10
```

### Naming Convention Validation

```bash
# Variable naming (no abbreviations)
rg "\b(usr|cfg|ctx|ptr|str|num|arr|obj|doc|win|btn|txt)\b" . | \
  grep -v "(test|comment)" | head -10

# Function naming (should be verb + noun)
rg "function [a-z]+[A-Z]" . | grep -v "(get|set|is|has|can|should|create|update|delete|validate|process|calculate|transform|render|handle)" | head -10

# Magic numbers detection
rg "\b[0-9]{2,}\b" --type typescript | grep -v "(test|spec|enum|const)" | head -10

# Boolean naming (should be questions)
rg "boolean [a-zA-Z]+(?!is|has|can|should|will)" . | head -5
```

## Frontend Technologies

### React (TypeScript + Vite)

```bash
# Level 1: Syntax & Style
npm run lint                    # ESLint
npm run format                  # Prettier
npx tsc --noEmit               # TypeScript check

# Level 2: Unit Tests
npm test                       # Jest/Vitest + RTL
npm run test:watch            # Watch mode

# Level 3: Integration Tests
npm run dev                    # Start dev server
npm run e2e                    # Playwright/Cypress

# Level 4: Quality Checks
npm run build                  # Production build
npm run lighthouse            # Performance audit
```

### Angular (TypeScript + Angular CLI)

```bash
# Level 1: Syntax & Style
ng lint                        # Angular ESLint
npm run format                # Prettier
npx tsc --noEmit              # TypeScript check

# Level 2: Unit Tests
ng test                       # Jasmine + Karma
ng test --watch=false         # Single run

# Level 3: Integration Tests
ng serve                      # Start dev server
ng e2e                        # End-to-end tests

# Level 4: Quality Checks
ng build --configuration=production  # Production build
```

### Vue 3 (TypeScript + Vite)

```bash
# Level 1: Syntax & Style
npm run lint                  # ESLint + Vue ESLint
npm run format               # Prettier
npx vue-tsc --noEmit         # TypeScript check

# Level 2: Unit Tests
npm run test:unit            # Vitest + Vue Testing Library
npm run test:unit:watch      # Watch mode

# Level 3: Integration Tests
npm run dev                  # Start dev server
npm run test:e2e            # End-to-end tests

# Level 4: Quality Checks
npm run build               # Production build
```

## Backend Technologies

### .NET Core (C# + ASP.NET Core)

```bash
# Level 1: Syntax & Style
dotnet format               # Code formatting
dotnet build                # Compilation check

# Level 2: Unit Tests
dotnet test                 # xUnit tests
dotnet test --collect:"XPlat Code Coverage"  # With coverage

# Level 3: Integration Tests
dotnet run --project src/ProjectName.Api  # Start API
dotnet test tests/ProjectName.IntegrationTests/

# Level 4: Quality Checks
dotnet publish -c Release   # Production build
dotnet sonarscanner begin   # SonarQube analysis
```

### Python FastAPI

```bash
# Level 1: Syntax & Style
ruff check . --fix          # Linting and auto-fix
ruff format .               # Code formatting
mypy .                      # Type checking

# Level 2: Unit Tests
pytest                      # Run all tests
pytest --cov=app           # With coverage

# Level 3: Integration Tests
uvicorn app.main:app --reload  # Start FastAPI server
pytest tests/api/           # API integration tests

# Level 4: Quality Checks
pip-audit                   # Security audit
bandit -r app/              # Security analysis
```

### Node.js Express (TypeScript)

```bash
# Level 1: Syntax & Style
npm run lint                # ESLint
npm run format              # Prettier
npm run type-check          # TypeScript compilation

# Level 2: Unit Tests
npm test                    # Jest tests
npm run test:coverage       # With coverage

# Level 3: Integration Tests
npm run dev                 # Start development server
npm run test:integration    # Integration tests

# Level 4: Quality Checks
npm run build               # TypeScript compilation
npm audit                   # Security audit
```

## Full-Stack Integration Testing

### API + Frontend Integration

```bash
# Start backend
npm run dev:backend         # or dotnet run, uvicorn, etc.

# Start frontend
npm run dev:frontend        # React/Angular/Vue dev server

# Run E2E tests
npm run test:e2e           # Full application testing
```

## Advanced Validation Patterns

### Pre-Implementation Validation

```bash
# Environment check
node --version && npm --version
git status --porcelain | wc -l  # Check for uncommitted changes

# Dependency audit
npm audit --audit-level=moderate
npm outdated

# Code quality baseline
npm run lint
npm test -- --coverage
```

### Implementation Validation Loop

```bash
# Continuous validation during development
npm run lint:fix   # Auto-fix linting issues
npm test -- --watch  # Run tests on file changes
npm run type-check  # TypeScript validation

# Pre-commit validation
npm run build
npm test
npm run lint
```

### Advanced Quality Gates

```bash
# Performance validation
npm run build:analyze  # Bundle size analysis
npm run test:performance  # Performance benchmarks

# Security validation
npm audit
npm run test:security  # Security-focused tests

# Accessibility validation
npm run test:a11y  # Accessibility compliance
```

### Framework-Specific Validation

#### React Projects

```bash
npx eslint src/ --ext .js,.jsx,.ts,.tsx
npm test -- --coverage --watchAll=false
npm run build
```

#### Vue Projects

```bash
npm run lint
npm run test:unit
npm run build
```

#### Angular Projects

```bash
ng lint
ng test --watch=false --browsers=ChromeHeadless
ng build --configuration=production
```

#### Python Projects

```bash
ruff check --fix .
mypy .
pytest --cov=. --cov-report=term-missing
```

#### .NET Projects

```bash
dotnet format --verify-no-changes
dotnet test --collect:"XPlat Code Coverage"
dotnet build --configuration Release
```

## DevOps and CI/CD Validation

### Environment Configuration Validation

```bash
# Verify environment variables and secrets
printenv | grep -E "(API_|DB_|AZURE_)" | sort

# Validate Docker configuration
docker build --target production .
docker run --rm myapp:latest /bin/sh -c "npm run health-check"

# Infrastructure validation
terraform plan -var-file="environments/${ENV}.tfvars"
terraform validate

# Kubernetes configuration validation
kubectl apply --dry-run=client -f k8s/
helm template myapp ./charts/myapp --values values-${ENV}.yaml
```

### CI/CD Pipeline Validation

```bash
# GitHub Actions workflow validation
act -l  # List available workflows
act -n  # Dry run workflows

# Azure DevOps pipeline validation
az pipelines run --name "CI/CD Pipeline" --branch main

# Pipeline security validation
actionlint .github/workflows/
yamllint .github/workflows/

# Secrets and configuration validation
gh secret list
az keyvault secret list --vault-name myapp-${ENV}-kv
```

### Deployment Validation

```bash
# Health check endpoints
curl -f https://myapp-dev.azurewebsites.net/health
curl -f https://myapp-qa.azurewebsites.net/health
curl -f https://myapp-uat.azurewebsites.net/health
curl -f https://myapp.azurewebsites.net/health

# Database migration validation
npm run db:migrate:status
npm run db:migrate:dry-run

# Container health validation
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
kubectl get pods -l app=myapp -o wide
```

### Environment Parity Validation

```bash
# Configuration drift detection
diff -u config/environments/dev.yml config/environments/qa.yml
diff -u config/environments/qa.yml config/environments/uat.yml

# Infrastructure parity check
terraform show -json | jq '.values.root_module.resources[] | select(.type=="azurerm_app_service")'

# Database schema validation
npm run db:schema:compare -- --source=dev --target=qa
```

### Rollback Validation

```bash
# Rollback readiness check
docker image ls | grep myapp | head -5  # Recent versions available
git tag -l | tail -10  # Recent release tags

# Rollback simulation (in non-prod)
az webapp deployment slot swap --name myapp-qa --resource-group myapp-rg --slot staging

# Rollback verification
npm run test:smoke -- --env=qa
npm run health-check -- --env=qa
```

### Monitoring and Observability Validation

```bash
# Application metrics validation
curl -s https://myapp-${ENV}.azurewebsites.net/metrics | grep -E "(http_requests|memory_usage)"

# Log aggregation validation
az monitor logs query --workspace myapp-logs --analytics-query "AppRequests | where TimeGenerated > ago(1h)"

# Alert configuration validation
az monitor metrics alert list --resource-group myapp-rg
```

### Security and Compliance Validation

```bash
# Container security scanning
docker scan myapp:latest
trivy image myapp:latest

# Infrastructure security validation
checkov -f terraform/
tfsec terraform/

# API security validation
npm run test:security -- --env=${ENV}
zap-baseline.py -t https://myapp-${ENV}.azurewebsites.net
```

---

## Testing Strategy Patterns

### Test Coverage Analysis

```bash
# Identify untested code
find . -name "*.js" -o -name "*.ts" -o -name "*.py" | xargs grep -L "test\|spec"

# Generate test scaffolding for uncovered functions
npm run test:coverage  # or appropriate coverage tool
rg "export (function|class)" --type typescript | grep -v "test\|spec"
```

### Safe Refactoring Validation

```bash
# Before refactoring - establish baseline
npm test
npm run lint
npm run build
git status --porcelain  # ensure clean state

# After refactoring - verify no regression
npm test
npm run lint
npm run build
npm audit  # security check
npm run test:e2e  # full integration test
```

### Bug Investigation Commands

```bash
# Get detailed error information
npm test -- --verbose
npm run lint -- --format verbose

# Check for related issues
git log --grep="similar-keyword" --oneline
rg "error-pattern" src/ -A 3 -B 3
```

---

## Usage Instructions

1. Copy the relevant commands for your tech stack to your PRP
2. Replace placeholder values with your specific project setup
3. Add project-specific commands as needed
4. Ensure all commands work in your development environment
5. **Reference this file** instead of duplicating validation commands
