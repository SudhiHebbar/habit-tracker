# Architecture Patterns Reference Guide

> **Purpose:** Reference guide for architecture patterns and their gotchas to be used in PRP templates.
> **Source:** Based on enterprise architecture patterns and clean code principles.

## Architecture Patterns Quick Reference

| **Pattern**                  | **Best For**                                | **Key Gotchas**                                                    |
| ---------------------------- | ------------------------------------------- | ------------------------------------------------------------------ |
| Layered (N-Tier)             | Well-understood domains, clear separation   | Don't skip layers; avoid data access in presentation layer         |
| Modular Monolith             | Single team, simpler ops than microservices | Enforce module boundaries strictly; prevent circular dependencies  |
| Microservices                | Multiple teams, independent scaling         | Avoid distributed monolith; handle network failures gracefully     |
| Event-Driven                 | Real-time flows, decoupled components       | Handle event ordering and duplicates; embrace eventual consistency |
| Hexagonal (Ports & Adapters) | Highly testable, framework-independent      | Don't create leaky abstractions; keep core logic pure              |
| CQRS & Event Sourcing        | Audit requirements, temporal queries        | Separate read/write models completely; version events carefully    |
| Serverless / FaaS            | Variable load, minimal ops overhead         | Watch for cold starts; design for statelessness                    |

## Implementation Gotchas by Pattern

### Layered Architecture

```yaml
critical_rules:
  - layer_communication: "Only communicate with adjacent layers"
  - separation_of_concerns: "Each layer has distinct responsibility"
  - dependency_direction: "Dependencies flow in one direction (usually downward)"

common_mistakes:
  - data_access_in_ui: "Putting database queries in presentation layer"
  - business_logic_in_data: "Business rules in stored procedures or DAL"
  - layer_skipping: "UI calling data layer directly"

validation_points:
  - check_dependencies: "Verify layer dependencies don't violate architecture"
  - test_isolation: "Can you test business logic without database?"
```

### Microservices Architecture

```yaml
critical_rules:
  - service_autonomy: "Each service owns its data and decisions"
  - failure_isolation: "Service failures don't cascade"
  - communication_patterns: "Async messaging preferred over sync calls"

common_mistakes:
  - distributed_monolith: "Services too tightly coupled"
  - shared_database: "Multiple services sharing same database"
  - chatty_interfaces: "Too many fine-grained service calls"

validation_points:
  - service_boundaries: "Can service be developed/deployed independently?"
  - data_ownership: "Does service own all data it needs?"
  - failure_handling: "What happens when dependencies fail?"
```

### Event-Driven Architecture

```yaml
critical_rules:
  - event_immutability: "Events are facts - never change them"
  - idempotency: "Processing same event multiple times has same effect"
  - eventual_consistency: "Accept that data won't be immediately consistent"

common_mistakes:
  - event_coupling: "Events containing implementation details"
  - missing_correlation: "No way to trace related events"
  - ordering_assumptions: "Assuming events arrive in order"

validation_points:
  - event_schema: "Are events versioned and backward compatible?"
  - duplicate_handling: "What happens if event is processed twice?"
  - dead_letter_queue: "How are failed events handled?"
```

### Hexagonal (Ports & Adapters)

```yaml
critical_rules:
  - core_isolation: "Business logic has no external dependencies"
  - port_definition: "Ports define what core needs, not how it's provided"
  - adapter_responsibility: "Adapters translate between core and external world"

common_mistakes:
  - leaky_abstractions: "Core logic depending on adapter details"
  - infrastructure_in_core: "Database models in business logic"
  - multiple_concerns: "Single adapter handling multiple responsibilities"

validation_points:
  - core_purity: "Can core logic run without any adapters?"
  - port_clarity: "Are port interfaces clear and stable?"
  - adapter_swapping: "Can adapters be replaced without changing core?"
```

## Clean Code Architecture Principles

### SOLID Principles Application

```yaml
single_responsibility:
  architecture_level: "Each service/module has one reason to change"
  component_level: "Each class/function does one thing well"
  validation: "If you need 'and' to describe it, probably violates SRP"

open_closed:
  architecture_level: "Add features through new modules, not modifications"
  component_level: "Extend behavior through interfaces and composition"
  validation: "Can add features without modifying existing code?"

liskov_substitution:
  architecture_level: "Services can be swapped if they implement same contract"
  component_level: "Subtypes must be substitutable for base types"
  validation: "Does substitution break expected behavior?"

interface_segregation:
  architecture_level: "Services don't depend on capabilities they don't use"
  component_level: "Avoid fat interfaces with many unrelated methods"
  validation: "Are interfaces focused on specific capabilities?"

dependency_inversion:
  architecture_level: "High-level policies don't depend on low-level details"
  component_level: "Depend on abstractions, not concretions"
  validation: "Are dependencies pointing toward stable abstractions?"
```

### DRY (Don't Repeat Yourself)

```yaml
architecture_level:
  - shared_libraries: "Common utilities in shared packages"
  - configuration: "Centralized configuration management"
  - patterns: "Consistent patterns across services/modules"

component_level:
  - utility_functions: "Extract common operations"
  - constants: "Centralize magic numbers and strings"
  - validation_logic: "Reusable validation functions"

validation:
  - identify_duplication: "Same logic in multiple places?"
  - extract_appropriately: "Is abstraction at right level?"
  - avoid_over_dry: "Don't extract if it hurts readability"
```

## Technology Stack Gotchas

### Frontend Architecture

```yaml
react_nextjs:
  hydration_mismatch:
    problem: "Server/client render different content"
    solution: "Ensure deterministic rendering, use suppressHydrationWarning sparingly"

  server_components:
    problem: "Cannot use browser APIs or event handlers"
    solution: "Use 'use client' directive when needed, but prefer server components"

  state_management:
    problem: "Prop drilling and scattered state"
    solution: "Use React Context, Zustand, or Redux for global state"

vue_nuxt:
  reactivity_pitfalls:
    problem: "Reactivity loss with destructuring"
    solution: "Use toRefs() when destructuring reactive objects"

  composition_api:
    problem: "Incorrect ref/reactive usage"
    solution: "Use ref() for primitives, reactive() for objects"
```

### Backend Architecture

```yaml
nodejs_express:
  async_error_handling:
    problem: "Unhandled promise rejections crash app"
    solution: "Use async error middleware or express-async-errors"

  middleware_order:
    problem: "Authentication runs after route handlers"
    solution: "Register middleware in correct order - auth before routes"

python_fastapi:
  dependency_injection:
    problem: "Incorrect use of Depends() decorator"
    solution: "Use Depends() for dependency injection, not direct instantiation"

  async_consistency:
    problem: "Mixing sync/async database operations"
    solution: "Use async/await consistently throughout async routes"

dotnet_aspnet:
  dependency_injection:
    problem: "Incorrect service lifetime (Singleton/Scoped/Transient)"
    solution: "Understand DI container lifecycles and choose appropriately"

  configuration:
    problem: "Hard-coded configuration values"
    solution: "Use IConfiguration and IOptions pattern"
```

### Database Architecture

```yaml
relational_databases:
  n_plus_1_queries:
    problem: "Separate query for each related entity"
    solution: "Use eager loading, joins, or projection queries"

  indexing_strategy:
    problem: "Poor query performance or slow writes"
    solution: "Index frequently queried columns, avoid over-indexing"

  transaction_scope:
    problem: "Long-running transactions cause deadlocks"
    solution: "Keep transactions short and focused"

nosql_databases:
  data_modeling:
    problem: "Relational mindset in document database"
    solution: "Model for your access patterns, denormalize appropriately"

  consistency_models:
    problem: "Expecting immediate consistency"
    solution: "Design for eventual consistency, use appropriate consistency levels"
```

## Validation Checklist by Pattern

### Universal Architecture Validation

- [ ] **Single Responsibility:** Does each component have one clear purpose?
- [ ] **Loose Coupling:** Can components be changed independently?
- [ ] **High Cohesion:** Are related functionalities grouped together?
- [ ] **Dependency Direction:** Do dependencies flow toward stable abstractions?
- [ ] **Failure Isolation:** Do failures in one area cascade to others?
- [ ] **Testability:** Can components be tested in isolation?
- [ ] **Performance:** Does architecture support performance requirements?
- [ ] **Scalability:** Can architecture handle expected growth?
- [ ] **Security:** Are security concerns addressed at appropriate layers?
- [ ] **Maintainability:** Will this be easy to modify and extend?

### Pattern-Specific Validation

```yaml
# Use these checklists based on your architecture pattern
layered:
  - [ ] "Layer boundaries clearly defined and enforced"
  - [ ] "No layer-skipping dependencies"
  - [ ] "Each layer testable independently"

microservices:
  - [ ] "Service boundaries align with business capabilities"
  - [ ] "Services can be deployed independently"
  - [ ] "Failure handling and circuit breakers in place"

event_driven:
  - [ ] "Events are immutable and well-versioned"
  - [ ] "Idempotent event processing"
  - [ ] "Dead letter queue handling"

hexagonal:
  - [ ] "Core logic has no infrastructure dependencies"
  - [ ] "Ports clearly define external contracts"
  - [ ] "Adapters can be swapped without core changes"
```

---

## Quick Decision Matrix

**Use this to quickly identify the right pattern for your feature:**

| **Requirement**               | **Recommended Pattern**      | **Alternative**         |
| ----------------------------- | ---------------------------- | ----------------------- |
| Simple CRUD with clear layers | Layered Architecture         | Hexagonal               |
| High testability required     | Hexagonal (Ports & Adapters) | Layered with DI         |
| Independent team deployments  | Microservices                | Modular Monolith        |
| Real-time event processing    | Event-Driven                 | Reactive/Streaming      |
| Audit trail requirements      | Event Sourcing + CQRS        | Event-Driven            |
| Variable/unpredictable load   | Serverless/FaaS              | Auto-scaling Containers |
| Legacy system integration     | Service-Oriented (SOA)       | Event-Driven            |
| Extreme performance needs     | Space-Based (Grid)           | Reactive                |

---

_This guide should be referenced in PRP templates to ensure architecture decisions align with established patterns and avoid common pitfalls._
