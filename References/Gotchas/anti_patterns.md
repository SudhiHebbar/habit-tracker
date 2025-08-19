# Anti-Patterns & Architecture Gotchas Reference

> **Purpose:** Comprehensive guide to avoid common mistakes across code quality, architecture patterns, and technology stacks.

## Universal Anti-Patterns (Any Language/Stack)

### Code Quality & Clean Code Violations

- ❌ **God Objects/Functions**: Don't create components that do too many things (violates SRP)
- ❌ **Copy-Paste Programming**: Don't duplicate logic - extract to shared utilities (violates DRY)
- ❌ **Magic Numbers/Strings**: Don't hardcode values that should be configurable
- ❌ **Premature Optimization**: Don't optimize before identifying actual bottlenecks
- ❌ **Error Swallowing**: Don't catch exceptions without proper handling or logging
- ❌ **Ignoring Test Failures**: Don't skip/mock tests to make them pass - fix the underlying issue

### Architecture & Design Violations

- ❌ **Circular Dependencies**: Don't create modules that depend on each other
- ❌ **Layer Violations**: Don't skip architectural layers or create shortcuts
- ❌ **Tight Coupling**: Don't make components dependent on implementation details
- ❌ **Interface Pollution**: Don't create fat interfaces with unrelated methods (violates ISP)
- ❌ **Dependency Inversion Violation**: Don't make high-level modules depend on low-level details

### Development Process Anti-Patterns

- ❌ **Big Bang Integration**: Don't integrate everything at once - use incremental integration
- ❌ **No Code Review**: Don't merge code without peer review
- ❌ **Configuration in Code**: Don't hardcode environment-specific values
- ❌ **Security as Afterthought**: Don't add security measures after development
- ❌ **Documentation Drift**: Don't let documentation become outdated

---

## Architecture Pattern Specific Anti-Patterns

### Layered Architecture Violations

```yaml
layer_skipping:
  - problem: "UI directly calling database layer"
  - solution: "Enforce layer boundaries - UI → Business → Data"
  - validation: "Check import statements for layer violations"

business_logic_leakage:
  - problem: "Database procedures containing business rules"
  - solution: "Keep business logic in business layer, not data layer"
  - validation: "Review stored procedures for business logic"

presentation_concerns_in_business:
  - problem: "Business layer handling UI formatting"
  - solution: "Business layer returns raw data, UI handles presentation"
  - validation: "Business layer shouldn't know about UI formats"
```

### Microservices Anti-Patterns

```yaml
distributed_monolith:
  - problem: "Services too tightly coupled - all must deploy together"
  - solution: "Design for independent deployability"
  - validation: "Can each service be deployed independently?"

shared_database:
  - problem: "Multiple services accessing same database tables"
  - solution: "Each service owns its data, communicate via APIs"
  - validation: "Database access should be service-private"

chatty_interfaces:
  - problem: "Multiple fine-grained calls between services"
  - solution: "Design coarser-grained APIs, batch operations"
  - validation: "Monitor network calls between services"

data_consistency_assumptions:
  - problem: "Expecting immediate consistency across services"
  - solution: "Design for eventual consistency"
  - validation: "Test with network delays and failures"
```

### Event-Driven Architecture Anti-Patterns

```yaml
event_coupling:
  - problem: "Events containing implementation details"
  - solution: "Events should be business facts, not technical events"
  - validation: "Events should make sense to business stakeholders"

missing_idempotency:
  - problem: "Processing same event multiple times has different effects"
  - solution: "Design event handlers to be idempotent"
  - validation: "Test processing same event multiple times"

event_ordering_assumptions:
  - problem: "Assuming events arrive in specific order"
  - solution: "Design for out-of-order event processing"
  - validation: "Test with events in different orders"

no_error_handling:
  - problem: "No dead letter queue or error recovery"
  - solution: "Implement dead letter queues and retry mechanisms"
  - validation: "Test what happens when event processing fails"
```

### Hexagonal Architecture Anti-Patterns

```yaml
leaky_abstractions:
  - problem: "Core logic depending on adapter implementation details"
  - solution: "Core should only depend on port interfaces"
  - validation: "Can core logic run without any adapters?"

infrastructure_in_core:
  - problem: "Database entities or framework code in business logic"
  - solution: "Use domain models in core, map at adapter boundaries"
  - validation: "Core should have no framework dependencies"

multiple_responsibilities_in_adapter:
  - problem: "Single adapter handling multiple concerns"
  - solution: "One adapter per external concern (database, messaging, etc.)"
  - validation: "Adapters should have single responsibility"
```

---

## Technology Stack Specific Anti-Patterns

### Frontend Anti-Patterns

```yaml
react_nextjs:
  hydration_mismatch:
    - problem: "Server and client render different content"
    - solution: "Ensure deterministic rendering, avoid client-only code in SSR"
    - validation: "Check console for hydration warnings"

  unnecessary_use_client:
    - problem: "Using 'use client' when server components would work"
    - solution: "Prefer server components, only use client when needed"
    - validation: "Audit 'use client' usage for necessity"

  prop_drilling:
    - problem: "Passing props through many component levels"
    - solution: "Use React Context, state management, or component composition"
    - validation: "Look for props passed through without use"

  inline_styles:
    - problem: "Styles defined within TypeScript/JavaScript files"
    - solution: "Move all styles to separate files in styles/ folder"
    - validation: "No style objects or CSS-in-JS in component files"

  eager_component_loading:
    - problem: "Loading all components at application start"
    - solution: "Implement route-level and component-level lazy loading"
    - validation: "Bundle analysis should show code splitting"

vue_nuxt:
  reactivity_loss:
    - problem: "Destructuring reactive objects loses reactivity"
    - solution: "Use toRefs() when destructuring reactive objects"
    - validation: "Test reactivity after destructuring"

  wrong_ref_usage:
    - problem: "Using ref() for complex objects or reactive() for primitives"
    - solution: "ref() for primitives, reactive() for objects"
    - validation: "Review ref/reactive usage patterns"

  inline_styles:
    - problem: "Styles defined within Vue component script sections"
    - solution: "Use external stylesheet files with src attribute"
    - validation: "No style objects in script setup or methods"

  component_eager_loading:
    - problem: "Importing all components in main bundle"
    - solution: "Use defineAsyncComponent for heavy components"
    - validation: "Bundle analysis shows component-level splitting"
```

### Backend Anti-Patterns

```yaml
nodejs_express:
  unhandled_async_errors:
    - problem: "Async errors not caught by express error handlers"
    - solution: "Use async error middleware or express-async-errors"
    - validation: "Test error handling in async routes"

  middleware_order_issues:
    - problem: "Authentication middleware after route handlers"
    - solution: "Register middleware in correct order"
    - validation: "Review middleware registration order"

python_fastapi:
  sync_async_mixing:
    - problem: "Using sync database calls in async routes"
    - solution: "Use async database drivers consistently"
    - validation: "Audit database calls for sync/async consistency"

  incorrect_dependency_injection:
    - problem: "Not using Depends() for dependency injection"
    - solution: "Use FastAPI's DI system with Depends()"
    - validation: "Review parameter injection patterns"

dotnet_aspnet:
  wrong_service_lifetime:
    - problem: "Using Singleton for stateful services"
    - solution: "Understand DI lifetimes: Singleton/Scoped/Transient"
    - validation: "Review service registrations for appropriate lifetime"

  configuration_hardcoding:
    - problem: "Hard-coded configuration values"
    - solution: "Use IConfiguration and IOptions pattern"
    - validation: "Search for hard-coded connection strings/URLs"
```

### Database Anti-Patterns

```yaml
n_plus_1_queries:
  - problem: "Separate query for each related entity"
  - solution: "Use eager loading, joins, or batch queries"
  - validation: "Monitor database query patterns"

over_indexing:
  - problem: "Too many indexes slowing down writes"
  - solution: "Index only frequently queried columns"
  - validation: "Monitor write performance and index usage"

long_running_transactions:
  - problem: "Transactions held open too long"
  - solution: "Keep transactions short and focused"
  - validation: "Monitor transaction duration and lock contention"

inappropriate_nosql_modeling:
  - problem: "Using relational patterns in document databases"
  - solution: "Model for access patterns, denormalize appropriately"
  - validation: "Review query patterns and data model alignment"
```

---

## Best Practices by Category

### Clean Code Practices

```yaml
single_responsibility:
  - ✅ "Each class/function has one reason to change"
  - ✅ "Components have focused, well-defined purposes"
  - validation: "Can you describe function without using 'and'?"

dry_principle:
  - ✅ "Extract common logic into utilities"
  - ✅ "Use constants for repeated values"
  - validation: "Search for duplicated logic patterns"

clear_naming:
  - ✅ "Use intention-revealing names"
  - ✅ "Avoid abbreviations and mental mapping"
  - validation: "Names should be self-explanatory"
```

### Architecture Practices

```yaml
loose_coupling:
  - ✅ "Components depend on abstractions, not concretions"
  - ✅ "Changes in one component don't require changes in others"
  - validation: "Can components be tested in isolation?"

high_cohesion:
  - ✅ "Related functionality grouped together"
  - ✅ "Components have clear, focused responsibilities"
  - validation: "Does component functionality belong together?"

dependency_direction:
  - ✅ "Dependencies flow toward stable abstractions"
  - ✅ "High-level policies don't depend on low-level details"
  - validation: "Check dependency graphs for violations"
```

### Security Practices

```yaml
input_validation:
  - ✅ "Validate all inputs at system boundaries"
  - ✅ "Use parameterized queries to prevent injection"
  - validation: "Test with malicious inputs"

least_privilege:
  - ✅ "Grant minimum necessary permissions"
  - ✅ "Use role-based access control"
  - validation: "Review permission grants regularly"

defense_in_depth:
  - ✅ "Multiple layers of security controls"
  - ✅ "Don't rely on single security mechanism"
  - validation: "Test security with multiple attack vectors"
```

---

## Validation Checklist by Pattern Type

### Code Quality Validation

- [ ] **Single Responsibility**: Does each component have one clear purpose?
- [ ] **DRY Compliance**: Is logic duplicated anywhere?
- [ ] **Clear Naming**: Are names self-explanatory?
- [ ] **Error Handling**: Are errors handled appropriately?
- [ ] **Test Coverage**: Are critical paths tested?

### Architecture Pattern Validation

- [ ] **Pattern Compliance**: Does implementation follow chosen pattern?
- [ ] **Boundary Enforcement**: Are architectural boundaries respected?
- [ ] **Dependency Direction**: Do dependencies flow correctly?
- [ ] **Coupling**: Are components loosely coupled?
- [ ] **Cohesion**: Is related functionality grouped together?

### Technology Stack Validation

- [ ] **Framework Patterns**: Are framework-specific patterns followed?
- [ ] **Performance**: Are there obvious performance issues?
- [ ] **Security**: Are security best practices followed?
- [ ] **Configuration**: Is configuration properly externalized?
- [ ] **Error Handling**: Are stack-specific error patterns used?

---

_This reference should be consulted during implementation to avoid common pitfalls and ensure high-quality, maintainable code that follows established patterns and principles._

- ✅ Use parameterized queries
- ✅ Implement proper authentication/authorization
- ✅ Keep dependencies updated
- ✅ Follow principle of least privilege

### Performance

- ✅ Profile before optimizing
- ✅ Cache appropriately
- ✅ Use efficient algorithms and data structures
- ✅ Optimize database queries
- ✅ Consider memory usage patterns
