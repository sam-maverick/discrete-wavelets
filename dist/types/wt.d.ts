export { PaddingMode, PaddingModes, PaddingWidths, } from './padding/padding';
export { Filters, Wavelet, WaveletBasis, WaveletType, } from './wavelets/wavelets';
import { PaddingMode, PaddingModes, PaddingWidths } from './padding/padding';
import { Wavelet } from "./wavelets/wavelets";
export declare namespace DiscreteWavelets {
    interface WaveletCoefficients2D {
        approximation: number[][];
        details: {
            LH: number[][];
            HL: number[][];
            HH: number[][];
        }[];
        size: [number, number];
    }
    interface WaveletBands2D {
        LL: number[][];
        LH: number[][];
        HL: number[][];
        HH: number[][];
    }
}
/**
 * Collection of methods for Discrete Wavelet Transform (DWT).
 */
export default class DiscreteWavelets {
    /**
     * Contains static information about the signal extension modes.
     */
    static readonly Modes: Readonly<PaddingModes>;
    private static transposeMatrix;
    /**
     *     2-D FUNCTIONS
     */
    /**
     * Determines the maximum level of useful decomposition in 2d.
     *
     * @param  dataLength              Length of input data.
     * @param  wavelet                 Wavelet to use.
     * @param  roundingOption          When set to LOW, it uses floor(log_2(.)) to calculate the maximum level. When set to HIGH, it uses ceil(floor_2(.)). Defaults to LOW.
     * @param  allowDimensionDowngrade When set to true, it allows to consider decompositions where one of the dimensions disappears. When set to false, it forces all decompositions to have 2x2 input size at least.
     * @return                         Maximum useful level of decomposition.
     */
    static maxLevel2(size: [number, number], wavelet: Wavelet, roundingOption?: 'LOW' | 'HIGH', allowDimensionDowngrade?: boolean): number;
    private static dwtRows;
    private static dwtCols;
    private static idwtRows;
    private static idwtCols;
    /**
     * Single level 2D Discrete Wavelet Transform.
     *
     * @param  data              Input data.
     * @param  wavelet           Wavelet to use.
     * @param  mode              Signal extension mode.
     * @param  taintAnalysisOnly If set to true it will only calculate the syntheticityMask matrix, otherwise it will calculate the DWT coefficients
     * @return                   Approximation and detail coefficients as result of the transform.
     */
    static dwt2(data: number[][], wavelet: Wavelet, mode?: PaddingMode, taintAnalysisOnly?: boolean): DiscreteWavelets.WaveletBands2D;
    /**
     * 2D wavelet decomposition. Transforms data by calculating coefficients from
     * input data.
     *
     * @param  data                    Input data.
     * @param  wavelet                 Wavelet to use.
     * @param  mode                    Signal extension mode.
     * @param  level                   Decomposition level or roundingOption parameter for calculating via maxLevel2 function. Defaults to 'LOW'.
     * @param  allowDimensionDowngrade allowDimensionDowngrade parameter for maxLevel2. Defaults to true. Only applies when level parameter is 'LOW' or 'HIGH'.
     * @return                         Coefficients as result of the transform, and the syntheticityMask matrix that indicates which 0 coefficients are meaningless.
     */
    static wavedec2(data: number[][], wavelet: Wavelet, mode?: PaddingMode, level?: number | 'LOW' | 'HIGH', allowDimensionDowngrade?: boolean): {
        coeffs: DiscreteWavelets.WaveletCoefficients2D;
        syntheticityMask: DiscreteWavelets.WaveletCoefficients2D;
    };
    /**
     * Single level inverse 2D Discrete Wavelet Transform.
     *
     * @param  approx  Approximation coefficients. If undefined, it will be set to an array of zeros with length equal to the detail coefficients.
     * @param  detail  Detail coefficients. If undefined, it will be set to an array of zeros with length equal to the approximation coefficients.
     * @param  wavelet Wavelet to use.
     * @return         Approximation coefficients of previous level of transform.
     */
    static idwt2(approx: number[][], detail: {
        LH: number[][];
        HL: number[][];
        HH: number[][];
    }, wavelet: Wavelet): number[][];
    /**
     * 2D wavelet reconstruction. Inverses a transform by calculating input data
     * from coefficients.
     *
     * @param  coeffs  Coefficients as result of a transform.
     * @param  wavelet Wavelet to use.
     * @return         Input data as result of the inverse transform.
     */
    static waverec2(coeffs: DiscreteWavelets.WaveletCoefficients2D, wavelet: Wavelet): number[][];
    /**
     *     1-D FUNCTIONS
     */
    /**
     * Single level 1D Discrete Wavelet Transform.
     *
     * @param  data    Input data.
     * @param  wavelet Wavelet to use.
     * @param  mode    Signal extension mode.
     * @return         Approximation and detail coefficients as result of the transform.
     */
    static dwt(data: ReadonlyArray<number>, wavelet: Readonly<Wavelet>, mode?: PaddingMode, taintAnalysisOnly?: boolean): number[][];
    /**
     * Calculates the energy as sum of squares of an array of data or
     * coefficients.
     *
     * @param  values Array of data or coefficients.
     * @return        Energy of values as the sum of squares.
     */
    static energy(values: ReadonlyArray<number> | ReadonlyArray<ReadonlyArray<number>>): number;
    /**
     * Single level inverse 1D Discrete Wavelet Transform.
     *
     * @param  approx  Approximation coefficients. If undefined, it will be set to an array of zeros with length equal to the detail coefficients.
     * @param  detail  Detail coefficients. If undefined, it will be set to an array of zeros with length equal to the approximation coefficients.
     * @param  wavelet Wavelet to use.
     * @return         Approximation coefficients of previous level of transform.
     */
    static idwt(approx: ReadonlyArray<number> | undefined, detail: ReadonlyArray<number> | undefined, wavelet: Wavelet): number[];
    /**
     * Determines the maximum level of useful decomposition in 1D.
     *
     * @param  dataLength     Length of input data.
     * @param  wavelet        Wavelet to use.
     * @param  roundingOption When set to LOW, it uses floor(log_2(.)) to calculate the maximum level. When set to HIGH, it uses ceil(floor_2(.)). Defaults to LOW
     * @return                Maximum useful level of decomposition.
     */
    static maxLevel(dataLength: number, wavelet: Readonly<Wavelet>, roundingOption?: 'LOW' | 'HIGH'): number;
    /**
     * Extends a signal with a given padding mode.
     *
     * @param  data      Input data.
     * @param  padWidths Widths of padding at front and back.
     * @param  mode      Signal extension mode.
     * @return           Data with padding.
     */
    static pad(data: ReadonlyArray<number>, padWidths: Readonly<PaddingWidths>, mode: PaddingMode): number[];
    /**
     * 1D wavelet decomposition. Transforms data by calculating coefficients from
     * input data.
     *
     * @param  data           Input data.
     * @param  wavelet        Wavelet to use.
     * @param  mode           Signal extension mode.
     * @param  level          Decomposition level or roundingOption for calculating via maxLevel function. Defaults to level calculated by maxLevel function with 'LOW' Roundingoption.
     * @return                Coefficients as result of the transform.
     */
    static wavedec(data: ReadonlyArray<number>, wavelet: Readonly<Wavelet>, mode?: PaddingMode, level?: number | 'LOW' | 'HIGH'): number[][];
    /**
     * 1D wavelet reconstruction. Inverses a transform by calculating input data
     * from coefficients.
     *
     * @param  coeffs  Coefficients as result of a transform.
     * @param  wavelet Wavelet to use.
     * @return         Input data as result of the inverse transform.
     */
    static waverec(coeffs: ReadonlyArray<ReadonlyArray<number>>, wavelet: Wavelet): number[];
}
