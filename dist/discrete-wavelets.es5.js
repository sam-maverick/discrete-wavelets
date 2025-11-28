/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

/**
 * Symmetric padding.
 */
var SYMMETRIC_PADDING = 'symmetric';
/**
 * Returns a single value of symmetric padding.
 *
 * @param  data    Input values.
 * @param  index   Index of padding.
 * @param  inverse True if the direction should be inversed.
 * @return         Single padding value.
 */
function symmetricPadding(data, index, inverse) {
    if (inverse === void 0) { inverse = false; }
    /* Check if data has length larger than zero. */
    if (data.length === 0) {
        throw new Error('Cannot determine symmetric padding for data of zero length.');
    }
    /* Determine symmetric padding. */
    var dirChanges = Math.floor(index / data.length);
    var inversions = (inverse) ? dirChanges : dirChanges + 1;
    return (inversions % 2 === 0)
        ? data[index % data.length]
        : data[data.length - 1 - (index % data.length)];
}

/**
 * Antisymmetric padding.
 */
var ANTISYMMETRIC_PADDING = 'antisymmetric';
/**
 * Returns a single value of antisymmetric padding.
 *
 * @param  data    Input values.
 * @param  index   Index of padding.
 * @param  inverse True if the direction should be inversed.
 * @return         Single padding value.
 */
function antisymmetricPadding(data, index, inverse) {
    if (inverse === void 0) { inverse = false; }
    var dirChanges = Math.floor(index / data.length);
    var sign = (dirChanges % 2 === 0) ? -1 : 1;
    return sign * symmetricPadding(data, index, inverse);
}

/**
 * Constant padding.
 */
var CONSTANT_PADDING = 'constant';
/**
 * Returns a single value of constant padding.
 *
 * @param  data    Input values.
 * @param  inverse True if the direction should be inversed.
 * @return         Single padding value.
 */
function constantPadding(data, inverse) {
    if (inverse === void 0) { inverse = false; }
    /* Check if data has length larger than zero. */
    if (data.length === 0) {
        throw new Error('Cannot determine constant padding for data of zero length.');
    }
    /* Determine constant padding. */
    return (!inverse)
        ? data[data.length - 1]
        : data[0];
}

/**
 * Periodic padding.
 */
var PERIODIC_PADDING = 'periodic';
/**
 * Returns a single value of periodic padding.
 *
 * @param  data    Input values.
 * @param  index   Index of padding.
 * @param  inverse True if the direction should be inversed.
 * @return         Single padding value.
 */
function periodicPadding(data, index, inverse) {
    if (inverse === void 0) { inverse = false; }
    /* Check if data has length larger than zero. */
    if (data.length === 0) {
        throw new Error('Cannot determine periodic padding for data of zero length.');
    }
    /* Determine periodic padding. */
    return (!inverse)
        ? data[index % data.length]
        : data[data.length - 1 - (index % data.length)];
}

/**
 * Reflect padding.
 */
var REFLECT_PADDING = 'reflect';
/**
 * Returns a single value of reflect padding.
 *
 * @param  data    Input values.
 * @param  index   Index of padding.
 * @param  inverse True if the direction should be inversed.
 * @return         Single padding value.
 */
function reflectPadding(data, index, inverse) {
    if (inverse === void 0) { inverse = false; }
    /* Check if data has length larger than zero. */
    if (data.length === 0) {
        throw new Error('Cannot determine reflect padding for data of zero length.');
    }
    /* Return constant value for data of length one. */
    if (data.length === 1)
        return data[0];
    /* Determine reflect padding. */
    var dirChanges = Math.floor(index / (data.length - 1));
    var inversions = (inverse) ? dirChanges : dirChanges + 1;
    return (inversions % 2 === 0)
        ? data[index % (data.length - 1) + 1]
        : data[data.length - 2 - (index % (data.length - 1))];
}

/**
 * Smooth padding.
 */
var SMOOTH_PADDING = 'smooth';
/**
 * Returns a single value of smooth padding.
 *
 * @param  data    Input values.
 * @param  index   Index of padding.
 * @param  inverse True if the direction should be inversed.
 * @return         Single padding value.
 */
function smoothPadding(data, index, inverse) {
    if (inverse === void 0) { inverse = false; }
    /* Check if data has length larger than zero. */
    if (data.length === 0) {
        throw new Error('Cannot determine smooth padding for data of zero length.');
    }
    /* Determine line equation. */
    var end = data.length - 1;
    var offset = (inverse) ? data[0] : data[end];
    var slope = (inverse)
        ? (data.length === 1) ? data[0] : data[0] - data[1]
        : (data.length === 1) ? -data[0] : data[end] - data[end - 1];
    return offset + (index + 1) * slope;
}

/**
 * Zero padding.
 */
var ZERO_PADDING = 'zero';
/**
 * Returns a single value of zero padding.
 *
 * @return         Single padding value.
 */
function zeroPadding() {
    return 0;
}

/**
 * Supported signal extension modes.
 */
var PADDING_MODES = {
    antisymmetric: ANTISYMMETRIC_PADDING,
    constant: CONSTANT_PADDING,
    periodic: PERIODIC_PADDING,
    reflect: REFLECT_PADDING,
    smooth: SMOOTH_PADDING,
    symmetric: SYMMETRIC_PADDING,
    zero: ZERO_PADDING,
    modes: [
        ZERO_PADDING,
        CONSTANT_PADDING,
        SYMMETRIC_PADDING,
        PERIODIC_PADDING,
        SMOOTH_PADDING,
        REFLECT_PADDING,
        ANTISYMMETRIC_PADDING,
    ],
};

// SOURCE: https://github.com/PyWavelets/pywt/blob/master/pywt/_extensions/c/wavelets_coeffs.template.h
/**
 * Haar wavelet scaling numbers.
 */
var HaarWavelet = [
    1 / Math.SQRT2,
    1 / Math.SQRT2
];
/**
 * Daubechies 2 scaling numbers.
 */
var Db2Wavelet = [
    (1 + Math.sqrt(3)) / (4 * Math.SQRT2),
    (3 + Math.sqrt(3)) / (4 * Math.SQRT2),
    (3 - Math.sqrt(3)) / (4 * Math.SQRT2),
    (1 - Math.sqrt(3)) / (4 * Math.SQRT2)
];
/**
 * Daubechies 3 scaling numbers.
 */
var Db3Wavelet = [
    3.326705529500826159985115891390056300129233992450683597084705e-01,
    8.068915093110925764944936040887134905192973949948236181650920e-01,
    4.598775021184915700951519421476167208081101774314923066433867e-01,
    -1.350110200102545886963899066993744805622198452237811919756862e-01,
    -8.544127388202666169281916918177331153619763898808662976351748e-02,
    3.522629188570953660274066471551002932775838791743161039893406e-02
];
/**
 * Daubechies 4 scaling numbers.
 */
var Db4Wavelet = [
    2.303778133088965008632911830440708500016152482483092977910968e-01,
    7.148465705529156470899219552739926037076084010993081758450110e-01,
    6.308807679298589078817163383006152202032229226771951174057473e-01,
    -2.798376941685985421141374718007538541198732022449175284003358e-02,
    -1.870348117190930840795706727890814195845441743745800912057770e-01,
    3.084138183556076362721936253495905017031482172003403341821219e-02,
    3.288301166688519973540751354924438866454194113754971259727278e-02,
    -1.059740178506903210488320852402722918109996490637641983484974e-02
];
/**
 * Daubechies 5 scaling numbers.
 */
var Db5Wavelet = [
    1.601023979741929144807237480204207336505441246250578327725699e-01,
    6.038292697971896705401193065250621075074221631016986987969283e-01,
    7.243085284377729277280712441022186407687562182320073725767335e-01,
    1.384281459013207315053971463390246973141057911739561022694652e-01,
    -2.422948870663820318625713794746163619914908080626185983913726e-01,
    -3.224486958463837464847975506213492831356498416379847225434268e-02,
    7.757149384004571352313048938860181980623099452012527983210146e-02,
    -6.241490212798274274190519112920192970763557165687607323417435e-03,
    -1.258075199908199946850973993177579294920459162609785020169232e-02,
    3.335725285473771277998183415817355747636524742305315099706428e-03
];
/**
 * Daubechies 6 scaling numbers.
 */
var Db6Wavelet = [
    1.115407433501094636213239172409234390425395919844216759082360e-01,
    4.946238903984530856772041768778555886377863828962743623531834e-01,
    7.511339080210953506789344984397316855802547833382612009730420e-01,
    3.152503517091976290859896548109263966495199235172945244404163e-01,
    -2.262646939654398200763145006609034656705401539728969940143487e-01,
    -1.297668675672619355622896058765854608452337492235814701599310e-01,
    9.750160558732304910234355253812534233983074749525514279893193e-02,
    2.752286553030572862554083950419321365738758783043454321494202e-02,
    -3.158203931748602956507908069984866905747953237314842337511464e-02,
    5.538422011614961392519183980465012206110262773864964295476524e-04,
    4.777257510945510639635975246820707050230501216581434297593254e-03,
    -1.077301085308479564852621609587200035235233609334419689818580e-03
];
/**
 * Daubechies 7 scaling numbers.
 */
var Db7Wavelet = [
    7.785205408500917901996352195789374837918305292795568438702937e-02,
    3.965393194819173065390003909368428563587151149333287401110499e-01,
    7.291320908462351199169430703392820517179660611901363782697715e-01,
    4.697822874051931224715911609744517386817913056787359532392529e-01,
    -1.439060039285649754050683622130460017952735705499084834401753e-01,
    -2.240361849938749826381404202332509644757830896773246552665095e-01,
    7.130921926683026475087657050112904822711327451412314659575113e-02,
    8.061260915108307191292248035938190585823820965629489058139218e-02,
    -3.802993693501441357959206160185803585446196938467869898283122e-02,
    -1.657454163066688065410767489170265479204504394820713705239272e-02,
    1.255099855609984061298988603418777957289474046048710038411818e-02,
    4.295779729213665211321291228197322228235350396942409742946366e-04,
    -1.801640704047490915268262912739550962585651469641090625323864e-03,
    3.537137999745202484462958363064254310959060059520040012524275e-04
];
/**
 * Daubechies 8 scaling numbers.
 */
var Db8Wavelet = [
    5.441584224310400995500940520299935503599554294733050397729280e-02,
    3.128715909142999706591623755057177219497319740370229185698712e-01,
    6.756307362972898068078007670471831499869115906336364227766759e-01,
    5.853546836542067127712655200450981944303266678053369055707175e-01,
    -1.582910525634930566738054787646630415774471154502826559735335e-02,
    -2.840155429615469265162031323741647324684350124871451793599204e-01,
    4.724845739132827703605900098258949861948011288770074644084096e-04,
    1.287474266204784588570292875097083843022601575556488795577000e-01,
    -1.736930100180754616961614886809598311413086529488394316977315e-02,
    -4.408825393079475150676372323896350189751839190110996472750391e-02,
    1.398102791739828164872293057263345144239559532934347169146368e-02,
    8.746094047405776716382743246475640180402147081140676742686747e-03,
    -4.870352993451574310422181557109824016634978512157003764736208e-03,
    -3.917403733769470462980803573237762675229350073890493724492694e-04,
    6.754494064505693663695475738792991218489630013558432103617077e-04,
    -1.174767841247695337306282316988909444086693950311503927620013e-04
];
/**
 * Daubechies 9 scaling numbers.
 */
var Db9Wavelet = [
    3.807794736387834658869765887955118448771714496278417476647192e-02,
    2.438346746125903537320415816492844155263611085609231361429088e-01,
    6.048231236901111119030768674342361708959562711896117565333713e-01,
    6.572880780513005380782126390451732140305858669245918854436034e-01,
    1.331973858250075761909549458997955536921780768433661136154346e-01,
    -2.932737832791749088064031952421987310438961628589906825725112e-01,
    -9.684078322297646051350813353769660224825458104599099679471267e-02,
    1.485407493381063801350727175060423024791258577280603060771649e-01,
    3.072568147933337921231740072037882714105805024670744781503060e-02,
    -6.763282906132997367564227482971901592578790871353739900748331e-02,
    2.509471148314519575871897499885543315176271993709633321834164e-04,
    2.236166212367909720537378270269095241855646688308853754721816e-02,
    -4.723204757751397277925707848242465405729514912627938018758526e-03,
    -4.281503682463429834496795002314531876481181811463288374860455e-03,
    1.847646883056226476619129491125677051121081359600318160732515e-03,
    2.303857635231959672052163928245421692940662052463711972260006e-04,
    -2.519631889427101369749886842878606607282181543478028214134265e-04,
    3.934732031627159948068988306589150707782477055517013507359938e-05
];
/**
 * Daubechies 10 scaling numbers.
 */
var Db10Wavelet = [
    2.667005790055555358661744877130858277192498290851289932779975e-02,
    1.881768000776914890208929736790939942702546758640393484348595e-01,
    5.272011889317255864817448279595081924981402680840223445318549e-01,
    6.884590394536035657418717825492358539771364042407339537279681e-01,
    2.811723436605774607487269984455892876243888859026150413831543e-01,
    -2.498464243273153794161018979207791000564669737132073715013121e-01,
    -1.959462743773770435042992543190981318766776476382778474396781e-01,
    1.273693403357932600826772332014009770786177480422245995563097e-01,
    9.305736460357235116035228983545273226942917998946925868063974e-02,
    -7.139414716639708714533609307605064767292611983702150917523756e-02,
    -2.945753682187581285828323760141839199388200516064948779769654e-02,
    3.321267405934100173976365318215912897978337413267096043323351e-02,
    3.606553566956169655423291417133403299517350518618994762730612e-03,
    -1.073317548333057504431811410651364448111548781143923213370333e-02,
    1.395351747052901165789318447957707567660542855688552426721117e-03,
    1.992405295185056117158742242640643211762555365514105280067936e-03,
    -6.858566949597116265613709819265714196625043336786920516211903e-04,
    -1.164668551292854509514809710258991891527461854347597362819235e-04,
    9.358867032006959133405013034222854399688456215297276443521873e-05,
    -1.326420289452124481243667531226683305749240960605829756400674e-05
];

/**
 * Mapping of wavelet type keys to scaling numbers.
 */
var ScalingNumbers = {
    'db1': HaarWavelet,
    'db2': Db2Wavelet,
    'db3': Db3Wavelet,
    'db4': Db4Wavelet,
    'db5': Db5Wavelet,
    'db6': Db6Wavelet,
    'db7': Db7Wavelet,
    'db8': Db8Wavelet,
    'db9': Db9Wavelet,
    'db10': Db10Wavelet,
    'D2': HaarWavelet,
    'D4': Db2Wavelet,
    'D6': Db3Wavelet,
    'D8': Db4Wavelet,
    'D10': Db5Wavelet,
    'D12': Db6Wavelet,
    'D14': Db7Wavelet,
    'D16': Db8Wavelet,
    'D18': Db9Wavelet,
    'D20': Db10Wavelet,
    'haar': HaarWavelet,
};

/**
 * Calculates the element-wise sum of two arrays.
 *
 * @param  a First array.
 * @param  b Second array.
 * @return   Element-wise sum.
 */
function add(a, b) {
    /* Check for same length of arrays. */
    if (a.length !== b.length) {
        throw new Error('Both arrays have to have the same length.');
    }
    /* Calculate element-wise sum. */
    return a.map(function (value, index) { return value + b[index]; });
}
/**
 * Asserts if approximation and detail coefficients are valid or throws an
 * error if they are invalid.
 *
 * @param  approx Approximation coefficients.
 * @param  detail Detail coefficients.
 * @return        True if the coefficients are valid, otherwise throws an error.
 */
function assertValidApproxDetail(approx, detail) {
    /* Check if coefficients have equal length. */
    if (approx.length !== detail.length) {
        throw new Error('Approximation and detail coefficients must have equal length.');
    }
    /* Check for coefficients of zero length. */
    if (approx.length === 0) {
        throw new Error('Approximation and detail coefficients must not have zero length.');
    }
    return true;
}
/**
 * Asserts if coefficients are valid or throws an error if they are invalid.
 *
 * @param  coeffs Coefficients to test.
 * @return        True if the coefficients are valid, otherwise throws an error.
 */
function assertValidCoeffs(coeffs) {
    /* Check if at least an array of approximation coefficients is given. */
    if (coeffs.length < 1) {
        throw new Error('Invalid coefficients. Array length must not be zero.');
    }
    return true;
}
/**
 * Asserts if wavelet filters are valid or throws an error if they are invalid.
 *
 * @param  filters Wavelet filters to test.
 * @return         True if the wavelet filters are valid, otherwise throws an error.
 */
function assertValidFilters(filters) {
    /* Check if high-pass and low-pass filters have equal length. */
    if (filters.high.length !== filters.low.length) {
        throw new Error('High-pass and low-pass filters have to have equal length.');
    }
    /* Check if filter length is larger than or equal to two. */
    if (filters.low.length < 2) {
        throw new Error('Wavelet filter length has to be larger than or equal to two.');
    }
    return true;
}
/**
 * Determines a wavelet basis from a wavelet type or basis.
 *
 * @param  wavelet Wavelet type or basis.
 * @return         Wavelet basis.
 */
function basisFromWavelet(wavelet) {
    return (typeof wavelet !== 'string')
        ? wavelet
        : waveletFromScalingNumbers(ScalingNumbers[wavelet]);
}
/**
 * Creates an array and populates it.
 *
 * @param  length   Length of the array.
 * @param  populate Function to populate the array.
 * @return          Populated array with specified length.
 */
function createArray(length, populate) {
    if (populate === void 0) { populate = 0; }
    /* Check for non-integer length. */
    if (!Number.isInteger(length)) {
        throw new Error('Length has to be an integer.');
    }
    /* Check for length less than zero. */
    if (length < 0) {
        throw new Error('Length must not be smaller than zero.');
    }
    /* Create and populate array. */
    return Array.apply(null, Array(length)).map(function (_, index) {
        return (typeof populate === 'function')
            ? populate(index)
            : populate;
    });
}
/**
 * Calculates the dot product of two arrays.
 *
 * @param  a First array.
 * @param  b Second array.
 * @return   Dot product.
 */
function dot(a, b) {
    /* Check for same length of arrays. */
    if (a.length !== b.length) {
        throw new Error('Both arrays have to have the same length.');
    }
    /* Calculate dot product. */
    return a.reduce(function (dot, value, index) { return dot + value * b[index]; }, 0);
}
/**
 * Multiplies an array with a scalar value.
 *
 * @param  scalar Scalar value.
 * @param  array  Array of numbers.
 * @return        Array multiplied with scalar value.
 */
function mulScalar(scalar, array) {
    return array.map(function (value) { return scalar * value; });
}
/**
 * Returns a single padding element.
 *
 * @param  data    Input data.
 * @param  index   Index of padding element.
 * @param  inverse True if the padding direction is inversed.
 * @param  mode    Signal extension mode.
 * @return         Single padding element.
 */
function padElement(data, index, inverse, mode) {
    switch (mode) {
        case PADDING_MODES.antisymmetric:
            return antisymmetricPadding(data, index, inverse);
        case PADDING_MODES.constant:
            return constantPadding(data, inverse);
        case PADDING_MODES.periodic:
            return periodicPadding(data, index, inverse);
        case PADDING_MODES.reflect:
            return reflectPadding(data, index, inverse);
        case PADDING_MODES.smooth:
            return smoothPadding(data, index, inverse);
        case PADDING_MODES.symmetric:
            return symmetricPadding(data, index, inverse);
        case PADDING_MODES.zero:
            return zeroPadding();
        default:
            throw new Error('Unknown signal extension mode: "' + mode + '"');
    }
}
/**
 * Determines the padding widths.
 *
 * @param  dataLength   Length of signal.
 * @param  filterLength Length of filter.
 * @return              Padding widths.
 */
function padWidths(dataLength, filterLength) {
    /* Check for valid data length. */
    if (dataLength <= 0) {
        throw new Error('Cannot determine padding widths for data of length less than or equal to zero.');
    }
    /* Check for valid filter length. */
    if (filterLength < 2) {
        throw new Error('Cannot determine padding widths for filter of length less than two.');
    }
    /* Determine padding widths. */
    return [
        filterLength - 2,
        ((dataLength + filterLength) % 2 === 0)
            ? filterLength - 2
            : filterLength - 1
    ];
}
/**
 * Determines a wavelet basis from scaling numbers.
 *
 * @param  scalingNumbers Wavelet scaling numbers.
 * @return                Wavelet basis.
 */
function waveletFromScalingNumbers(scalingNumbers) {
    /* Check if length is larger than or equal to two. */
    if (scalingNumbers.length < 2) {
        throw new Error('Scaling numbers length has to be larger than or equal to two.');
    }
    /* Determine wavelet numbers. */
    var waveletNumbers = scalingNumbers.slice() // Copy array
        .reverse()
        .map(function (value, index) { return (index % 2 === 0) ? value : -value; });
    /* Determine wavelet basis. */
    return {
        dec: {
            low: scalingNumbers.slice(),
            high: waveletNumbers.slice(),
        },
        rec: {
            low: scalingNumbers.slice(),
            high: waveletNumbers.slice()
        },
    };
}

/**
 * Default padding mode to use.
 */
var DEFAULT_PADDING_MODE = PADDING_MODES.symmetric;
/**
 * Collection of methods for Discrete Wavelet Transform (DWT).
 */
var DiscreteWavelets = /** @class */ (function () {
    function DiscreteWavelets() {
    }
    DiscreteWavelets.transposeMatrix = function (somearray) {
        return Array.from({ length: somearray[0].length }, function (_, rowIndex) {
            return Array.from({ length: somearray.length }, function (_, colIndex) {
                return somearray[colIndex][rowIndex];
            });
        });
    };
    /**
     *     2-D FUNCTIONS
     */
    /**
     * Determines the maximum level of useful decomposition in 2d.
     *
     * @param  dataLength     Length of input data.
     * @param  wavelet        Wavelet to use.
     * @param  roundingOption When set to LOW, it uses floor(log_2(.)) to calculate the maximum level. When set to HIGH, it uses ceil(floor_2(.)). Defaults to LOW
     * @return                Maximum useful level of decomposition.
     */
    DiscreteWavelets.maxLevel2 = function (size, wavelet, roundingOption) {
        if (roundingOption === void 0) { roundingOption = 'LOW'; }
        return Math.max(this.maxLevel(size[0], wavelet, roundingOption), this.maxLevel(size[1], wavelet, roundingOption));
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
        console.dir({ cA: cA, cD: cD }, { maxArrayLength: null, depth: null });
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
    /**
     * Single level 2D Discrete Wavelet Transform.
     *
     * @param  data              Input data.
     * @param  wavelet           Wavelet to use.
     * @param  mode              Signal extension mode.
     * @param  taintAnalysisOnly If set to true it will only calculate the mask matrix, otherwise it will calculate the DWT coefficients
     * @return                   Approximation and detail coefficients as result of the transform.
     */
    DiscreteWavelets.dwt2 = function (data, wavelet, mode, taintAnalysisOnly) {
        if (mode === void 0) { mode = 'symmetric'; }
        if (taintAnalysisOnly === void 0) { taintAnalysisOnly = false; }
        var _a = this.dwtRows(data, wavelet, mode, taintAnalysisOnly), cA = _a.cA, cD = _a.cD;
        var bandsValues = this.dwtCols(cA, cD, wavelet, mode, taintAnalysisOnly);
        // For correct matching of the coefficients with their meaning in the spatial domain:
        for (var _i = 0, _b = ['LL', 'LH', 'HL', 'HH']; _i < _b.length; _i++) {
            var band = _b[_i];
            bandsValues[band] = this.transposeMatrix(bandsValues[band]);
        }
        return bandsValues;
    };
    /**
     * 2D wavelet decomposition. Transforms data by calculating coefficients from
     * input data.
     *
     * @param  data           Input data.
     * @param  wavelet        Wavelet to use.
     * @param  mode           Signal extension mode.
     * @param  level          Decomposition level or roundingOption for calculating via maxLevel function. Defaults to level calculated by maxLevel function with 'LOW' Roundingoption.
     * @return                Coefficients as result of the transform, and the mask matrix that indicates which 0 coefficients are meaningless.
     */
    DiscreteWavelets.wavedec2 = function (data, wavelet, mode, level) {
        if (mode === void 0) { mode = 'symmetric'; }
        if (level === void 0) { level = 'LOW'; }
        var rows = data.length;
        var cols = data[0].length;
        var numLevels;
        if (typeof level === 'string') {
            numLevels = this.maxLevel2([rows, cols], wavelet, level);
        }
        else {
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
            size: [rows, cols], // This would not be strictly necessary in the data model
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
    /**
     * Single level inverse 2D Discrete Wavelet Transform.
     *
     * @param  approx  Approximation coefficients. If undefined, it will be set to an array of zeros with length equal to the detail coefficients.
     * @param  detail  Detail coefficients. If undefined, it will be set to an array of zeros with length equal to the approximation coefficients.
     * @param  wavelet Wavelet to use.
     * @return         Approximation coefficients of previous level of transform.
     */
    DiscreteWavelets.idwt2 = function (approx, detail, wavelet) {
        var bandsValues = { LL: approx, LH: detail.LH, HL: detail.HL, HH: detail.HH };
        // For correct matching of the coefficients with their meaning in the spatial domain:
        for (var _i = 0, _a = ['LL', 'LH', 'HL', 'HH']; _i < _a.length; _i++) {
            var band = _a[_i];
            bandsValues[band] = this.transposeMatrix(bandsValues[band]);
        }
        var _b = this.idwtCols(bandsValues, wavelet), cA = _b.cA, cD = _b.cD;
        var data = this.idwtRows(cA, cD, wavelet);
        return data;
    };
    /**
     * 2D wavelet reconstruction. Inverses a transform by calculating input data
     * from coefficients.
     *
     * @param  coeffs  Coefficients as result of a transform.
     * @param  wavelet Wavelet to use.
     * @return         Input data as result of the inverse transform.
     */
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
     * Single level 1D Discrete Wavelet Transform.
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
        var waveletBasis = basisFromWavelet(wavelet);
        var filters = waveletBasis.dec;
        assertValidFilters(filters);
        var filterLength = filters.low.length;
        /* Add padding. */
        data = this.pad(data, padWidths(data.length, filterLength), taintAnalysisOnly ? 'zero' : mode);
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
                approx.push(dot(values, filters.low));
                /* Calculate detail coefficients. */
                detail.push(dot(values, filters.high));
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
     * Single level inverse 1D Discrete Wavelet Transform.
     *
     * @param  approx  Approximation coefficients. If undefined, it will be set to an array of zeros with length equal to the detail coefficients.
     * @param  detail  Detail coefficients. If undefined, it will be set to an array of zeros with length equal to the approximation coefficients.
     * @param  wavelet Wavelet to use.
     * @return         Approximation coefficients of previous level of transform.
     */
    DiscreteWavelets.idwt = function (approx, detail, wavelet) {
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
        var waveletBasis = basisFromWavelet(wavelet);
        var filters = waveletBasis.rec;
        assertValidFilters(filters);
        var filterLength = filters.low.length;
        /* Initialize transform. */
        var coeffLength = approx.length;
        var pad = createArray(filterLength + (coeffLength - 1) * 2, 0);
        /* Perform inverse Discrete Wavelet Transform. */
        for (var i = 0; i < coeffLength; i++) {
            var offset = 2 * i;
            /* Calculate values. */
            var values = pad.slice(offset, offset + filterLength);
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
    };
    /**
     * Determines the maximum level of useful decomposition in 1D.
     *
     * @param  dataLength     Length of input data.
     * @param  wavelet        Wavelet to use.
     * @param  roundingOption When set to LOW, it uses floor(log_2(.)) to calculate the maximum level. When set to HIGH, it uses ceil(floor_2(.)). Defaults to LOW
     * @return                Maximum useful level of decomposition.
     */
    DiscreteWavelets.maxLevel = function (dataLength, wavelet, roundingOption) {
        if (roundingOption === void 0) { roundingOption = 'LOW'; }
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
        var waveletBasis = basisFromWavelet(wavelet);
        /* Determine length of filter. */
        var filterLength = waveletBasis.dec.low.length;
        if (roundingOption === 'LOW') {
            // SOURCE: https://pywavelets.readthedocs.io/en/latest/ref/dwt-discrete-wavelet-transform.html#maximum-decomposition-level-dwt-max-level-dwtn-max-level
            return Math.max(0, Math.floor(Math.log2(dataLength / (filterLength - 1))));
        }
        else {
            return Math.max(0, Math.ceil(Math.log2(dataLength / (filterLength - 1))));
        }
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
        return createArray(front, function (index) { return padElement(data, front - 1 - index, true, mode); })
            .concat(data)
            .concat(createArray(back, function (index) { return padElement(data, index, false, mode); }));
    };
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
    DiscreteWavelets.wavedec = function (data, wavelet, mode, level) {
        if (mode === void 0) { mode = DEFAULT_PADDING_MODE; }
        if (level === void 0) { level = 'LOW'; }
        /* Determine decomposition level. */
        if (typeof level === 'string') {
            level = this.maxLevel(data.length, wavelet, level);
        }
        else if (level < 0) {
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
        assertValidCoeffs(coeffs);
        /* Determine wavelet. */
        wavelet = basisFromWavelet(wavelet);
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
    DiscreteWavelets.Modes = PADDING_MODES;
    return DiscreteWavelets;
}());

export { DiscreteWavelets as default };
//# sourceMappingURL=discrete-wavelets.es5.js.map
