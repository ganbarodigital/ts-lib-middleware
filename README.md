# Middleware for Typescript

## Introduction

This TypeScript library provides an Express/Ware-style middleware that:

* is safely typed, and
* supports async / Promises

- [Introduction](#introduction)
- [Quick Start](#quick-start)
- [API](#api)
  - [AsyncMiddleware](#asyncmiddleware)
  - [AsyncMiddlewareStack](#asyncmiddlewarestack)
  - [Middleware](#middleware)
  - [MiddlewareStack](#middlewarestack)
- [Errors](#errors)
  - [MiddlewareReturnedNoValueError](#middlewarereturnednovalueerror)
- [NPM Scripts](#npm-scripts)
  - [npm run clean](#npm-run-clean)
  - [npm run build](#npm-run-build)
  - [npm run test](#npm-run-test)
  - [npm run cover](#npm-run-cover)

## Quick Start

```
# run this from your Terminal
npm install @ganbarodigital/ts-lib-middleware
```

```typescript
// add this import to your Typescript code
import { MiddlewareStack } from "@ganbarodigital/ts-lib-middleware/lib/v1"
```

__VS Code users:__ once you've added a single import anywhere in your project, you'll then be able to auto-import anything else that this library exports.

## API

### AsyncMiddleware

```typescript
import { OnError } from "@ganbarodigital/ts-lib-error-reporting/lib/v1";

/**
 * type-signature for an individual piece of Middleware
 */
export type AsyncMiddleware<I, O>
    = (input: I, next: AsyncMiddleware<I, O>, onError: OnError) => Promise<O>;
```

`AsyncMiddleware` is a _function signature_. Use this to define the type of function that your `AsyncMiddlewareStack` will accept.

For example:

```typescript
export type PrefetchAction = AsyncMiddleware<URL, void>;
```

### AsyncMiddlewareStack

```typescript
// how to import into your own code
import {
    AsyncMiddlewareStack,
} from "@ganbarodigital/ts-lib-middleware/lib/v1;

// types used for parameters, return types and errors
import {
    AsyncMiddleware,
    AsyncMiddlewareReturnedNoValueError
} from "@ganbarodigital/ts-lib-middleware/lib/v1;
import { OnError, THROW_THE_ERROR } from "@ganbarodigital/ts-lib-error-reporting/lib/v1";

/**
 * a collection of middleware to be executed asynchronously
 *
 * - <I> is the input type that the middleware must accept
 * - <O> is the return type that the middleware must provide after the
 *       Promise is resolved
 */
export class AsyncMiddlewareStack<I, O> {
    /**
     * add one or more pieces of middleware to this AsyncMiddlewareStack
     *
     * Middleware is executed in the order that you add it to the stack
     */
    public constructor(name: string, ...fns: Array<AsyncMiddleware<I, O>>);

    /**
     * Execute the middleware that's on the stack, and return the result.
     * We execute the middleware in the order that it was added to this
     * stack. (IE first item added is the first item we run).
     *
     * Each piece of middleware either:
     *
     * - returns a return value of its own, or
     * - throws an error, or
     * - passes the (probably modified) input on to the next piece of
     *   middleware in the stack
     */
    public async run(input: I, onError: OnError = THROW_THE_ERROR): Promise<O>;

    /**
     * what is this AsyncMiddlewareStack called?
     */
    public getName(): string;

    /**
     * what are the contents of the internal stack?
     */
    public getStack(): Array<AsyncMiddleware<I, O>>;
}
```

`AsyncMiddlewareStack` is an immutable _value type_. It holds and asynchronously executes a list of functions, known as _middleware_.

### Middleware

```typescript
import { OnError } from "@ganbarodigital/ts-lib-error-reporting/lib/v1";

/**
 * type-signature for an individual piece of Middleware
 */
export type Middleware<I, O> = (input: I, next: Middleware<I, O>, onError: OnError) => O;
```

`Middleware` is a _function signature_. Use this to define the type of function that your `MiddlewareStack` will accept.

For example:

```typescript
export type PrefetchAction = Middleware<URL, void>;
```

### MiddlewareStack

```typescript
// how to import into your own code
import {
    Middleware,
    MiddlewareStack,
    MiddlewareReturnedNoValueError
} from "@ganbarodigital/ts-lib-middleware/lib/v1;

// types used for parameters, return types and errors
import { OnError, THROW_THE_ERROR } from "@ganbarodigital/ts-lib-error-reporting/lib/v1";
import {
    Middleware,
    MiddlewareReturnedNoValueError
} from "@ganbarodigital/ts-lib-middleware/lib/v1;

/**
 * a collection of Middleware to be executed
 *
 * - <I> is the input type that Middleware must accept
 * - <O> is the return type that Middleware must provide
 */
export class MiddlewareStack<I, O> {
    /**
     * add one or more pieces of middleware to this MiddlewareStack
     *
     * Middleware is executed in the order that you add it to the stack
     */
    public constructor(name: string, ...fns: Array<Middleware<I, O>>);

    /**
     * Execute the middleware that's on the stack, and return the result.
     * We execute the middleware in the order that it was added to this
     * stack. (IE first item added is the first item we run).
     *
     * Each piece of middleware either:
     *
     * - returns a return value of its own, or
     * - throws an error, or
     * - passes the (probably modified) input on to the next piece of
     *   middleware in the stack
     */
    public run(input: I, onError: OnError = THROW_THE_ERROR): O;

    /**
     * what is this MiddlewareStack called?
     */
    public getName(): string;

    /**
     * what are the contents of the stack?
     */
    public getStack(): Array<Middleware<I, O>>;
}
```

`MiddlewareStack` is an immutable _value type_. It holds and executes a list of functions, known as _middleware_.

## Errors

### MiddlewareReturnedNoValueError

```typescript
import {
    AppError,
    AppErrorParams,
} from "@ganbarodigital/ts-lib-error-reporting/lib/v1";

export interface MiddlewareReturnedNoValueExtraData extends ExtraLogsOnlyData {
    logsOnly: {
        middlewareName: string;
    };
}

export class MiddlewareReturnedNoValueError extends AppError {
    public constructor(params: MiddlewareReturnedNoValueExtraData & AppErrorParams);
}
```

`MiddlewareReturnedNoValueError` is a `throw`able JavaScript `Error`. It is thrown when we've run out of `Middleware` to execute in a `MiddlewareStack`.

The fix? Make sure that the last piece of `Middleware` returns a value.

## NPM Scripts

### npm run clean

Use `npm run clean` to delete all of the compiled code.

### npm run build

Use `npm run build` to compile the Typescript into plain Javascript. The compiled code is placed into the `lib/` folder.

`npm run build` does not compile the unit test code.

### npm run test

Use `npm run test` to compile and run the unit tests. The compiled code is placed into the `lib/` folder.

### npm run cover

Use `npm run cover` to compile the unit tests, run them, and see code coverage metrics.

Metrics are written to the terminal, and are also published as HTML into the `coverage/` folder.