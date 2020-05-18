# Middleware for Typescript

## Introduction

This TypeScript library provides an Express/Ware-style middleware that:

* is safely typed, and
* supports async / Promises

- [Introduction](#introduction)
- [Quick Start](#quick-start)
- [API](#api)
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