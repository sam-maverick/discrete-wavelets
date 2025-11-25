export {
  PaddingMode,
  PaddingModes,
  PaddingWidths,
} from './padding/padding';

export {
  Filters,
  Wavelet,
  WaveletBasis,
  WaveletType,
} from './wavelets/wavelets';

import {
  add,
  assertValidApproxDetail,
  assertValidCoeffs,
  assertValidFilters,
  basisFromWavelet,
  createArray,
  dot,
  mulScalar,
  padElement,
  padWidths,
} from './helpers';

import {
  PADDING_MODES,
  PaddingMode,
  PaddingModes,
  PaddingWidths,
} from './padding/padding';

import {
  Filters,
  Wavelet,
  WaveletBasis,
} from "./wavelets/wavelets";

/**
 * Default padding mode to use.
 */
const DEFAULT_PADDING_MODE: PaddingMode = PADDING_MODES.symmetric;

export namespace DiscreteWavelets {
  export interface WaveletCoefficients2D {
      approximation: number[][];  // This is the LL band
      details: { 
          LH: number[][],
          HL: number[][],
          HH: number[][]
      }[];  // Mind that this is an array of objects!
      // Information of the original input size must be kept to reliably undo the padding in the last step of waverec2()
      size: [number, number];
      mask?: { // This will store an optional mask matrix of coefficients, where 0 means that that position on the transform
              // result is a synthetic zero produced by the padding, and anything else means 'position with actual data'
          approximation: number[][];
          details: { 
              LH: number[][],
              HL: number[][],
              HH: number[][] 
          }[];  // Mind that this is an array of objects!
      }
  }

  export interface WaveletBands2D {
      LL: number[][],
      LH: number[][],
      HL: number[][],
      HH: number[][],
  }
}

/**
 * Collection of methods for Discrete Wavelet Transform (DWT).
 */
export default class DiscreteWavelets {
  /**
   * Contains static information about the signal extension modes.
   */
  static readonly Modes: Readonly<PaddingModes> = PADDING_MODES;




/**
 *     2-D FUNCTIONS
 */

  static maxLevel2(
      size: [number, number], 
      wavelet: Wavelet,
  ): number {
      // !!! Assuming that the decimation factor is 2, it should be equal to:
      // Math.floor(Math.log2(Math.min(rows, cols)))
      return Math.min(
          this.maxLevel(size[0], wavelet),
          this.maxLevel(size[1], wavelet)
      );
  }

  static dwtRows(
      matrix: number[][], 
      wavelet: Wavelet, 
      paddingmode: PaddingMode,
      taintAnalysisOnly: boolean = false,
  ): {cA: number[][], cD: number[][]} {
      const rows = matrix.length;
      //const cols = matrix[0].length;

      const cA: number[][] = [];
      const cD: number[][] = [];

      for (let r = 0; r < rows; r++) {
          const [approx, detail] = this.dwt(matrix[r], wavelet, paddingmode, taintAnalysisOnly);  // approx.length = detail.length = padding + cols / 2
          cA.push(approx);
          cD.push(detail);
      }
      
      return { cA, cD };  // cA.length = cD.length = rows
  }

  static dwtCols(
      cA: number[][], 
      cD: number[][], 
      wavelet: Wavelet, 
      paddingmode: PaddingMode,
      taintAnalysisOnly: boolean = false,
  ): DiscreteWavelets.WaveletBands2D {
      //const rows = cA.length;
      const cols = cA[0].length;

      // This initialization is necessary for later to be able to access bands.something; otherwise bands is undefined so that we cannot access sub-fields
      let bands: DiscreteWavelets.WaveletBands2D = { LL: [], LH: [], HL: [], HH: [] };

      for (let col = 0; col < cols; col++) {
          const recA = cA.map(r => r[col]);
          const [A1, D1] = this.dwt(recA, wavelet, paddingmode, taintAnalysisOnly);  // A1.length = D1.length = padding + cA.length / 2
          const recD = cD.map(r => r[col]);
          const [A2, D2] = this.dwt(recD, wavelet, paddingmode, taintAnalysisOnly);  // A2.length = D2.length = padding + cD.length / 2

          // Initialize the bands as [][] on the first iteration, now that we know the result of WT.dwt() *with the padding*
          if (col == 0) {
              bands.LL = Array.from({ length: cols }, () => Array(A1.length).fill(0));  // A1.length = D1.length
              bands.LH = Array.from({ length: cols }, () => Array(D1.length).fill(0));
              bands.HL = Array.from({ length: cols }, () => Array(A2.length).fill(0));  // A2.length = D2.length
              bands.HH = Array.from({ length: cols }, () => Array(D2.length).fill(0));
          }

          // assign column results for cA
          for (let i = 0; i < A1.length; i++) {
              bands.LL[col][i] = A1[i];
              bands.LH[col][i] = D1[i];
          }
          // assign column results for cD
          for (let i = 0; i < A2.length; i++) {
              bands.HL[col][i] = A2[i];
              bands.HH[col][i] = D2[i];
          }
      }

      return bands;
  }

  static idwtRows(
      cA: number[][], 
      cD: number[][], 
      wavelet: Wavelet,
  ): number[][] {
      const rows = cA.length;
      const result: number[][] = [];

      for (let r = 0; r < rows; r++) {
          const row = this.idwt(cA[r], cD[r], wavelet);
          result.push(row);
      }

      return result;
  }

  static idwtCols(
      bands: DiscreteWavelets.WaveletBands2D,
      wavelet: Wavelet,
  ): { cA: number[][], cD: number[][] } {

      let trimmedLL = bands.LL.map(row => [...row]);

      // Undo the padding(s)
      // !!! Assuming that the decimation factor is 2
      if (bands.LL.length > bands.LH.length) {
          trimmedLL.pop();
      }
      if (bands.LL[0].length > bands.LH[0].length) {
          for (const row of trimmedLL) {
              row.pop();
          }
      }

      const cols = trimmedLL.length;
      const rows = trimmedLL[0].length * 2;

      const cA: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
      const cD: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

      for (let col = 0; col < cols; col++) {
          const recA = this.idwt(trimmedLL[col]/*approx*/, bands.LH[col]/*details*/, wavelet);
          const recD = this.idwt(bands.HL[col]/*approx*/, bands.HH[col]/*details*/, wavelet);

          for (let r = 0; r < recA.length; r++) {
              cA[r][col] = recA[r];
              cD[r][col] = recD[r]
          } 
      }

      return { cA, cD };
  }

  static dwt2(
      data: number[][],
      wavelet: Wavelet,
      mode: PaddingMode = 'symmetric',
      taintAnalysisOnly: boolean = false,
  ): DiscreteWavelets.WaveletBands2D {
      const { cA, cD } = this.dwtRows(data, wavelet, mode, taintAnalysisOnly);
      const bands = this.dwtCols(cA, cD, wavelet, mode, taintAnalysisOnly);
      return bands;
  }

  static wavedec2(
      data: number[][],
      wavelet: Wavelet,
      mode: PaddingMode = 'symmetric',
      level?: number,
  ): DiscreteWavelets.WaveletCoefficients2D {

      const rows = data.length;
      const cols = data[0].length;

      const maxLevels = this.maxLevel2([rows, cols], wavelet);
      let numLevels: number;
      if (level === undefined) {
          numLevels = maxLevels;
      } else {
          if ( ! (Number.isInteger(level) && level > 0) ) {
              throw new Error('Level parameter must be an integer greater than zero');
          }
          if (level > maxLevels) {
              throw new Error('Can\'t decompose more times than the maximum number of levels '+maxLevels);
          }
          numLevels = level;
      }

      let current: number[][] = data;
      // We will use the taint analysis technique to track which coefficients are affected by original data (1) and which not(0)
      // Coefficients that are not affected by original data must be a result of padding; they are synthetic
      let currentMask: number[][] = Array.from({ length: data.length }, () => Array(data[0].length).fill(1));  // Creates an array with the same shape as data, but with all values as 1

      const result: DiscreteWavelets.WaveletCoefficients2D = {
          // We need to initialize approximation:data, because there is the possibility that numLevels==0 
          approximation: data,  // Reminder: WaveletCoefficients2D['approximation'] is number[][]
          details: [],  // Reminder: WaveletCoefficients2D['details'] variable types are an array of objects, where each object has 3 elements, and each element is a number[][]
          size: [rows,cols],
          mask: {
              approximation: Array.from({ length: data.length }, () => Array(data[0].length).fill(1)),
              details: [],
          }
      }

      for (let level = 0; level < numLevels; level++) {

          const bands: DiscreteWavelets.WaveletBands2D = this.dwt2(current, wavelet, mode);  // Perform one level of decomposition
          const bandsMask: DiscreteWavelets.WaveletBands2D = this.dwt2(currentMask, wavelet, 'zero', true);  // We do taint analysis to detect synthetic coefficients

          // We keep LL for the next iteration or as the last-level approximation
          result.approximation = bands.LL;
          if (result.mask)  result.mask.approximation = bandsMask.LL;
          // We push this result to the matrix, so that details[0] will be the first-level decomposition and details[details.length-1] will be the last-level decomposition
          result.details.push({ LH: bands.LH, HL: bands.HL, HH: bands.HH });
          if (result.mask)  result.mask.details.push({ LH: bandsMask.LH, HL: bandsMask.HL, HH: bandsMask.HH });

          current = result.approximation; // Recurse only on the LL band
          if (result.mask)  currentMask = result.mask.approximation;
      }

      return result;
  }

  static idwt2(
      approx: number[][],
      detail: { LH: number[][], HL: number[][], HH: number[][] },
      wavelet: Wavelet,
  ): number[][] {
      const { cA, cD } = this.idwtCols({LL: approx, LH: detail.LH, HL: detail.HL, HH:detail.HH},  wavelet);
      let data = this.idwtRows(cA, cD, wavelet); 
      return data;
  }

  static waverec2(
      coeffs: DiscreteWavelets.WaveletCoefficients2D,
      wavelet: Wavelet,
  ): number[][] {

      let current: number[][] = coeffs.approximation;

      for (let level = coeffs.details.length - 1; level >= 0; level--) {

          current = this.idwt2(current, coeffs.details[level], wavelet);  // Perform one level of recomposition

      }

      // Undo the padding(s) of the last step
      // !!! Assuming that the decimation factor is 2
      if (current.length > coeffs.size[0]) {
          current.pop();
      }
      if (current[0].length > coeffs.size[1]) {
          for (const row of current) {
              row.pop();
          }
      }

      return current;
  } 




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
  static dwt(
    data: ReadonlyArray<number>,
    wavelet: Readonly<Wavelet>,
    mode: PaddingMode = DEFAULT_PADDING_MODE,
    taintAnalysisOnly: boolean = false,
  ): number[][] {
    /* Determine wavelet basis and filters. */
    const waveletBasis: Readonly<WaveletBasis> = basisFromWavelet(wavelet);
    const filters: Readonly<Filters> = waveletBasis.dec;
    assertValidFilters(filters);
    const filterLength: number = filters.low.length;

    /* Add padding. */
    data = this.pad(data, padWidths(data.length, filterLength), mode);
console.log('data:');
console.log(data);
    /* Initialize approximation and detail coefficients. */
    let approx: number[] = [];
    let detail: number[] = [];

    /* Calculate coefficients. */
    for (let offset: number = 0; offset + filterLength <= data.length; offset += filterLength) {
      /* Determine slice of values. */
      const values: ReadonlyArray<number> = data.slice(offset, offset + filterLength);

console.log('filters.low:');
console.log(filters.low);
console.log('filters.high:');
console.log(filters.high);


      if (taintAnalysisOnly) {
        const taintValue = values.some(v => v === 1) ? 1 : 0;
        approx.push(taintValue);
        detail.push(taintValue);
      } else {
        /* Calculate approximation coefficients. */
        approx.push(dot(values, filters.low));

        /* Calculate detail coefficients. */
        detail.push(dot(values, filters.high));
      }
    }

    /* Return approximation and detail coefficients. */
    return [approx, detail];
  }

  /**
   * Calculates the energy as sum of squares of an array of data or
   * coefficients.
   *
   * @param  values Array of data or coefficients.
   * @return        Energy of values as the sum of squares.
   */
  static energy(values: ReadonlyArray<number> | ReadonlyArray<ReadonlyArray<number>>): number {
    let energy: number = 0;
    for (const value of values) {
      if (typeof value === "number") energy += Math.pow(value, 2);
      else energy += this.energy(value);
    }
    return energy;
  }

  /**
   * Single level inverse Discrete Wavelet Transform.
   *
   * @param  approx  Approximation coefficients. If undefined, it will be set to an array of zeros with length equal to the detail coefficients.
   * @param  detail  Detail coefficients. If undefined, it will be set to an array of zeros with length equal to the approximation coefficients.
   * @param  wavelet Wavelet to use.
   * @return         Approximation coefficients of previous level of transform.
   */
  static idwt(
    approx: ReadonlyArray<number> | undefined,
    detail: ReadonlyArray<number> | undefined,
    wavelet: Wavelet
  ): number[] {
    /* Fill empty array with zeros. */
    if (approx === undefined && detail !== undefined) {
      approx = createArray(detail.length, 0);
    }
    if (detail === undefined && approx !== undefined) {
      detail = createArray(approx.length, 0);
    }

    /* Check if some coefficients are undefined. */
    if (approx === undefined || detail === undefined) {
      throw new Error("Coefficients must not be undefined.");
    }

    assertValidApproxDetail(approx, detail);

    /* Determine wavelet basis and filters. */
    const waveletBasis: Readonly<WaveletBasis> = basisFromWavelet(wavelet);
    const filters: Readonly<Filters> = waveletBasis.rec;
    assertValidFilters(filters);
    const filterLength: number = filters.low.length;

    /* Initialize transform. */
    const coeffLength: number = approx.length;
    let pad: ReadonlyArray<number> = createArray(filterLength + (coeffLength - 1) * 2, 0);

    /* Perform inverse Discrete Wavelet Transform. */
    for (let i = 0; i < coeffLength; i++) {
      const offset: number = 2 * i;

      /* Calculate values. */
      let values: ReadonlyArray<number> = pad.slice(offset, offset + filterLength);
      values = add(values, mulScalar(approx[i], filters.low));
      values = add(values, mulScalar(detail[i], filters.high));

      /* Update values. */
      pad = pad
        .slice(0, offset)
        .concat(values)
        .concat(pad.slice(offset + values.length));
    }

    /* Remove padding. */
    return pad.slice(filterLength - 2, pad.length - (filterLength - 2));
  }

  /**
   * Determines the maximum level of useful decomposition.
   *
   * @param  dataLength Length of input data.
   * @param  wavelet    Wavelet to use.
   * @return            Maximum useful level of decomposition.
   */
  static maxLevel(dataLength: number, wavelet: Readonly<Wavelet>): number {
    /* Check for non-integer length. */
    if (!Number.isInteger(dataLength)) {
      throw new Error("Length of data is not an integer. This is not allowed.");
    }

    /* Check for invalid input. */
    if (dataLength < 0) {
      throw new Error("Data length cannot be less than zero.");
    }

    /* Return zero for data of zero length. */
    if (dataLength === 0) return 0;

    /* Determine wavelet basis. */
    const waveletBasis: Readonly<WaveletBasis> = basisFromWavelet(wavelet);

    /* Determine length of filter. */
    const filterLength: number = waveletBasis.dec.low.length;

    // SOURCE: https://pywavelets.readthedocs.io/en/latest/ref/dwt-discrete-wavelet-transform.html#maximum-decomposition-level-dwt-max-level-dwtn-max-level
    return Math.max(0, Math.floor(Math.log2(dataLength / (filterLength - 1))));
  }

  /**
   * Extends a signal with a given padding mode.
   *
   * @param  data      Input data.
   * @param  padWidths Widths of padding at front and back.
   * @param  mode      Signal extension mode.
   * @return           Data with padding.
   */
  static pad(
    data: ReadonlyArray<number>,
    padWidths: Readonly<PaddingWidths>,
    mode: PaddingMode
  ): number[] {
    /* Check for undefined data. */
    if (!data) {
      throw new Error("Cannot add padding to empty data.");
    }

    /* Initialize. */
    const front: number = padWidths[0];
    const back: number = padWidths[1];

    /* Add padding. */
    return createArray(front, (index) => padElement(data, front - 1 - index, true, mode))
      .concat(data)
      .concat(createArray(back, (index) => padElement(data, index, false, mode)));
  }

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
  static wavedec(
    data: ReadonlyArray<number>,
    wavelet: Readonly<Wavelet>,
    mode: PaddingMode = DEFAULT_PADDING_MODE,
    level?: number
  ): number[][] {
    /* Determine decomposition level. */
    if (level === undefined) level = this.maxLevel(data.length, wavelet);
    if (level < 0) {
      throw new Error("Decomposition level must not be less than zero");
    }

    /*  Initialize transform. */
    let coeffs: number[][] = [];
    let approx: ReadonlyArray<number> = data.slice();

    /* Transform. */
    for (let l: number = 1; l <= level; l++) {
      /* Perform single level transform. */
      const approxDetail: ReadonlyArray<ReadonlyArray<number>> = this.dwt(approx, wavelet, mode);
      approx = approxDetail[0];
      const detail: ReadonlyArray<number> = approxDetail[1];

      /* Prepend detail coefficients. */
      coeffs.unshift(detail.slice());
    }

    /* Prepend last approximation. */
    coeffs.unshift(approx.slice());

    /* Return coefficients. */
    return coeffs;
  }

  /**
   * 1D wavelet reconstruction. Inverses a transform by calculating input data
   * from coefficients.
   *
   * @param  coeffs  Coefficients as result of a transform.
   * @param  wavelet Wavelet to use.
   * @return         Input data as result of the inverse transform.
   */
  static waverec(coeffs: ReadonlyArray<ReadonlyArray<number>>, wavelet: Wavelet): number[] {
    /* Check if coefficients are valid. */
    assertValidCoeffs(coeffs);

    /* Determine wavelet. */
    wavelet = basisFromWavelet(wavelet);

    /* Initialize transform. */
    let approx: ReadonlyArray<number> = coeffs[0];

    /* Transform. */
    for (let i: number = 1; i < coeffs.length; i++) {
      /* Initialize detail coefficients. */
      const detail: ReadonlyArray<number> = coeffs[i];

      // TODO: Check if problem of different coefficient lengths because of padding can be solved in a more elegant way.
      if (approx.length === detail.length + 1) {
        approx = approx.slice(0, approx.length - 1);
      }

      /* Calculate previous level of approximation. */
      approx = this.idwt(approx, detail, wavelet);
    }

    /* Return data. */
    return approx.slice();
  }
}
