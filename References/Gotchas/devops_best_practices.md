# DevOps CI/CD and Environment Management Best Practices

## Core DevOps Principles

### 1. Environment Strategy

**Rule**: All code must flow through standardized environments with proper approval gates and validation at each stage.

#### Environment Hierarchy

```yaml
environments:
  development:
    purpose: "Active development and feature integration"
    deployment_trigger: "Automatic on main branch merge"
    approval_required: false
    data: "Synthetic/mock data"
    monitoring: "Basic logging"

  quality_assurance:
    purpose: "Automated and manual testing validation"
    deployment_trigger: "Manual promotion from DEV"
    approval_required: "Team Lead or QA Lead"
    data: "Sanitized production-like data"
    monitoring: "Enhanced logging + basic metrics"

  user_acceptance_testing:
    purpose: "Business stakeholder validation"
    deployment_trigger: "Manual promotion from QA"
    approval_required: "Product Owner + Business Stakeholder"
    data: "Production-like data (anonymized)"
    monitoring: "Full monitoring stack"

  production:
    purpose: "Live customer-facing environment"
    deployment_trigger: "Manual promotion from UAT"
    approval_required: "Release Manager + Technical Lead"
    data: "Live production data"
    monitoring: "Complete observability stack"
```

### 2. Deployment Pipeline Strategy

#### GitHub Actions Workflow Example

```yaml
# .github/workflows/ci-cd-pipeline.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: "18"
  DOCKER_REGISTRY: "your-registry.azurecr.io"

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run unit tests
        run: npm run test:coverage

      - name: Run security audit
        run: npm audit --audit-level moderate

      - name: Build application
        run: npm run build

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3

  build-and-deploy-dev:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: development

    steps:
      - uses: actions/checkout@v4

      - name: Build Docker image
        run: |
          docker build -t ${{ env.DOCKER_REGISTRY }}/app:dev-${{ github.sha }} .

      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login ${{ env.DOCKER_REGISTRY }} -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push ${{ env.DOCKER_REGISTRY }}/app:dev-${{ github.sha }}

      - name: Deploy to DEV
        uses: azure/webapps-deploy@v2
        with:
          app-name: "myapp-dev"
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE_DEV }}
          images: "${{ env.DOCKER_REGISTRY }}/app:dev-${{ github.sha }}"

      - name: Run smoke tests
        run: |
          sleep 30  # Wait for deployment
          npm run test:smoke -- --env=dev

  deploy-qa:
    needs: build-and-deploy-dev
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment:
      name: qa
      url: https://myapp-qa.azurewebsites.net

    steps:
      - uses: actions/checkout@v4

      - name: Promote to QA
        run: |
          docker tag ${{ env.DOCKER_REGISTRY }}/app:dev-${{ github.sha }} ${{ env.DOCKER_REGISTRY }}/app:qa-${{ github.sha }}
          docker push ${{ env.DOCKER_REGISTRY }}/app:qa-${{ github.sha }}

      - name: Deploy to QA
        uses: azure/webapps-deploy@v2
        with:
          app-name: "myapp-qa"
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE_QA }}
          images: "${{ env.DOCKER_REGISTRY }}/app:qa-${{ github.sha }}"

      - name: Run integration tests
        run: npm run test:integration -- --env=qa

      - name: Run performance tests
        run: npm run test:performance -- --env=qa

  deploy-uat:
    needs: deploy-qa
    runs-on: ubuntu-latest
    environment:
      name: uat
      url: https://myapp-uat.azurewebsites.net

    steps:
      - uses: actions/checkout@v4

      - name: Manual approval checkpoint
        uses: trstringer/manual-approval@v1
        with:
          secret: ${{ github.TOKEN }}
          approvers: product-team,business-stakeholders
          minimum-approvals: 2

      - name: Promote to UAT
        run: |
          docker tag ${{ env.DOCKER_REGISTRY }}/app:qa-${{ github.sha }} ${{ env.DOCKER_REGISTRY }}/app:uat-${{ github.sha }}
          docker push ${{ env.DOCKER_REGISTRY }}/app:uat-${{ github.sha }}

      - name: Deploy to UAT
        uses: azure/webapps-deploy@v2
        with:
          app-name: "myapp-uat"
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE_UAT }}
          images: "${{ env.DOCKER_REGISTRY }}/app:uat-${{ github.sha }}"

      - name: Run E2E tests
        run: npm run test:e2e -- --env=uat

      - name: Run accessibility tests
        run: npm run test:a11y -- --env=uat

  deploy-production:
    needs: deploy-uat
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://myapp.com

    steps:
      - uses: actions/checkout@v4

      - name: Production deployment approval
        uses: trstringer/manual-approval@v1
        with:
          secret: ${{ github.TOKEN }}
          approvers: release-managers,technical-leads
          minimum-approvals: 2
          issue-title: "Production Deployment Approval Required"

      - name: Create release tag
        run: |
          git tag v$(date +%Y%m%d)-${{ github.sha }}
          git push origin --tags

      - name: Deploy to Production (Blue-Green)
        run: |
          # Deploy to green slot first
          docker tag ${{ env.DOCKER_REGISTRY }}/app:uat-${{ github.sha }} ${{ env.DOCKER_REGISTRY }}/app:prod-${{ github.sha }}
          docker push ${{ env.DOCKER_REGISTRY }}/app:prod-${{ github.sha }}

      - name: Health check and traffic routing
        run: |
          # Health check on green environment
          npm run health-check -- --env=prod-green

          # Gradual traffic routing (10% -> 50% -> 100%)
          npm run traffic-split -- --green=10
          sleep 300
          npm run traffic-split -- --green=50
          sleep 300
          npm run traffic-split -- --green=100

      - name: Post-deployment monitoring
        run: |
          npm run monitor -- --env=production --duration=15m

      - name: Notification
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: "#releases"
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 3. Environment-Specific Configuration

#### Configuration Management Strategy

```yaml
# config/environments/development.yml
environment: development
api_base_url: "https://api-dev.myapp.com"
database_url: "postgresql://dev-db:5432/myapp_dev"
cache_ttl: 60
log_level: debug
feature_flags:
  new_dashboard: true
  experimental_ui: true
monitoring:
  enabled: true
  sample_rate: 1.0

# config/environments/qa.yml
environment: qa
api_base_url: "https://api-qa.myapp.com"
database_url: "postgresql://qa-db:5432/myapp_qa"
cache_ttl: 300
log_level: info
feature_flags:
  new_dashboard: true
  experimental_ui: false
monitoring:
  enabled: true
  sample_rate: 1.0

# config/environments/uat.yml
environment: uat
api_base_url: "https://api-uat.myapp.com"
database_url: "postgresql://uat-db:5432/myapp_uat"
cache_ttl: 600
log_level: warn
feature_flags:
  new_dashboard: true
  experimental_ui: false
monitoring:
  enabled: true
  sample_rate: 0.1

# config/environments/production.yml
environment: production
api_base_url: "https://api.myapp.com"
database_url: "${DATABASE_URL}"  # From secure secrets
cache_ttl: 3600
log_level: error
feature_flags:
  new_dashboard: false
  experimental_ui: false
monitoring:
  enabled: true
  sample_rate: 0.01
```

### 4. Infrastructure as Code (IaC)

#### Terraform Environment Management

```hcl
# infrastructure/environments/dev/main.tf
module "infrastructure" {
  source = "../../modules/app-infrastructure"

  environment = "dev"
  instance_count = 1
  instance_size = "Standard_B1s"
  database_tier = "Basic"
  auto_scaling_enabled = false

  tags = {
    Environment = "Development"
    Owner = "Development Team"
    CostCenter = "Engineering"
  }
}

# infrastructure/environments/qa/main.tf
module "infrastructure" {
  source = "../../modules/app-infrastructure"

  environment = "qa"
  instance_count = 2
  instance_size = "Standard_B2s"
  database_tier = "Standard"
  auto_scaling_enabled = true
  auto_scaling_min = 1
  auto_scaling_max = 3

  tags = {
    Environment = "QA"
    Owner = "QA Team"
    CostCenter = "Quality Assurance"
  }
}

# infrastructure/environments/prod/main.tf
module "infrastructure" {
  source = "../../modules/app-infrastructure"

  environment = "prod"
  instance_count = 3
  instance_size = "Standard_D2s_v3"
  database_tier = "Premium"
  auto_scaling_enabled = true
  auto_scaling_min = 3
  auto_scaling_max = 10
  backup_retention_days = 30

  tags = {
    Environment = "Production"
    Owner = "Platform Team"
    CostCenter = "Production Operations"
  }
}
```

### 5. Approval Gates and Governance

#### GitHub Environment Protection Rules

```yaml
# Repository Settings > Environments Configuration

development:
  protection_rules:
    required_reviewers: 0
    wait_timer: 0
    deployment_branches: [develop]

qa:
  protection_rules:
    required_reviewers: 1
    reviewers: [qa-team, team-leads]
    wait_timer: 0
    deployment_branches: [main]

uat:
  protection_rules:
    required_reviewers: 2
    reviewers: [product-owners, business-stakeholders]
    wait_timer: 30 # 30 minute waiting period
    deployment_branches: [main]

production:
  protection_rules:
    required_reviewers: 2
    reviewers: [release-managers, technical-leads]
    wait_timer: 60 # 1 hour waiting period
    deployment_branches: [main]
    restrict_pushes: true
```

#### Approval Workflow Integration

```yaml
# .github/workflows/approval-workflow.yml
name: Deployment Approval Workflow

on:
  workflow_run:
    workflows: ["CI/CD Pipeline"]
    types: [completed]
    branches: [main]

jobs:
  create-deployment-issue:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'success' }}

    steps:
      - name: Create deployment approval issue
        uses: actions/github-script@v6
        with:
          script: |
            const { owner, repo } = context.repo;
            const sha = context.payload.workflow_run.head_sha;

            await github.rest.issues.create({
              owner,
              repo,
              title: `Deployment Approval Required - ${sha.substring(0, 7)}`,
              body: `
                ## Deployment Approval Request
                
                **Commit:** ${sha}
                **Environment:** UAT → Production
                **Triggered by:** ${context.payload.workflow_run.actor.login}
                
                ### Checklist
                - [ ] QA testing completed successfully
                - [ ] Performance tests passed
                - [ ] Security scan results reviewed
                - [ ] Database migrations verified
                - [ ] Rollback plan confirmed
                
                ### Approval Required From:
                - [ ] Product Owner (@product-team)
                - [ ] Technical Lead (@technical-leads)
                - [ ] Release Manager (@release-managers)
                
                **Note:** This deployment will proceed automatically once all approvals are received.
              `,
              labels: ['deployment', 'approval-required', 'production'],
              assignees: ['product-owner', 'tech-lead', 'release-manager']
            });
```

### 6. Environment-Specific Testing Strategy

#### Test Automation per Environment

```yaml
testing_strategy:
  development:
    - unit_tests: "Full suite with coverage reporting"
    - integration_tests: "Core API endpoints"
    - smoke_tests: "Basic functionality verification"
    - security_tests: "Static analysis (SAST)"

  qa:
    - integration_tests: "Complete API test suite"
    - ui_tests: "Automated browser testing"
    - performance_tests: "Load testing with reduced load"
    - security_tests: "Dynamic analysis (DAST)"
    - compatibility_tests: "Cross-browser and device testing"

  uat:
    - e2e_tests: "Complete user journey testing"
    - accessibility_tests: "WCAG compliance validation"
    - performance_tests: "Production-like load testing"
    - security_tests: "Penetration testing"
    - business_tests: "User acceptance scenarios"

  production:
    - health_checks: "Continuous monitoring"
    - canary_tests: "Gradual rollout validation"
    - rollback_tests: "Automated rollback verification"
    - monitoring_tests: "Alert and dashboard validation"
```

### 7. Monitoring and Observability

#### Environment-Specific Monitoring

```yaml
monitoring_configuration:
  development:
    logging: "Debug level, local aggregation"
    metrics: "Basic performance counters"
    alerts: "Development team Slack channel"
    retention: "7 days"

  qa:
    logging: "Info level, centralized logging"
    metrics: "Performance + business metrics"
    alerts: "QA team + development leads"
    retention: "30 days"
    synthetic_monitoring: "Basic uptime checks"

  uat:
    logging: "Warn level, structured logging"
    metrics: "Full observability stack"
    alerts: "Product team + technical leads"
    retention: "90 days"
    synthetic_monitoring: "User journey monitoring"

  production:
    logging: "Error level, high-performance logging"
    metrics: "Complete telemetry with SLI/SLO tracking"
    alerts: "On-call rotation + escalation policies"
    retention: "1 year (logs), 2 years (metrics)"
    synthetic_monitoring: "Global user experience monitoring"
```

### 8. Rollback and Disaster Recovery

#### Automated Rollback Strategy

```yaml
# .github/workflows/rollback.yml
name: Emergency Rollback

on:
  workflow_dispatch:
    inputs:
      environment:
        description: "Environment to rollback"
        required: true
        type: choice
        options: ["qa", "uat", "production"]
      rollback_version:
        description: "Version to rollback to"
        required: true
        type: string

jobs:
  rollback:
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment }}

    steps:
      - name: Validate rollback version
        run: |
          # Verify the rollback version exists
          docker manifest inspect ${{ env.DOCKER_REGISTRY }}/app:${{ github.event.inputs.rollback_version }}

      - name: Execute rollback
        run: |
          # Deploy previous version
          az webapp config container set \
            --name myapp-${{ github.event.inputs.environment }} \
            --resource-group myapp-rg \
            --docker-custom-image-name ${{ env.DOCKER_REGISTRY }}/app:${{ github.event.inputs.rollback_version }}

      - name: Verify rollback
        run: |
          sleep 60  # Wait for deployment
          npm run health-check -- --env=${{ github.event.inputs.environment }}

      - name: Notify teams
        uses: 8398a7/action-slack@v3
        with:
          status: "Rollback completed"
          channel: "#incidents"
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Validation Commands

### Environment Validation

```bash
# Verify environment configuration
kubectl get configmap env-config -o yaml
helm template myapp ./charts/myapp --values values-${ENVIRONMENT}.yaml

# Database migration validation
npm run db:migrate:status
npm run db:migrate:dry-run

# Security validation
npm audit --audit-level moderate
docker scan myapp:latest
```

### Deployment Validation

```bash
# Health checks
curl -f https://myapp-${ENV}.com/health
kubectl get pods -l app=myapp

# Performance validation
npm run test:performance -- --env=${ENV}
lighthouse https://myapp-${ENV}.com

# Integration validation
npm run test:integration -- --env=${ENV}
npm run test:e2e -- --env=${ENV}
```

## Quality Gates

### Deployment Checklist

- [ ] All tests passing in current environment
- [ ] Security scans completed with no critical issues
- [ ] Performance benchmarks met
- [ ] Database migrations tested and documented
- [ ] Rollback plan documented and tested
- [ ] Monitoring and alerts configured
- [ ] Required approvals obtained
- [ ] Communication plan executed

### Environment Promotion Criteria

```yaml
dev_to_qa:
  - unit_tests: "100% passing"
  - integration_tests: "100% passing"
  - code_coverage: ">= 80%"
  - security_scan: "No critical vulnerabilities"

qa_to_uat:
  - integration_tests: "100% passing"
  - performance_tests: "Within SLA requirements"
  - security_tests: "DAST scan clean"
  - manual_testing: "QA sign-off required"

uat_to_production:
  - e2e_tests: "100% passing"
  - performance_tests: "Production load validated"
  - security_tests: "Penetration test clean"
  - business_validation: "UAT sign-off required"
  - rollback_plan: "Documented and tested"
```

This comprehensive DevOps strategy ensures proper environment management with appropriate approval gates, testing validation, and rollback capabilities for reliable software delivery.
