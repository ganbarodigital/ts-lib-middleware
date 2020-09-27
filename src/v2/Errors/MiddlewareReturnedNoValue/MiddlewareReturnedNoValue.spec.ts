//
// Copyright (c) 2020-present Ganbaro Digital Ltd
// All rights reserved.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
// Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public
// License along with this program. If not, see
// <https://www.gnu.org/licenses/>.
//
import { expect } from "chai";
import { describe } from "mocha";

import { MiddlewareReturnedNoValueError } from "./MiddlewareReturnedNoValueError";

describe("MiddlewareReturnedNoValueError", () => {
    describe(".constructor()", () => {
        it("creates a Javascript error", () => {
            const unit = new MiddlewareReturnedNoValueError({
                logsOnly: {
                    middlewareName: "internal-name",
                },
            });

            expect(unit).to.be.instanceOf(Error);
        });
    });
});