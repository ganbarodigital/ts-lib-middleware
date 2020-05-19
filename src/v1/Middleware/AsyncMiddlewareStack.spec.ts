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
import { expect } from "chai";
import { describe } from "mocha";

import { OnError, THROW_THE_ERROR } from "@ganbarodigital/ts-lib-error-reporting/lib/v1";
import { AsyncMiddleware, AsyncMiddlewareStack } from ".";

describe("AsyncMiddlewareStack", () => {
    describe(".constructor()", () => {
        it("creates an empty stack by default", async () => {
            const unit = new AsyncMiddlewareStack("unit-test");

            const actualValue = unit.getStack();

            // the only thing on the stack is our function that
            // throws an error
            expect(actualValue.length).to.equal(1);

            let caught = false;
            await unit.run(null).catch((e) => { caught = true; });
            expect(caught).to.equal(true);
        });

        it("sets the name for this AsyncMiddlewareStack instance", () => {
            const expectedValue = "unit-test-stack";
            const unit = new AsyncMiddlewareStack(expectedValue);

            const actualValue = unit.getName();

            expect(actualValue).to.equal(expectedValue);
        });
    });

    describe(".getName()", () => {
        it("returns the name of this AsyncMiddlewareStack instance", () => {
            const expectedValue = "unit-test-stack";
            const unit = new AsyncMiddlewareStack(expectedValue);

            const actualValue = unit.getName();

            expect(actualValue).to.equal(expectedValue);
        });
    });

    describe(".getStack()", () => {
        it("returns the list of AsyncMiddleware functions", () => {
            const m1 = async (
                input: string,
                next: AsyncMiddleware<string, string>,
                onError: OnError = THROW_THE_ERROR,
            ): Promise<string> => {
                return next("m1 " + input, next, onError);
            };

            const m2 = async (
                input: string,
                next: AsyncMiddleware<string, string>,
                onError: OnError = THROW_THE_ERROR,
            ): Promise<string> => {
                return "m2 " + input;
            };

            const unit = new AsyncMiddlewareStack("unit-test", m1, m2);
            const actualValue = unit.getStack();

            expect(actualValue[0]).to.eql(m1);
            expect(actualValue[1]).to.eql(m2);
        });
    });

    describe(".run()", () => {
        it("supports executing AsyncMiddleware", async () => {
            const m1 = async (
                input: string,
                next: AsyncMiddleware<string, string>,
                onError: OnError = THROW_THE_ERROR,
            ): Promise<string> => {
                return await next("m1 " + input, next, onError);
            };

            const m2 = async (
                input: string,
                next: AsyncMiddleware<string, string>,
                onError: OnError = THROW_THE_ERROR,
            ): Promise<string> => {
                return "m2 " + input;
            };

            const expectedValue = "m2 m1 test the run";

            const unit = new AsyncMiddlewareStack("unit-test", m1, m2);
            const actualValue = await unit.run("test the run");

            expect(actualValue).to.equal(expectedValue);
        });
    });
});