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
import {
    AppError,
    AppErrorParams,
    ErrorTableTemplate,
    ExtraLogsOnlyData,
    StructuredProblemReport,
    StructuredProblemReportDataWithExtraData,
} from "@ganbarodigital/ts-lib-error-reporting/lib/v1";

import { ERROR_TABLE, ModuleErrorTable } from ".";

/**
 * the ExtraData that must be provided for each MiddlewareReturnedNoValueError
 */
export interface MiddlewareReturnedNoValueExtraData extends ExtraLogsOnlyData {
    logsOnly: {
        middlewareName: string;
    };
}

/**
 * defines the structure of the data that goes into our ErrorTable
 */
export type MiddlewareReturnedNoValueTemplate = ErrorTableTemplate<
    ModuleErrorTable,
    "middleware-returned-no-value"
>;

/**
 * defines the data that goes into our StructuredProblemReport
 */
export type MiddlewareReturnedNoValueData = StructuredProblemReportDataWithExtraData<
    ModuleErrorTable,
    "middleware-returned-no-value",
    MiddlewareReturnedNoValueTemplate,
    MiddlewareReturnedNoValueExtraData
>;

/**
 * a type alias for our StructuredProblemReport
 */
export type MiddlewareReturnedNoValueSRP = StructuredProblemReport<
    ModuleErrorTable,
    "middleware-returned-no-value",
    MiddlewareReturnedNoValueTemplate,
    MiddlewareReturnedNoValueExtraData,
    MiddlewareReturnedNoValueData
>;

/**
 * throwable Javascript Error, for when we fall off the end of any given
 * MiddlewareStack
 */
export class MiddlewareReturnedNoValueError extends AppError<
    ModuleErrorTable,
    "middleware-returned-no-value",
    MiddlewareReturnedNoValueTemplate,
    MiddlewareReturnedNoValueExtraData,
    MiddlewareReturnedNoValueData,
    MiddlewareReturnedNoValueSRP
> {
    public constructor(params: MiddlewareReturnedNoValueExtraData & AppErrorParams) {
        const errorDetails: MiddlewareReturnedNoValueData = {
            template: ERROR_TABLE["middleware-returned-no-value"],
            errorId: params.errorId,
            extra: {
                logsOnly: params.logsOnly,
            },
        };

        super(StructuredProblemReport.from(errorDetails));
    }
}