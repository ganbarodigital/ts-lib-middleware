# Middleware for Typescript

## Introduction

This TypeScript library provides an Express/Ware-style middleware that:

* is safely typed, and
* supports async / Promises

- [Introduction](#introduction)
- [Quick Start](#quick-start)
- [Concepts](#concepts)
  - [What Is Middleware?](#what-is-middleware)
  - [What Is The Point Of Middleware?](#what-is-the-point-of-middleware)
  - [What Can Middleware Do?](#what-can-middleware-do)
  - [How Is Middleware Different From Functional Programming?](#how-is-middleware-different-from-functional-programming)
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

## Concepts

### What Is Middleware?

_Middleware_ is simply a list of functions that call each other in a chain:

- the first function calls the second function
- the second function calls the third function

... and so on. This continues until either:

- one of the functions returns a value, or
- one of the functions throws an exception

If none of the functions returns a value, the code falls off the end of the chain, and an exception is thrown ([`MiddlewareReturnedNoValueError`](#middlewarereturnednovalueerror) in our case).

### What Is The Point Of Middleware?

The first thing to note about middleware is that each of these functions is indepedent of each other. They don't have a hard-coded call to the next function in the chain. We decide what the next function is when we put the chain together.

```typescript
import { OnError, THROW_THE_ERROR } from "@ganbarodigital/ts-lib-error-reporting/lib/v1";
import { Middleware } from "@ganbarodigital/ts-lib-middleware/lib/v1";

/**
 * an example middleware function
 */
function RejectNegatives(input: number, next: Middleware<number, number>, onError: OnError = THROW_THE_ERROR) {
    if (input < 0 ) {
        throw new Error("Negative numbers are not allowed");
    }

    // this function doesn't know what the next function is
    // when we write it
    //
    // it is told what the next function is when we run it
    return next(input, next, onError);
}
```

That means that middleware functions can be written and published independently, and that they can be reused in any combination to suit our needs.

Another thing to note about middleware is that each function is free to modify the input value that's being passed along the chain. When we run a middleware chain, we pass an input parameter from our code into the first function in the chain. From that point, it's up to each function to decide whether or not to modify the input data before passing it on to the next function in the chain.

```typescript
import { OnError, THROW_THE_ERROR } from "@ganbarodigital/ts-lib-error-reporting/lib/v1";
import { Middleware } from "@ganbarodigital/ts-lib-middleware/lib/v1";

/**
 * an example middleware function
 */
function IntegerNumbersOnly(input: number, next: Middleware<number, number>, onError: OnError = THROW_THE_ERROR) {

    // in this example, we (possibly!) change the value of input
    // before calling the next function in the chain
    input = Math.floor(input);

    return next(input, next, onError);
}
```

The final thing to note about middleware is that each function is free to modify the return value that it gets from the next function in the chain. Not only can each function in the chain do some processing before calling the next function in the chain, it can also do some processing after it has received a return value from the next function.

```typescript
import { OnError, THROW_THE_ERROR } from "@ganbarodigital/ts-lib-error-reporting/lib/v1";
import { Middleware } from "@ganbarodigital/ts-lib-middleware/lib/v1";

/**
 * an example middleware function
 */
function IntegerNumbersOnly(input: number, next: Middleware<number, number>, onError: OnError = THROW_THE_ERROR) {

    input = Math.floor(input);

    // in this example, we make sure that any returned value is also an
    // integer
    return Math.floor(
        next(input, next, onError)
    );
}
```

When we combine these properties, we can do an awful lot with middleware.

### What Can Middleware Do?

Each middleware function ultimately does one (or more!) of the following:

* they validate input data (and reject invalid inputs)
* they filter input data (allowing some parts of the input through, removing others)
* they augment input data (they add additional parts to the input)
* they transform input data (they convert data from one form to another)
* they validate the return value (and reject invalid return values)
* they filter the return value (allowing some parts of the return value through, removing others)
* they augment the return value (they add additional parts to the return value)
* they transform the return value (they convert data from one form to another)
* they process the input data, and produce a return value

As long as each middleware function is doing a sensible unit of work, middleware gives us a highly-reusable toolkit to work with. Think of them like Lego bricks: individual parts that you can assemble to create all sorts of things.

In the JavaScript world, two great examples of middleware are Express.JS and MetalSmith.

### How Is Middleware Different From Functional Programming?

Functional programming has this concept called _composition_, where the output of one function is used as the input to the next function. It's such a fundamental part of functional programming that functional languages include compiler/interpreter support for building new functions using composition.

With middleware, our functions aren't _composed_ in the functional sense:

* we don't use the output of one function as the input to the next
* there's no compiler/interpreter support for this, so we have to emulate the behaviour using a piece of controlling JavaScript / TypeScript that we call the MiddlewareStack

There **are** some things that our middleware has in common with functional programming:

* your middleware functions are more reusable if they only use the data that's passed in as an input parameter (ie a "pure" function in functional programming terms)
* any app that uses middleware is more reliable if the middleware functions only accept and process immutable data structures

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