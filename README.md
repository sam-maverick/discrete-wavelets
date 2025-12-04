# Discrete Wavelets

A [Discrete Wavelet Transform (DWT)](https://en.wikipedia.org/wiki/Discrete_wavelet_transform) library for the web, for one-dimensional and two-dimensional inputs. This project is a fork of [https://github.com/Symmetronic/discrete-wavelets](https://github.com/Symmetronic/discrete-wavelets).

It performs transform to padded data only, in other words, a padding mode is mandatory. See below the supported padding modes.



## Importing this library

### Node Modules

- Run `npm install github:sam-maverick/discrete-wavelets`
- Add these imports to your program:
  `import WT from "discrete-wavelets";`
  `import {DiscreteWavelets as DW} from "discrete-wavelets";`
- Then you can use the library in your code.



## Types

The library uses the following types:

- [PaddingMode](#PaddingMode): Signal extension modes.
- [Wavelets](#Wavelets): Wavelet bases.

### PaddingMode

The following values for `PaddingMode` are supported at the moment:

| Name                  | Value             | Description                         |
| --------------------- | ----------------- | ----------------------------------- |
| Zero Padding          | `'zero'`          | Adding zeros.                       |
| One Padding           | `'one'`           | Adding ones.                        |
| Constant Padding      | `'constant'`      | Replication of border values.       |
| Symmetric Padding     | `'symmetric'`     | Mirroring of samples.               |
| Reflect Padding       | `'reflect'`       | Reflecting of samples.              |
| Periodic Padding      | `'periodic'`      | Treating signal as a periodic one.  |
| Smooth Padding        | `'smooth'`        | Signal extended as a straight line. |
| Antisymmetric Padding | `'antisymmetric'` | Mirroring and negation of samples.  |

You can get a list of the supported signal extension modes:

```javascript
console.log(WT.Modes.modes);
// expected output: Array ['zero', 'one', constant', 'symmetric', 'periodic', 'smooth', 'reflect', 'antisymmetric']
```

### Wavelets

The following `Wavelet` types are supported at the moment:

| Wavelet                                                           | Aliases                   |
| ----------------------------------------------------------------- | ------------------------- |
| Daubechies 1 / [Haar](https://de.wikipedia.org/wiki/Haar-Wavelet) | `'db1'`, `'D2'`, `'haar'` |
| Daubechies 2                                                      | `'db2'`, `'D4'`           |
| Daubechies 3                                                      | `'db3'`, `'D6'`           |
| Daubechies 4                                                      | `'db4'`, `'D8'`           |
| Daubechies 5                                                      | `'db5'`, `'D10'`          |
| Daubechies 6                                                      | `'db6'`, `'D12'`          |
| Daubechies 7                                                      | `'db7'`, `'D14'`          |
| Daubechies 8                                                      | `'db8'`, `'D16'`          |
| Daubechies 9                                                      | `'db9'`, `'D18'`          |
| Daubechies 10                                                     | `'db10'`, `'D20'`         |



## Interfaces

The library uses the following interfaces:

- [WaveletBands2D](#WaveletBands2D): The four bands that result from a single-level decomposition.
- [WaveletCoefficients2D](#WaveletCoefficients2D): The set of coefficients that result from the transformation, plus the original input dimensions.

### WaveletBands2D

```
LL: number[][],
LH: number[][],
HL: number[][],
HH: number[][],
```

### WaveletCoefficients2D

```
// Approximation is the LL band of the last decomposition.
approximation: number[][],
// Details consist of the LH,HL,HH bands of each decomposition level.
// Note that details.LL is not needed to reconstruct the data since it is redundant information 
// because it is covered in higher-decomposition levels. However, it is included as extra information.
details: WaveletBands2D[],  // Mind that this is an array of objects!
// Information of the original input size must be kept to reliably undo the 
// padding in the last step of waverec2().
size: [number, number],
```



## API

The library offers the functions below. A '2' at the end of a function name means that it is for 2D instead of 1D.

- Discrete Wavelet Transform (DWT)
  - [dwt](#dwt) and [dwt2](#dwt2): Single level transform.
  - [wavedec](#wavedec) and [wavedec2](#wavedec2): Wavelet decomposition. Transforms data by calculating coefficients from input data.
- Inverse Discrete Wavelet Transform (IDWT)
  - [idwt](#idwt) and [idwt2](#idwt2): Single level inverse transform.
  - [waverec](#waverec) and [waverec2](#waverec2): Eavelet reconstruction. Inverses a transform by calculating input data from coefficients.
- Other
  - [energy](#energy): Calculates the energy as sum of squares of an array of data or coefficients.
  - [maxLevel](#maxLevel) and [maxLevel2](#maxLevel2): Determines the maximum level of useful decomposition.
  - [pad](#pad): Extends a signal with a given padding mode.

### dwt and dwt2

Single level Discrete Wavelet Transform.

**Arguments**

- `data` (`number[]` or `number[][]`): Input data.
- `wavelet` (`Wavelet`): Wavelet to use.
- `padding` (`PaddingMode`): Signal extension mode. Defaults to `'symmetric'`.

**Return**

`number[][]` or `DW.WaveletBands2D`: Approximation and detail coefficients as result of the transform in one decomposition step.

**Example**

```javascript
var coeffs = WT.dwt([1, 2, 3, 4], "haar");

console.log(coeffs);
// expected output: Array [[2.1213203435596425, 4.9497474683058326], [-0.7071067811865475, -0.7071067811865475]]
```

### wavedec and wavedec2

Wavelet decomposition. Transforms data by calculating coefficients from input data.

**Arguments**

- `data` (`number[]` or `number[][]`): Input data.
- `wavelet` (`Wavelet`): Wavelet to use.
- `padding` (`PaddingMode`): Signal extension mode. Defaults to `'symmetric'`.
- `level` (`number|'LOW|'HIGH'`): Either the decomposition level or the roundingOption for calculating number of decompositions via [maxLevel](#maxLevel) or [maxLevel2](#maxLevel2) function. Defaults to 'LOW'.

**Return**

`number[][]` or `{ coeffs: DW.WaveletCoefficients2D, syntheticityMask: DW.WaveletCoefficients2D, contaminationMask: DW.WaveletCoefficients2D }`:

- ***number\[]\[]*** and ***coeffs*** are the coefficients as result of the transform, for 1D and 2D respectively.
- In 2D, the ***syntheticityMask*** is a data structure with the same shape as coeffs, where a '0' means that it is a position that holds actual data, and a '1' means that the correspondiing value in coeffs for that position has a zero (or a near-zero, if there are precision errors) that resulted from the synthetic data introduced by the padding. Note that syntheticityMask depends on the shape (or, size) of the data, not the values of the data.
- In 2D, the ***contaminationMask*** is a data structure with the same shape as coeffs, where a '0' means that it is a position that holds a coefficient not affected by edge effects, and something greater than zero otherwise. When a coefficient is affected by edge effects, it becomes less meaningful because its value is calculated from less inputs. The number in contaminationMask indicates the number of inputs that have been missed as a result of the edge effects. For instance, if a coefficient is calculated as a function of inputs f(a,b,c,d) and for a certain coefficient position we have that a=b will always hold (as a result of the edge effect), then the contamination level is (at least) 1 because b is irrelevant. Note that syntheticityMask depends on the shape (or, size) of the data, not the values of the data.

> [!WARNING]
>
> At the moment, syntheticityMask data is only supported in the `haar` wavelet with `symmetric` padding.

**Example**

```javascript
var coeffs = WT.wavedec([1, 2, 3, 4], "haar", "HIGH");

console.log(coeffs);
// expected output: Array [[4.999999999999999], [-1.9999999999999993], [-0.7071067811865475, -0.7071067811865475]]
```

_Be aware that due to floating point imprecision the result diverges slightly from the analytical solution `[[5], [-2], [-0.7071067811865475, -0.7071067811865475]]`_

### idwt and idwt2

Single level inverse Discrete Wavelet Transform.

**Arguments**

- `approx` (`number[]` or `number[][]`): Approximation coefficients.
- `detail` (`number[]` or `{ LH: number[][], HL: number[][], HH: number[][] }`): Detail coefficients.
- `wavelet` (`Wavelet`): Wavelet to use.

**Return**

`number[]` or `number[][]`: Approximation coefficients of previous level of transform.

**Example**

```javascript
var rec = WT.idwt(
  [(1 + 2) / Math.SQRT2, (3 + 4) / Math.SQRT2],
  [(1 - 2) / Math.SQRT2, (3 - 4) / Math.SQRT2],
  "haar",
);

console.log(rec);
// expected output: Array [0.9999999999999999, 1.9999999999999996, 2.9999999999999996, 3.9999999999999996]
```

_Be aware that due to floating point imprecision the result diverges slightly from the analytical solution `[1, 2, 3, 4]`_

### waverec and waverec2

Wavelet reconstruction. Inverses a transform by calculating input data from coefficients.

> [!WARNING]
>
> In 1D, this function assumes that the shape of the original data is the same shape as `coeffs`. If you want to be able to restore the original shape, you will have to store the original data size separately, and then trim the output of waverec accordingly, if necessary. This has not been "fixed", to preserve legacy behavior.
> In 2D, `DW.WaveletCoefficients2D.size` is used to accurately restore the data with the original shape.

**Arguments**

- `coeffs` (`number[][]` or `DW.WaveletCoefficients2D`): Coefficients as result of a transform.
- `wavelet` (`Wavelet`): Wavelet to use.

**Return**

`number[]` or `number[][]`: Original data as result of the inverse transform.

**Example**

```javascript
var data = WT.waverec([[5], [-2], [-1 / Math.SQRT2, -1 / Math.SQRT2]], "haar");

console.log(data);
// expected output: Array [0.9999999999999999, 1.9999999999999996, 2.999999999999999, 3.999999999999999]
```

_Be aware that due to floating point imprecision the result diverges slightly from the analytical solution `[1, 2, 3, 4]`_

### energy

Calculates the energy as sum of squares of an array of data or coefficients.

**Argument**

- `values` (`number[] | number[][]`): Array of data or coefficients.

**Return**

`number`: Energy of values as the sum of squares.

**Examples**

```javascript
console.log(WT.energy([-1, 2, 6, 1]));
// expected output: 42

console.log(WT.energy([[5], [-2], [-1 / Math.SQRT2, -1 / Math.SQRT2]]));
// expected output: 30
```

### maxLevel and maxLevel2

Determines the maximum level of useful decomposition.

**Arguments**

- `dataLength` (`number` or `[number,number]`): Dimensions of input data.
- `wavelet` (`Wavelet`): Wavelet to use.
- `roundingOption` (`'LOW'|'HIGH'`):
  When set to LOW, it uses floor(log_2(.)) to calculate the maximum level, meaning that, for example, for dataLength=5 and wavelet="haar" it will give 2. This ensures that if you perform this number of decomposition levels, after each decomposition level the set of approximation coefficients and the set of detail coefficients will both contain at least one coefficient that is uncorrupted by edge effects caused by signal padding. This is commonly known as "*number of useful levels of decomposition*". Check this [source](https://pywavelets.readthedocs.io/en/latest/ref/dwt-discrete-wavelet-transform.html#maximum-decomposition-level-dwt-max-level-dwtn-max-level).
  When set to HIGH, it uses ceil(log_2(.)) to calculate the maximum level, meaning that, for example, for dataLength=5 and wavelet="haar" it will give 3. This ensures that you will always end with a single value as approximation coefficient, as opposed to a list of values. This option is recommended if you want to perform full decomposition.
  Defaults to LOW.
- `allowDimensionDowngrade` (`boolean`): When set to true, it considers as valid the decompositions where one of the dimensions virtually disappears. In other words, if width>> height or if width<<height we will keep decomposing even if there is only one row or one column with non artificial-zero values). When set to false, it forces all level decompositions to yield a 2x2 DiscreteWavelets.WaveletBands2D that is not equivalent to a 1D DWT single-level decomposition. A 1D DWT single-level decomposition can be represented by two `number[]` vectors, corresponding to the L and H band.
  Defaults to true.

**Return**

`number`: Maximum level of decomposition.

**Examples**

```javascript
var maxLevel = WT.maxLevel(4, "haar", "HIGH");

console.log(maxLevel);
// expected output: 2
```

```javascript
var maxLevel = WT.maxLevel(1024, "haar", "HIGH");

console.log(maxLevel);
// expected output: 10
```

### pad

Extends a signal with a given padding mode.

**Arguments**

- `data` (`number[]`): Input data.
- `padWidths` (`[number, number]`): Widths of padding at front and back.
- `padding` (`PaddingMode`): Signal extension mode.

**Return**

`number[]`: Data with padding.

**Example**

```javascript
var pad = WT.pad([42, 51], [2, 1], "zero");

console.log(pad);
// expected output: Array [0, 0, 42, 51, 0]
```



## NPM scripts

- `npm install`: Install dependencies
- `npm test`: Run test suite
- `npm start`: Run `npm run build` in watch mode
- `npm run test:watch`: Run test suite in [interactive watch mode](http://facebook.github.io/jest/docs/cli.html#watch)
- `npm run test:prod`: Run linting and generate coverage
- `npm run build`: Generate bundles and typings, create docs
- `npm run lint`: Lints code
