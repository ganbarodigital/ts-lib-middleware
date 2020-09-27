//
// Copyright (c) 2020-present Ganbaro Digital Ltd
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
//
//   * Re-distributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//
//   * Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in
//     the documentation and/or other materials provided with the
//     distribution.
//
//   * Neither the names of the copyright holders nor the names of his
//     contributors may be used to endorse or promote products derived
//     from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
// FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
// COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
// INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
// LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
// ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.
//
import { THROW_THE_ERROR } from "@safelytyped/core-types";

import { MiddlewareReturnedNoValueError } from "../Errors";
import { AsyncMiddleware } from "./AsyncMiddleware";
import { MiddlewareOptions } from "./MiddlewareOptions";

/**
 * `AsyncMiddlewareStack` is a collection of middleware to be
 * executed asynchronously.
 *
 * @template I
 * the input type that the middleware must accept
 * @template O
 * the return type that the middleware must provide after the Promise
 * is resolved
 */
export class AsyncMiddlewareStack<I, O> {
    /**
     * `fns` is the list of functions that we will execute
     */
    private fns: AsyncMiddleware<I, O>[] = [];

    /**
     * `name` is a human-readable name for this AsyncMiddlewareStack
     *
     * We include this in error reports, so that developers can easily
     * see which AsyncMiddlewareStack has failed.
     */
    private name: string;

    /**
     * `constructor()` builds a new AsyncMiddlewareStack.
     *
     * Use it to add one or more pieces of middleware to this
     * AsyncMiddlewareStack. The middleware is executed in the order
     * that you add it to the stack.
     *
     * @param name
     * The human-readable name of this AsyncMiddlewareStack. We use this
     * in errors thrown by the AsyncMiddlewareStack class.
     * @param fns
     * The list of middleware to put in the AsyncMiddlewareStack.
     */
    public constructor(name: string, ...fns: AsyncMiddleware<I, O>[]) {
        // we need this for useful error reporting!
        this.name = name;

        // add the middleware to our stack
        this.fns = fns;

        // make sure we cannot go off the end of the stack
        const final = (
            input: I,
            next: AsyncMiddleware<I, O>,
            options: MiddlewareOptions,
        ) => {
            throw options.onError(new MiddlewareReturnedNoValueError({
                logsOnly: {
                    middlewareName: this.name,
                },
            }));
        };
        this.fns.push(final);
    }

    /**
     * `run()` executes the middleware that's on the stack, and returns
     * the result.
     *
     * We execute the middleware in the order that it was added to this
     * stack. (IE first item added is the first item we run).
     *
     * Each piece of middleware either:
     *
     * - returns a return value of its own, or
     * - throws an error, or
     * - passes the (probably modified) input on to the next piece of
     *   middleware in the stack
     *
     * @param input
     * The value to pass into the first function on your MiddlewareStack.
     * @param options.onError
     * We will call this if something goes wrong.
     */
    public async run(
        input: I,
        {
            onError = THROW_THE_ERROR,
        }: Partial<MiddlewareOptions> = {},
    ): Promise<O> {
        // keep track of where we are in the stack
        let i = 0;

        const next: AsyncMiddleware<I,O> = (
            // tslint:disable-next-line: no-shadowed-variable
            input: I,
            // tslint:disable-next-line: no-shadowed-variable
            next: AsyncMiddleware<I, O>,
            options: MiddlewareOptions
        ) => {
            const fn = this.fns[i++];
            return fn(input, next, options);
        };

        return next(input, next, {onError});
    }

    /**
     * `getName()` returns the human-readable name of this
     * AsyncMiddlewareStack.
     */
    public getName(): string {
        return this.name;
    }

    /**
     * `getStack()` returns the list of middleware items on the stack.
     */
    public getStack(): AsyncMiddleware<I, O>[] {
        return this.fns;
    }
}