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
import { MiddlewareStack } from ".";
import { MiddlewareReturnedNoValueError } from "../Errors";
import { Middleware } from "./Middleware";

describe("MiddlewareStack", () => {
    describe(".constructor()", () => {
        it("creates an empty stack by default", () => {
            const unit = new MiddlewareStack("unit-test");

            const actualValue = unit.getStack();

            // the only thing on the stack is our function that
            // throws an error
            expect(actualValue.length).to.equal(1);
            expect(() => { unit.run(null); }).to.throw(MiddlewareReturnedNoValueError);
        });

        it("sets the name for this MiddlewareStack instance", () => {
            const expectedValue = "unit-test-stack";
            const unit = new MiddlewareStack(expectedValue);

            const actualValue = unit.getName();

            expect(actualValue).to.equal(expectedValue);
        });
    });

    describe(".getName()", () => {
        it("returns the name of this MiddlewareStack instance", () => {
            const expectedValue = "unit-test-stack";
            const unit = new MiddlewareStack(expectedValue);

            const actualValue = unit.getName();

            expect(actualValue).to.equal(expectedValue);
        });
    });

    describe(".getStack()", () => {
        it("returns the list of Middleware functions", () => {
            const m1 = (
                input: string,
                next: Middleware<string, string>,
                onError: OnError = THROW_THE_ERROR,
            ): string => {
                return next("m1 " + input, next, onError);
            };

            const m2 = (
                input: string,
                next: Middleware<string, string>,
                onError: OnError = THROW_THE_ERROR,
            ): string => {
                return "m2 " + input;
            };

            const unit = new MiddlewareStack("unit-test", m1, m2);
            const actualValue = unit.getStack();

            expect(actualValue[0]).to.eql(m1);
            expect(actualValue[1]).to.eql(m2);
        });
    });

    describe(".run()", () => {
        it("executes the Middleware that's on the stack", () => {
            const m1 = (
                input: string,
                next: Middleware<string, string>,
                onError: OnError = THROW_THE_ERROR,
            ): string => {
                return next("m1 " + input, next, onError);
            };

            const m2 = (
                input: string,
                next: Middleware<string, string>,
                onError: OnError = THROW_THE_ERROR,
            ): string => {
                return "m2 " + input;
            };

            const expectedValue = "m2 m1 test the run";

            const unit = new MiddlewareStack("unit-test", m1, m2);
            const actualValue = unit.run("test the run");

            expect(actualValue).to.equal(expectedValue);
        });
    });
});