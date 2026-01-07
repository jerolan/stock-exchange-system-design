---
name: Dependency Composition Guidelines
description: Apply dependency composition principles inspired by Martin Fowler’s Dependency Composition article.
applyTo: "**/*.ts,!**/*.tsx"
---

# Dependency Composition Guidelines

These instructions define how to design code using **dependency composition** instead of framework-driven dependency injection.

The primary goals are:

- Minimize incidental coupling
- Improve testability
- Keep business logic independent from infrastructure

All examples below are **illustrative patterns**, not framework-specific implementations.

---

## Core Principle: Dependencies Are Inputs

### Rule

All dependencies must be passed **explicitly** as parameters.

❌ Avoid hidden dependencies:

- Global variables
- Singletons
- Framework lookups
- Static imports with side effects

✅ Prefer explicit dependency parameters.

---

## Example 1: Business Logic Without Composition (Anti-Pattern)

```ts
// ❌ Hard to test, tightly coupled to infrastructure
export async function createUser(email: string) {
  const db = Database.getInstance();
  const logger = Logger.global();

  await db.insert({ email });
  logger.info("User created");
}
```

Problems:

- Dependencies are implicit
- Cannot run without database and logger
- Difficult to substitute in tests

---

## Example 2: Business Logic With Dependency Composition

```ts
// ✅ Business logic declares what it needs
type CreateUserDeps = {
  insertUser: (email: string) => Promise<void>;
  log: (message: string) => void;
};

export const createUser =
  ({ insertUser, log }: CreateUserDeps) =>
  async (email: string) => {
    await insertUser(email);
    log("User created");
  };
```

Characteristics:

- No knowledge of databases, ORMs, or loggers
- Dependencies are visible at the function boundary
- Easy to test and reuse

---

## Example 3: Composition at the Application Boundary

```ts
// Infrastructure implementations
const insertUser = async (email: string) => {
  await db.users.insert({ email });
};

const log = (message: string) => {
  console.log(message);
};

// Composition root
export const createUserHandler = createUser({
  insertUser,
  log,
});
```

Rules applied:

- Dependencies are wired **once**
- Composition happens outside business logic
- Business logic remains pure and portable

---

## Example 4: Unit Testing With No Framework Setup

```ts
import { createUser } from "./createUser";

test("creates a user", async () => {
  const insertUser = jest.fn();
  const log = jest.fn();

  const handler = createUser({ insertUser, log });

  await handler("test@example.com");

  expect(insertUser).toHaveBeenCalledWith("test@example.com");
  expect(log).toHaveBeenCalled();
});
```

Benefits:

- No database
- No mocks tied to frameworks
- Tests are simple function calls

---

## Partial Application Guidelines

### Rule

Bind dependencies **early**, then pass around specialized functions.

❌ Avoid this:

```ts
function processRequest(deps, req) {
  return createUser(deps)(req.email);
}
```

✅ Prefer this:

```ts
const handleRequest = createUser(deps);

// later
handleRequest(req.email);
```

---

## Narrow Dependency Interfaces

### Rule

Pass **only what is needed**, never full services.

❌ Avoid:

```ts
createUser({ database, logger });
```

✅ Prefer:

```ts
createUser({
  insertUser: database.users.insert,
  log: logger.info,
});
```

This prevents:

- Accidental coupling
- Unused dependencies
- Leaky abstractions

---

## Acceptable Use of Classes (When Needed)

Classes may be used when:

- Stateful lifecycle matters
- Identity is required

Even then:

```ts
class UserService {
  constructor(
    private readonly insertUser: InsertUser,
    private readonly log: Log
  ) {}

  async create(email: string) {
    await this.insertUser(email);
    this.log("User created");
  }
}
```

Rules:

- No container lookups inside the class
- Dependencies injected explicitly
- Class remains framework-agnostic

---

## Composition Root Rules

- Perform dependency wiring in:

  - Application startup
  - Route definitions
  - Entry points

- Keep composition code small and replaceable
- Never compose dependencies deep inside business modules

---

## Anti-Patterns to Avoid

- Service locators
- Framework annotations that hide wiring
- Passing large dependency objects
- Constructors with unused parameters
- Mixing business logic with HTTP, database, or logging concerns

---

## Design Review Checklist

Generated or reviewed code should satisfy:

- Dependencies are visible at the boundary
- Business logic can run without infrastructure
- Tests do not require environment setup
- Composition happens in one place
- Infrastructure is replaceable

---

## Expected Outcome

Following these rules should produce code that is:

- Easier to test
- Easier to refactor
- Explicit in intent
- Resistant to framework lock-in
