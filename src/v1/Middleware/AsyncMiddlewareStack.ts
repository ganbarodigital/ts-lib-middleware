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

import { OnError, THROW_THE_ERROR } from "@ganbarodigital/ts-lib-error-reporting/lib/v1";
import { AsyncMiddleware } from ".";
import { MiddlewareReturnedNoValueError } from "../Errors";

/**
 * a collection of middleware to be executed asynchronously
 *
 * - <I> is the input type that the middleware must accept
 * - <O> is the return type that the middleware must provide after the
 *       Promise is resolved
 */
export class AsyncMiddlewareStack<I, O> {
    /**
     * the list of functions that we will execute
     */
    private fns: Array<AsyncMiddleware<I, O>> = [];

    /**
     * a human-readable name for this AsyncMiddlewareStack
     *
     * we include this in error reports, so that developers can easily
     * see which AsyncMiddlewareStack has failed
     */
    private name: string;

    /**
     * add one or more pieces of middleware to this AsyncMiddlewareStack
     *
     * Middleware is executed in the order that you add it to the stack
     */
    public constructor(name: string, ...fns: Array<AsyncMiddleware<I, O>>) {
        // we need this for useful error reporting!
        this.name = name;

        // add the middleware to our stack
        this.fns = fns;

        // make sure we cannot go off the end of the stack
        const final = (input: I, next: AsyncMiddleware<I, O>, onError: OnError) => {
            throw onError(new MiddlewareReturnedNoValueError({
                logsOnly: {
                    middlewareName: this.name,
                },
            }));
        };
        this.fns.push(final);
    }

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
    public async run(input: I, onError: OnError = THROW_THE_ERROR): Promise<O> {
        // keep track of where we are in the stack
        let i = 0;

        // tslint:disable-next-line: no-shadowed-variable
        const next = (input: I, next: AsyncMiddleware<I, O>, onError: OnError) => {
            const fn = this.fns[i++];
            return fn(input, next, onError);
        };

        return next(input, next, onError);
    }

    /**
     * what is this AsyncMiddlewareStack called?
     */
    public getName(): string {
        return this.name;
    }

    /**
     * what are the contents of the internal stack?
     */
    public getStack(): Array<AsyncMiddleware<I, O>> {
        return this.fns;
    }
}