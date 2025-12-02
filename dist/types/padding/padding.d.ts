export { antisymmetricPadding } from './antisymmetric/antisymmetric';
export { constantPadding } from './constant/constant';
export { periodicPadding } from './periodic/periodic';
export { reflectPadding } from './reflect/reflect';
export { smoothPadding } from './smooth/smooth';
export { symmetricPadding } from './symmetric/symmetric';
export { zeroPadding } from './zero/zero';
export { onePadding } from './one/one';
/**
 * Signal extension mode.
 */
export declare type PaddingMode = 'antisymmetric' | 'constant' | 'periodic' | 'reflect' | 'smooth' | 'symmetric' | 'zero' | 'one';
/**
 * Interface of supported padding mode.
 */
export interface PaddingModes {
    antisymmetric: PaddingMode;
    constant: PaddingMode;
    modes: PaddingMode[];
    periodic: PaddingMode;
    reflect: PaddingMode;
    smooth: PaddingMode;
    symmetric: PaddingMode;
    zero: PaddingMode;
    one: PaddingMode;
}
/**
 * Supported signal extension modes.
 */
export declare const PADDING_MODES: Readonly<PaddingModes>;
/**
 * Number of padded values at front and back.
 */
export declare type PaddingWidths = [number, number];
