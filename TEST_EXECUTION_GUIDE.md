# MedCare Test Execution Guide

## Quick Start

### Prerequisites
1. **Node.js** (v16 or higher)
2. **MedCare Application** running on `http://localhost:3001`
3. **Firebase Emulator** (for local testing)
4. **Test Data** (seeded in Firestore)

### Installation
```bash
# Install test dependencies
npm install puppeteer jest cypress playwright

# Start Firebase emulator (optional for local testing)
firebase emulators:start

# Start MedCare application
npm run dev
```

## Running Tests

### All Tests
```bash
node test-automation.js
```

### Specific Categories
```bash
# Functional tests only
npm run test:functional

# AI features tests
npm run test:ai

# Order workflow tests
npm run test:workflow

# Security tests
npm run test:security

# Performance tests
npm run test:performance
```

### Generate Report Only
```bash
npm run test:report
```

## Test Categories Explained

### 1. Functional Tests (P0 - Critical)
- **Purpose**: Verify core functionality works
- **Coverage**: All user roles, basic workflows
- **Execution Time**: ~5 minutes
- **Pass Requirement**: 100%

### 2. AI Features Tests (P0 - Critical)
- **Purpose**: Verify AI integrations work
- **Coverage**: Drug checker, prescription analyzer, chatbot
- **Execution Time**: ~3 minutes
- **Pass Requirement**: 95%

### 3. Order Workflow Tests (P0 - Critical)
- **Purpose**: Verify end-to-end prescription flow
- **Coverage**: Doctor → Shop → Delivery
- **Execution Time**: ~4 minutes
- **Pass Requirement**: 100%

### 4. Edge Cases (P1 - High)
- **Purpose**: Verify error handling
- **Coverage**: Invalid inputs, boundary conditions
- **Execution Time**: ~3 minutes
- **Pass Requirement**: 90%

### 5. API Failure Tests (P1 - High)
- **Purpose**: Verify resilience
- **Coverage**: Network failures, service outages
- **Execution Time**: ~2 minutes
- **Pass Requirement**: 85%

### 6. UI Component Tests (P2 - Medium)
- **Purpose**: Verify user interface
- **Coverage**: Buttons, forms, navigation
- **Execution Time**: ~4 minutes
- **Pass Requirement**: 90%

### 7. Performance Tests (P2 - Medium)
- **Purpose**: Verify performance standards
- **Coverage**: Load times, stress testing
- **Execution Time**: ~10 minutes
- **Pass Requirement**: 80%

### 8. Security Tests (P1 - High)
- **Purpose**: Verify security measures
- **Coverage**: Authentication, data protection
- **Execution Time**: ~3 minutes
- **Pass Requirement**: 100%

### 9. Recovery Scenarios (P2 - Medium)
- **Purpose**: Verify error recovery
- **Coverage**: Network, hardware, user errors
- **Execution Time**: ~5 minutes
- **Pass Requirement**: 85%

## Test Data Setup

### Required Test Users
```javascript
// Admin User
{
  email: "admin@medcare.test",
  password: "Admin123!",
  role: "admin",
  status: "active"
}

// Doctor User
{
  email: "doctor@medcare.test", 
  password: "Doctor123!",
  role: "doctor",
  status: "active"
}

// Pharmacist User
{
  email: "pharmacist@medcare.test",
  password: "Pharm123!",
  role: "pharmacist", 
  status: "active"
}

// Delivery User
{
  email: "delivery@medcare.test",
  password: "Deliver123!",
  role: "delivery",
  status: "active"
}
```

### Sample Medicines
```javascript
[
  {
    name: "Amoxicillin",
    stock: 100,
    unit: "capsules",
    price: 15.99,
    reorderLevel: 50
  },
  {
    name: "Paracetamol", 
    stock: 200,
    unit: "tablets",
    price: 8.50,
    reorderLevel: 100
  }
]
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: MedCare Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run dev &
      - run: sleep 10
      - run: node test-automation.js
      - uses: actions/upload-artifact@v3
        with:
          name: test-report
          path: test-report.md
```

### Docker Testing
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "run", "test"]
```

## Test Results Interpretation

### Pass Rate Guidelines
- **95-100%**: Production ready
- **90-94%**: Acceptable with minor issues
- **85-89%**: Needs attention before production
- **<85%**: Not ready for production

### Critical Failures
Any failure in these categories blocks deployment:
- Functional Tests (PAT-*, DOC-*, ADM-*, PHM-*, DEL-*)
- Order Workflow (ORD-001 through ORD-006)
- Security Tests (SEC-001 through SEC-010)

### Performance Benchmarks
- **Page Load**: < 3 seconds
- **API Response**: < 1 second
- **Concurrent Users**: 50+ without degradation
- **Memory Usage**: < 512MB per session

## Troubleshooting

### Common Issues

#### Test Failures
1. **Application not running**: Start with `npm run dev`
2. **Firebase connection issues**: Check emulator status
3. **AI service failures**: Verify API keys and quotas
4. **Browser issues**: Update Chrome/Chromium

#### Performance Issues
1. **Slow tests**: Run in parallel where possible
2. **Memory leaks**: Check for unclosed resources
3. **Network timeouts**: Increase timeout values

#### False Positives
1. **Flaky tests**: Increase retry count
2. **Timing issues**: Add explicit waits
3. **Environment differences**: Use consistent test environment

### Debug Mode
```bash
# Run with verbose logging
DEBUG=true node test-automation.js

# Run specific test with debugging
DEBUG=test-001 node test-automation.js
```

## Best Practices

### Test Maintenance
1. **Review tests weekly** for relevance
2. **Update test data** regularly
3. **Refactor duplicate code** in tests
4. **Document complex scenarios**

### Test Writing
1. **Use descriptive test names**
2. **Test one thing per test**
3. **Include positive and negative cases**
4. **Add clear error messages**

### CI/CD Integration
1. **Run tests on every PR**
2. **Block merges on test failures**
3. **Generate test reports**
4. **Monitor test performance**

## Reporting

### Automated Reports
- **HTML Report**: `test-report.html`
- **JSON Report**: `test-results.json`
- **Coverage Report**: `coverage-report.html`

### Manual Reporting
- **Daily Summary**: Test execution status
- **Weekly Trends**: Pass rate over time
- **Monthly Review**: Comprehensive analysis

### Alerting
- **Critical Failures**: Immediate notification
- **Performance Degradation**: Warning alerts
- **Security Issues**: Emergency alerts

---

## Test Execution Checklist

### Before Running Tests
- [ ] Application is running on correct port
- [ ] Test data is seeded
- [ ] Firebase emulator is running (if needed)
- [ ] AI services are accessible
- [ ] Browser drivers are updated

### After Running Tests
- [ ] Review test report
- [ ] Analyze failed tests
- [ ] Update test documentation
- [ ] Archive test results
- [ ] Notify team of critical issues

### Release Readiness
- [ ] All P0 tests passing
- [ ] Security tests passing
- [ ] Performance benchmarks met
- [ ] No critical regressions
- [ ] Test documentation updated

---

*Last Updated: ${new Date().toISOString()}*
