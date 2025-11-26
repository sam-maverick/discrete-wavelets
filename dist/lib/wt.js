"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var helpers_1 = require("./helpers");
var padding_1 = require("./padding/padding");
/**
 * Default padding mode to use.
 */
var DEFAULT_PADDING_MODE = padding_1.PADDING_MODES.symmetric;
/**
 * Collection of methods for Discrete Wavelet Transform (DWT).
 */
var DiscreteWavelets = /** @class */ (function () {
    function DiscreteWavelets() {
    }
    /**
     *     2-D FUNCTIONS
     */
    DiscreteWavelets.maxLevel2 = function (size, wavelet) {
        // !!! Assuming that the decimation factor is 2, it should be equal to:
        // Math.floor(Math.log2(Math.min(rows, cols)))
        return Math.min(this.maxLevel(size[0], wavelet), this.maxLevel(size[1], wavelet));
    };
    DiscreteWavelets.dwtRows = function (matrix, wavelet, paddingmode, taintAnalysisOnly) {
        if (taintAnalysisOnly === void 0) { taintAnalysisOnly = false; }
        var rows = matrix.length;
        //const cols = matrix[0].length;
        var cA = [];
        var cD = [];
        for (var r = 0; r < rows; r++) {
            var _a = this.dwt(matrix[r], wavelet, paddingmode, taintAnalysisOnly), approx = _a[0], detail = _a[1]; // approx.length = detail.length = padding + cols / 2
            cA.push(approx);
            cD.push(detail);
        }
        return { cA: cA, cD: cD }; // cA.length = cD.length = rows
    };
    DiscreteWavelets.dwtCols = function (cA, cD, wavelet, paddingmode, taintAnalysisOnly) {
        if (taintAnalysisOnly === void 0) { taintAnalysisOnly = false; }
        //const rows = cA.length;
        var cols = cA[0].length;
        // This initialization is necessary for later to be able to access bands.something; otherwise bands is undefined so that we cannot access sub-fields
        var bands = { LL: [], LH: [], HL: [], HH: [] };
        var _loop_1 = function (col) {
            var recA = cA.map(function (r) { return r[col]; });
            var _a = this_1.dwt(recA, wavelet, paddingmode, taintAnalysisOnly), A1 = _a[0], D1 = _a[1]; // A1.length = D1.length = padding + cA.length / 2
            var recD = cD.map(function (r) { return r[col]; });
            var _b = this_1.dwt(recD, wavelet, paddingmode, taintAnalysisOnly), A2 = _b[0], D2 = _b[1]; // A2.length = D2.length = padding + cD.length / 2
            // Initialize the bands as [][] on the first iteration, now that we know the result of WT.dwt() *with the padding*
            if (col == 0) {
                bands.LL = Array.from({ length: cols }, function () { return Array(A1.length).fill(0); }); // A1.length = D1.length
                bands.LH = Array.from({ length: cols }, function () { return Array(D1.length).fill(0); });
                bands.HL = Array.from({ length: cols }, function () { return Array(A2.length).fill(0); }); // A2.length = D2.length
                bands.HH = Array.from({ length: cols }, function () { return Array(D2.length).fill(0); });
            }
            // assign column results for cA
            for (var i = 0; i < A1.length; i++) {
                bands.LL[col][i] = A1[i];
                bands.LH[col][i] = D1[i];
            }
            // assign column results for cD
            for (var i = 0; i < A2.length; i++) {
                bands.HL[col][i] = A2[i];
                bands.HH[col][i] = D2[i];
            }
        };
        var this_1 = this;
        for (var col = 0; col < cols; col++) {
            _loop_1(col);
        }
        return bands;
    };
    DiscreteWavelets.idwtRows = function (cA, cD, wavelet) {
        var rows = cA.length;
        var result = [];
        for (var r = 0; r < rows; r++) {
            var row = this.idwt(cA[r], cD[r], wavelet);
            result.push(row);
        }
        return result;
    };
    DiscreteWavelets.idwtCols = function (bands, wavelet) {
        var trimmedLL = bands.LL.map(function (row) { return __spreadArray([], row, true); });
        // Undo the padding(s)
        // !!! Assuming that the decimation factor is 2
        if (bands.LL.length > bands.LH.length) {
            trimmedLL.pop();
        }
        if (bands.LL[0].length > bands.LH[0].length) {
            for (var _i = 0, trimmedLL_1 = trimmedLL; _i < trimmedLL_1.length; _i++) {
                var row = trimmedLL_1[_i];
                row.pop();
            }
        }
        var cols = trimmedLL.length;
        var rows = trimmedLL[0].length * 2;
        var cA = Array.from({ length: rows }, function () { return Array(cols).fill(0); });
        var cD = Array.from({ length: rows }, function () { return Array(cols).fill(0); });
        for (var col = 0; col < cols; col++) {
            var recA = this.idwt(trimmedLL[col] /*approx*/, bands.LH[col] /*details*/, wavelet);
            var recD = this.idwt(bands.HL[col] /*approx*/, bands.HH[col] /*details*/, wavelet);
            for (var r = 0; r < recA.length; r++) {
                cA[r][col] = recA[r];
                cD[r][col] = recD[r];
            }
        }
        return { cA: cA, cD: cD };
    };
    DiscreteWavelets.dwt2 = function (data, wavelet, mode, taintAnalysisOnly) {
        if (mode === void 0) { mode = 'symmetric'; }
        if (taintAnalysisOnly === void 0) { taintAnalysisOnly = false; }
        var _a = this.dwtRows(data, wavelet, mode, taintAnalysisOnly), cA = _a.cA, cD = _a.cD;
        var bands = this.dwtCols(cA, cD, wavelet, mode, taintAnalysisOnly);
        return bands;
    };
    DiscreteWavelets.wavedec2 = function (data, wavelet, mode, level) {
        if (mode === void 0) { mode = 'symmetric'; }
        var rows = data.length;
        var cols = data[0].length;
        var maxLevels = this.maxLevel2([rows, cols], wavelet);
        var numLevels;
        if (level === undefined) {
            numLevels = maxLevels;
        }
        else {
            if (!(Number.isInteger(level) && level > 0)) {
                throw new Error('Level parameter must be an integer greater than zero');
            }
            if (level > maxLevels) {
                throw new Error('Can\'t decompose more times than the maximum number of levels ' + maxLevels);
            }
            numLevels = level;
        }
        var current = data;
        // We will use the taint analysis technique to track which coefficients are affected by original data (1) and which not(0)
        // Coefficients that are not affected by original data must be a result of padding; they are synthetic
        var currentMask = Array.from({ length: data.length }, function () { return Array(data[0].length).fill(1); }); // Creates an array with the same shape as data, but with all values as 1
        var coeffs = {
            // We need to initialize approximation:data, because there is the possibility that numLevels==0 
            approximation: data,
            details: [],
            size: [rows, cols],
        };
        // This will store an optional mask matrix of coefficients, where 0 means that that position on the transform
        // result is a synthetic zero produced by the padding, and anything else means 'position with actual data'
        var mask = {
            approximation: Array.from({ length: data.length }, function () { return Array(data[0].length).fill(1); }),
            details: [],
            size: [0, 0], // Dummy value
        };
        for (var level_1 = 0; level_1 < numLevels; level_1++) {
            var bands = this.dwt2(current, wavelet, mode); // Perform one level of decomposition
            var bandsMask = this.dwt2(currentMask, wavelet, mode, true); // We do taint analysis to detect synthetic coefficients
            // We keep LL for the next iteration or as the last-level approximation
            coeffs.approximation = bands.LL;
            mask.approximation = bandsMask.LL;
            // We push this result to the matrix, so that details[0] will be the first-level decomposition and details[details.length-1] will be the last-level decomposition
            coeffs.details.push({ LH: bands.LH, HL: bands.HL, HH: bands.HH });
            mask.details.push({ LH: bandsMask.LH, HL: bandsMask.HL, HH: bandsMask.HH });
            current = coeffs.approximation; // Recurse only on the LL band
            currentMask = mask.approximation;
        }
        return { coeffs: coeffs, mask: mask };
    };
    DiscreteWavelets.idwt2 = function (approx, detail, wavelet) {
        var _a = this.idwtCols({ LL: approx, LH: detail.LH, HL: detail.HL, HH: detail.HH }, wavelet), cA = _a.cA, cD = _a.cD;
        var data = this.idwtRows(cA, cD, wavelet);
        return data;
    };
    DiscreteWavelets.waverec2 = function (coeffs, wavelet) {
        var current = coeffs.approximation;
        for (var level = coeffs.details.length - 1; level >= 0; level--) {
            current = this.idwt2(current, coeffs.details[level], wavelet); // Perform one level of recomposition
        }
        // Undo the padding(s) of the last step
        // !!! Assuming that the decimation factor is 2
        if (current.length > coeffs.size[0]) {
            current.pop();
        }
        if (current[0].length > coeffs.size[1]) {
            for (var _i = 0, current_1 = current; _i < current_1.length; _i++) {
                var row = current_1[_i];
                row.pop();
            }
        }
        return current;
    };
    /**
     *     1-D FUNCTIONS
     */
    /**
     * Single level Discrete Wavelet Transform.
     *
     * @param  data    Input data.
     * @param  wavelet Wavelet to use.
     * @param  mode    Signal extension mode.
     * @return         Approximation and detail coefficients as result of the transform.
     */
    DiscreteWavelets.dwt = function (data, wavelet, mode, taintAnalysisOnly) {
        if (mode === void 0) { mode = DEFAULT_PADDING_MODE; }
        if (taintAnalysisOnly === void 0) { taintAnalysisOnly = false; }
        /* Determine wavelet basis and filters. */
        var waveletBasis = (0, helpers_1.basisFromWavelet)(wavelet);
        var filters = waveletBasis.dec;
        (0, helpers_1.assertValidFilters)(filters);
        var filterLength = filters.low.length;
        /* Add padding. */
        data = this.pad(data, (0, helpers_1.padWidths)(data.length, filterLength), taintAnalysisOnly ? 'zero' : mode);
        /* Initialize approximation and detail coefficients. */
        var approx = [];
        var detail = [];
        /* Calculate coefficients. */
        for (var offset = 0; offset + filterLength <= data.length; offset += filterLength) {
            /* Determine slice of values. */
            var values = data.slice(offset, offset + filterLength);
            if (taintAnalysisOnly) {
                if (filterLength == 2 && mode == 'symmetric' && wavelet == 'haar') {
                    // Haar filters are [f1,-f1] (high-pass) and [f1,f1] (low-pass), with f1=0.7071...
                    if (values[0] == 1 && values[1] == 0) {
                        approx.push(1); // Dotproduct of [a,a] with [f1,f1] depends on a
                        detail.push(0); // Dotproduct of [a,a] with [f1,-f1] is 0
                    }
                    else if (values[0] == 0 && values[1] == 0) {
                        // Dotproduct of [0,0] with [_,_] is 0
                        approx.push(0);
                        detail.push(0);
                    }
                    else {
                        // The result of the dotproduct depents on values[0] and values[1]
                        approx.push(1);
                        detail.push(1);
                    }
                }
                else {
                    // NOT IMPLEMENTED !
                    approx.push(1);
                    detail.push(1);
                }
            }
            else {
                /* Calculate approximation coefficients. */
                approx.push((0, helpers_1.dot)(values, filters.low));
                /* Calculate detail coefficients. */
                detail.push((0, helpers_1.dot)(values, filters.high));
            }
        }
        /* Return approximation and detail coefficients. */
        return [approx, detail];
    };
    /**
     * Calculates the energy as sum of squares of an array of data or
     * coefficients.
     *
     * @param  values Array of data or coefficients.
     * @return        Energy of values as the sum of squares.
     */
    DiscreteWavelets.energy = function (values) {
        var energy = 0;
        for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
            var value = values_1[_i];
            if (typeof value === "number")
                energy += Math.pow(value, 2);
            else
                energy += this.energy(value);
        }
        return energy;
    };
    /**
     * Single level inverse Discrete Wavelet Transform.
     *
     * @param  approx  Approximation coefficients. If undefined, it will be set to an array of zeros with length equal to the detail coefficients.
     * @param  detail  Detail coefficients. If undefined, it will be set to an array of zeros with length equal to the approximation coefficients.
     * @param  wavelet Wavelet to use.
     * @return         Approximation coefficients of previous level of transform.
     */
    DiscreteWavelets.idwt = function (approx, detail, wavelet) {
        /* Fill empty array with zeros. */
        if (approx === undefined && detail !== undefined) {
            approx = (0, helpers_1.createArray)(detail.length, 0);
        }
        if (detail === undefined && approx !== undefined) {
            detail = (0, helpers_1.createArray)(approx.length, 0);
        }
        /* Check if some coefficients are undefined. */
        if (approx === undefined || detail === undefined) {
            throw new Error("Coefficients must not be undefined.");
        }
        (0, helpers_1.assertValidApproxDetail)(approx, detail);
        /* Determine wavelet basis and filters. */
        var waveletBasis = (0, helpers_1.basisFromWavelet)(wavelet);
        var filters = waveletBasis.rec;
        (0, helpers_1.assertValidFilters)(filters);
        var filterLength = filters.low.length;
        /* Initialize transform. */
        var coeffLength = approx.length;
        var pad = (0, helpers_1.createArray)(filterLength + (coeffLength - 1) * 2, 0);
        /* Perform inverse Discrete Wavelet Transform. */
        for (var i = 0; i < coeffLength; i++) {
            var offset = 2 * i;
            /* Calculate values. */
            var values = pad.slice(offset, offset + filterLength);
            values = (0, helpers_1.add)(values, (0, helpers_1.mulScalar)(approx[i], filters.low));
            values = (0, helpers_1.add)(values, (0, helpers_1.mulScalar)(detail[i], filters.high));
            /* Update values. */
            pad = pad
                .slice(0, offset)
                .concat(values)
                .concat(pad.slice(offset + values.length));
        }
        /* Remove padding. */
        return pad.slice(filterLength - 2, pad.length - (filterLength - 2));
    };
    /**
     * Determines the maximum level of useful decomposition.
     *
     * @param  dataLength Length of input data.
     * @param  wavelet    Wavelet to use.
     * @return            Maximum useful level of decomposition.
     */
    DiscreteWavelets.maxLevel = function (dataLength, wavelet) {
        /* Check for non-integer length. */
        if (!Number.isInteger(dataLength)) {
            throw new Error("Length of data is not an integer. This is not allowed.");
        }
        /* Check for invalid input. */
        if (dataLength < 0) {
            throw new Error("Data length cannot be less than zero.");
        }
        /* Return zero for data of zero length. */
        if (dataLength === 0)
            return 0;
        /* Determine wavelet basis. */
        var waveletBasis = (0, helpers_1.basisFromWavelet)(wavelet);
        /* Determine length of filter. */
        var filterLength = waveletBasis.dec.low.length;
        // SOURCE: https://pywavelets.readthedocs.io/en/latest/ref/dwt-discrete-wavelet-transform.html#maximum-decomposition-level-dwt-max-level-dwtn-max-level
        return Math.max(0, Math.floor(Math.log2(dataLength / (filterLength - 1))));
    };
    /**
     * Extends a signal with a given padding mode.
     *
     * @param  data      Input data.
     * @param  padWidths Widths of padding at front and back.
     * @param  mode      Signal extension mode.
     * @return           Data with padding.
     */
    DiscreteWavelets.pad = function (data, padWidths, mode) {
        /* Check for undefined data. */
        if (!data) {
            throw new Error("Cannot add padding to empty data.");
        }
        /* Initialize. */
        var front = padWidths[0];
        var back = padWidths[1];
        /* Add padding. */
        return (0, helpers_1.createArray)(front, function (index) { return (0, helpers_1.padElement)(data, front - 1 - index, true, mode); })
            .concat(data)
            .concat((0, helpers_1.createArray)(back, function (index) { return (0, helpers_1.padElement)(data, index, false, mode); }));
    };
    /**
     * 1D wavelet decomposition. Transforms data by calculating coefficients from
     * input data.
     *
     * @param  data    Input data.
     * @param  wavelet Wavelet to use.
     * @param  mode    Signal extension mode.
     * @param  level   Decomposition level. Defaults to level calculated by maxLevel function.
     * @return         Coefficients as result of the transform.
     */
    DiscreteWavelets.wavedec = function (data, wavelet, mode, level) {
        if (mode === void 0) { mode = DEFAULT_PADDING_MODE; }
        /* Determine decomposition level. */
        if (level === undefined)
            level = this.maxLevel(data.length, wavelet);
        if (level < 0) {
            throw new Error("Decomposition level must not be less than zero");
        }
        /*  Initialize transform. */
        var coeffs = [];
        var approx = data.slice();
        /* Transform. */
        for (var l = 1; l <= level; l++) {
            /* Perform single level transform. */
            var approxDetail = this.dwt(approx, wavelet, mode);
            approx = approxDetail[0];
            var detail = approxDetail[1];
            /* Prepend detail coefficients. */
            coeffs.unshift(detail.slice());
        }
        /* Prepend last approximation. */
        coeffs.unshift(approx.slice());
        /* Return coefficients. */
        return coeffs;
    };
    /**
     * 1D wavelet reconstruction. Inverses a transform by calculating input data
     * from coefficients.
     *
     * @param  coeffs  Coefficients as result of a transform.
     * @param  wavelet Wavelet to use.
     * @return         Input data as result of the inverse transform.
     */
    DiscreteWavelets.waverec = function (coeffs, wavelet) {
        /* Check if coefficients are valid. */
        (0, helpers_1.assertValidCoeffs)(coeffs);
        /* Determine wavelet. */
        wavelet = (0, helpers_1.basisFromWavelet)(wavelet);
        /* Initialize transform. */
        var approx = coeffs[0];
        /* Transform. */
        for (var i = 1; i < coeffs.length; i++) {
            /* Initialize detail coefficients. */
            var detail = coeffs[i];
            // TODO: Check if problem of different coefficient lengths because of padding can be solved in a more elegant way.
            if (approx.length === detail.length + 1) {
                approx = approx.slice(0, approx.length - 1);
            }
            /* Calculate previous level of approximation. */
            approx = this.idwt(approx, detail, wavelet);
        }
        /* Return data. */
        return approx.slice();
    };
    /**
     * Contains static information about the signal extension modes.
     */
    DiscreteWavelets.Modes = padding_1.PADDING_MODES;
    return DiscreteWavelets;
}());
exports.default = DiscreteWavelets;
//# sourceMappingURL=wt.js.map