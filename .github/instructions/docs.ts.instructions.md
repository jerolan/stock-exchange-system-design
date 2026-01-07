---
description: "JSDoc documentation rules and best practices for TypeScript codebases."
applyTo: "**/*.ts"
---

# JSDoc Documentation Instructions for TypeScript Codebases

## Purpose

This guide outlines best practices for creating, adding, and refining JSDoc comments in TypeScript projects.

## Guidelines

- **Scope:** Focus exclusively on JSDoc comments. Do not alter code logic.
- **Clarity:** Ensure all documentation is concise, clear, and accurate for developers.
- **Consistency:** Maintain consistent style and terminology throughout the codebase.
- **Coverage:**
  - Document all public methods, classes, interfaces, and types.
  - Include descriptions for parameters, return values, exceptions, and remarks.
  - Add usage examples where beneficial.
- **Best Practices:**
  - Use standard JSDoc tags (e.g., `@param`, `@returns`, `@throws`, `@example`).
  - Avoid redundancy and unnecessary complexity.
  - Ensure documentation aligns with TypeScript and JSDoc standards.

## Example

````typescript
/**
 * Calculates the sum of two numbers.
 * @param a - The first number.
 * @param b - The second number.
 * @returns The sum of `a` and `b`.
 * @example
 * ```typescript
 * const result = add(2, 3); // 5
 * ```
 */
function add(a: number, b: number): number {
  return a + b;
}
````

## Supported JSDoc Constructs in TypeScript and JavaScript

### Overview

This reference outlines which JSDoc annotations are supported for providing type information in JavaScript and TypeScript files.

- Only documentation tags are supported in TypeScript files. Type-related tags are fully supported in JavaScript files.
- Tags not listed here (e.g., `@async`) are not yet supported.

### Supported Tags

#### Types

- `@type`
- `@import`
- `@param` (also `@arg`, `@argument`)
- `@returns` (also `@return`)
- `@typedef`
- `@callback`
- `@template`
- `@satisfies`

##### Examples

```js
/** @type {string} */
var s;
/** @type {number[]} */
var ns;
/**
 * @param {string} p1 - A string param.
 * @returns {string}
 */
function example(p1) {
  return p1;
}
```

#### Classes

- Property Modifiers: `@public`, `@private`, `@protected`, `@readonly`
- `@override`
- `@extends` (also `@augments`)
- `@implements`
- `@class` (also `@constructor`)
- `@this`

##### Example

```js
class Car {
  /** @private */
  identifier = 100;
}
```

#### Documentation

- `@deprecated`
- `@see`
- `@link`

#### Other

- `@enum`
- `@author`

### Supported Patterns

- JSDoc on property assignments, variable assignments, class methods, arrow functions, and function components.
- Rest arguments: `@param {...string} p1`
- Constructor parameter types: `@param {{new(...args: any[]): object}} C`

### Unsupported Patterns and Tags

- Tags not listed above are not supported (e.g., `@memberof`, `@yields`, `@member`).
- Postfix equals on property types in object literals is not supported; use `?` for optional properties.
- Nullable types require `strictNullChecks` for full support.
- TypeScript ignores unsupported JSDoc tags.

### Type Aliases

- Common legacy aliases are supported for compatibility (e.g., `String` → `string`, `Number` → `number`).

## Remarks

- Prioritize documenting complex or non-obvious logic.
- Keep comments up to date with code changes.
- Review and refine documentation regularly.
- Use the [TypeScript playground](https://www.typescriptlang.org/play) to explore JSDoc support.
- Refer to [jsdoc.app](https://jsdoc.app/) for general JSDoc documentation.
