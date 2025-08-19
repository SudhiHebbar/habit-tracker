# General Coding Standards and Best Practices

**Reference Architecture**: This file contains universal principles. For specific implementation details, see:

- [validation_commands.md](./validation_commands.md) - Testing and validation commands
- [database_best_practices.md](./database_best_practices.md) - Repository patterns and data access
- [frontend_best_practices.md](./frontend_best_practices.md) - UI/UX patterns and lazy loading
- [devops_best_practices.md](./devops_best_practices.md) - CI/CD and deployment workflows

## Universal Development Philosophy

### Core Principles (Apply to ALL Languages)

#### KISS (Keep It Simple, Stupid)

**Rule**: Simplicity should be a key goal in design. Choose straightforward solutions over complex ones whenever possible.

**Application**:

- Simple solutions are easier to understand, maintain, and debug
- Prefer readable code over clever optimizations
- Choose established patterns over custom implementations
- Avoid premature optimization

#### YAGNI (You Aren't Gonna Need It)

**Rule**: Avoid building functionality on speculation. Implement features only when they are needed.

**Application**:

- Don't implement features based on future assumptions
- Build minimal viable implementations first
- Extend functionality when actual requirements emerge
- Remove unused code regularly

#### Fail Fast Principle

**Rule**: Validate inputs early and throw meaningful errors immediately when issues occur.

**Application**:

- Input validation at function/method entry points
- Clear error messages that help debugging
- Defensive programming with early returns
- Use assertions for development-time checks

### File and Function Size Limits

#### Universal Size Guidelines

```yaml
file_size_limits:
  source_files: "500 lines maximum"
  test_files: "800 lines maximum (due to test data)"
  configuration_files: "200 lines maximum"
  documentation_files: "No strict limit"

function_size_limits:
  functions_methods: "50 lines maximum"
  constructors: "30 lines maximum"
  test_methods: "100 lines maximum (setup + execution + assertions)"

class_size_limits:
  classes: "200 lines maximum"
  interfaces: "100 lines maximum"
  types_schemas: "150 lines maximum"

line_length:
  maximum: "100 characters"
  preferred: "80-90 characters"
  exceptions: ["URLs", "long string literals", "import statements"]
```

#### Refactoring Triggers

```typescript
// ❌ WRONG: Function too long
function processUserData(user: User) {
  // 60+ lines of logic
  // Validation, transformation, database calls, email sending, etc.
}

// ✅ CORRECT: Broken into focused functions
function processUserData(user: User) {
  const validatedUser = validateUserInput(user);
  const transformedUser = transformUserData(validatedUser);
  const savedUser = saveUserToDatabase(transformedUser);
  sendWelcomeEmail(savedUser);
  return savedUser;
}
```

### Documentation Standards

#### Mandatory Documentation (ALL Languages)

**Function/Method Documentation**:

````typescript
/**
 * Processes user registration data with validation and persistence.
 *
 * @param userData - Raw user input from registration form
 * @param options - Processing options including validation rules
 * @returns Promise resolving to processed user with generated ID
 *
 * @throws {ValidationError} When user data fails validation rules
 * @throws {DatabaseError} When persistence operation fails
 *
 * @example
 * ```typescript
 * const user = await processUserRegistration(
 *   { email: "user@example.com", name: "John Doe" },
 *   { strictValidation: true }
 * );
 * ```
 */
async function processUserRegistration(
  userData: UserInput,
  options: ProcessingOptions
): Promise<ProcessedUser> {
  // Implementation
}
````

**Class/Component Documentation**:

````typescript
/**
 * @fileoverview User authentication and session management
 * @module auth/UserAuthenticator
 */

/**
 * Handles user authentication with multiple providers.
 *
 * Supports OAuth, JWT, and session-based authentication.
 * Integrates with external identity providers and maintains
 * local session state for performance optimization.
 *
 * @class
 * @example
 * ```typescript
 * const auth = new UserAuthenticator({
 *   providers: ['google', 'github'],
 *   sessionTimeout: 3600
 * });
 *
 * const user = await auth.authenticateUser(credentials);
 * ```
 */
class UserAuthenticator {
  // Implementation
}
````

### Universal Code Quality Rules

#### Design Principles (ALL Languages)

```yaml
solid_principles:
  single_responsibility:
    rule: "Each function, class, and module should have one clear purpose"
    validation: "Can you describe what this does in one sentence?"

  open_closed:
    rule: "Software entities should be open for extension but closed for modification"
    application: "Use interfaces, abstract classes, dependency injection"

  dependency_inversion:
    rule: "High-level modules should not depend on low-level modules"
    application: "Both should depend on abstractions (interfaces)"

composition_over_inheritance:
  rule: "Prefer composition and interfaces over class inheritance"
  application: "Use dependency injection, strategy pattern, decorators"

error_handling:
  rule: "Handle errors explicitly, never ignore them"
  validation: "Every external call should have error handling"
```

#### Naming Conventions (Language Agnostic)

```yaml
naming_standards:
  variables:
    format: "descriptive, avoid abbreviations"
    examples:
      good: ["userEmail", "calculateTotalPrice", "isAuthenticated"]
      bad: ["usr", "calc", "flg"]

  functions:
    format: "verb + noun pattern"
    examples:
      good: ["getUserById", "validateEmail", "transformUserData"]
      bad: ["user", "email", "data"]

  classes:
    format: "noun, represents a concept or entity"
    examples:
      good: ["UserAuthenticator", "PaymentProcessor", "DatabaseConnection"]
      bad: ["Helper", "Utility", "Manager"]

  constants:
    format: "SCREAMING_SNAKE_CASE for true constants"
    examples:
      good: ["MAX_RETRY_ATTEMPTS", "API_BASE_URL", "DEFAULT_TIMEOUT"]
      bad: ["maxRetry", "apiUrl", "timeout"]
```

### Test-Driven Development (TDD)

#### Universal TDD Guidelines

```yaml
tdd_workflow:
  red_phase:
    rule: "Write failing test first"
    validation: "Test should fail for the right reason"

  green_phase:
    rule: "Write minimal code to make test pass"
    validation: "No additional functionality beyond test requirements"

  refactor_phase:
    rule: "Improve code quality while keeping tests green"
    validation: "All tests still pass after refactoring"

test_structure:
  naming: "describe what is being tested and expected outcome"
  arrangement: "Set up test data and dependencies"
  action: "Execute the code under test"
  assertion: "Verify expected behavior"
```

**Example TDD Implementation**:

```typescript
// ❌ WRONG: Implementation first
function calculateDiscount(price: number, percentage: number): number {
  return price * (percentage / 100);
}

// ✅ CORRECT: Test first
describe("calculateDiscount", () => {
  it("should apply percentage discount to price", () => {
    // Arrange
    const price = 100;
    const percentage = 20;

    // Act
    const result = calculateDiscount(price, percentage);

    // Assert
    expect(result).toBe(20);
  });

  it("should handle zero discount", () => {
    expect(calculateDiscount(100, 0)).toBe(0);
  });

  it("should throw error for negative price", () => {
    expect(() => calculateDiscount(-100, 20)).toThrow(
      "Price cannot be negative"
    );
  });
});

// Implementation comes after tests pass
```

### Search and Development Tools

#### Required Tool Usage

**Search Commands (ALL Projects)**:

```bash
# ❌ WRONG: Traditional tools
grep -r "pattern" .
find . -name "*.js"

# ✅ CORRECT: Use ripgrep (rg) for better performance
rg "pattern"                    # Search content
rg --files -g "*.js"           # Find files by pattern
rg --type typescript "function" # Search by file type
rg -A 3 -B 3 "pattern"         # Context lines
```

**Enforcement Rules**:

```yaml
tool_requirements:
  search:
    forbidden: ["grep", "find -name"]
    required: ["rg (ripgrep)"]
    reason: "Better performance, Unicode support, automatic gitignore handling"

  file_operations:
    preferred: ["native language tools", "IDE features"]
    fallback: ["command line with explicit confirmation"]
```

### Code Review Quality Gates

#### Universal Review Checklist

```yaml
code_review_standards:
  architecture:
    - [ ] Follows SOLID principles
    - [ ] Single responsibility maintained
    - [ ] Dependencies properly injected
    - [ ] No circular dependencies

  readability:
    - [ ] Function/method names clearly describe purpose
    - [ ] Variable names are descriptive
    - [ ] Code is self-documenting
    - [ ] Complex logic has explanatory comments

  testing:
    - [ ] New functionality has corresponding tests
    - [ ] Tests follow AAA pattern (Arrange, Act, Assert)
    - [ ] Edge cases are covered
    - [ ] Tests are deterministic and isolated

  documentation:
    - [ ] Public APIs have JSDoc/docstring comments
    - [ ] Complex algorithms are explained
    - [ ] Usage examples provided for non-trivial functions
    - [ ] README updated if public interface changes

  performance:
    - [ ] No obvious performance bottlenecks
    - [ ] Efficient algorithms chosen
    - [ ] Memory leaks prevented
    - [ ] Resource cleanup implemented

  security:
    - [ ] Input validation implemented
    - [ ] No hardcoded secrets
    - [ ] Error messages don't leak sensitive information
    - [ ] Authentication/authorization enforced
```

### Continuous Integration Standards

#### Universal CI/CD Quality Gates

```yaml
build_pipeline_requirements:
  static_analysis:
    linting: "Must pass with zero warnings"
    type_checking: "Strict mode enabled, must pass"
    security_scanning: "No high/critical vulnerabilities"
    code_coverage: "Minimum 80% line coverage"

  testing:
    unit_tests: "All tests must pass"
    integration_tests: "Critical paths covered"
    performance_tests: "No regression beyond 10%"

  documentation:
    api_docs: "Must be generated and up-to-date"
    readme: "Installation and usage instructions current"
    changelog: "Updated for user-facing changes"
```

## Language-Specific Implementations

### Frontend Standards Reference

- Stylesheet separation (styles/ folder)
- Lazy loading implementation
- Bundle optimization
- Performance metrics
- See: `frontend_best_practices.md`

### Backend Standards Reference

- Database access patterns (Repository pattern)
- API design principles
- Security implementations
- See: `database_best_practices.md`

### DevOps Standards Reference

- Environment management (DEV→QA→UAT→PROD)
- Deployment automation
- Monitoring and observability
- See: `devops_best_practices.md`

## Validation Commands

### Universal Code Quality Checks

```bash
# Documentation validation
rg "TODO|FIXME|HACK" --type-not=markdown  # Find unresolved items

# Code complexity checks
rg "if.*if.*if" .                         # Deeply nested conditions
rg "function.*{[\s\S]{2000,}}"           # Large functions (varies by language)

# Architecture validation
rg "import.*\.\./\.\./\.\."              # Deep import chains
rg "class.*extends.*extends"             # Deep inheritance

# Security checks
rg "password.*=|token.*=" --type-not=test # Hardcoded secrets
rg "console\.log|print\(" --type=typescript # Debug statements in production
```

## Anti-Patterns to Avoid

### Universal Anti-Patterns

```typescript
// ❌ WRONG: God class/function
class UserManager {
  validateUser() {
    /* 50 lines */
  }
  saveUser() {
    /* 40 lines */
  }
  sendEmail() {
    /* 30 lines */
  }
  generateReport() {
    /* 60 lines */
  }
  // 200+ lines total
}

// ✅ CORRECT: Single responsibility
class UserValidator {
  /* focused validation logic */
}
class UserRepository {
  /* focused data access */
}
class EmailService {
  /* focused email operations */
}
class ReportGenerator {
  /* focused reporting */
}

// ❌ WRONG: Deep nesting
if (user) {
  if (user.isActive) {
    if (user.hasPermission) {
      if (user.subscription) {
        // Logic buried 4 levels deep
      }
    }
  }
}

// ✅ CORRECT: Early returns
if (!user) return null;
if (!user.isActive) return null;
if (!user.hasPermission) return null;
if (!user.subscription) return null;
// Main logic at top level

// ❌ WRONG: Magic numbers/strings
if (status === 3) {
  /* ... */
}
setTimeout(callback, 300000);

// ✅ CORRECT: Named constants
const STATUS_APPROVED = 3;
const FIVE_MINUTES_IN_MS = 5 * 60 * 1000;

if (status === STATUS_APPROVED) {
  /* ... */
}
setTimeout(callback, FIVE_MINUTES_IN_MS);
```

This comprehensive guide ensures consistent code quality across all technologies while maintaining language-specific optimizations and patterns.
