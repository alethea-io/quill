var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../../../.cache/deno/deno_esbuild/bech32@2.0.0/node_modules/bech32/dist/index.js
var require_dist = __commonJS({
  "../../../../.cache/deno/deno_esbuild/bech32@2.0.0/node_modules/bech32/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.bech32m = exports.bech32 = void 0;
    var ALPHABET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
    var ALPHABET_MAP = {};
    for (let z = 0; z < ALPHABET.length; z++) {
      const x = ALPHABET.charAt(z);
      ALPHABET_MAP[x] = z;
    }
    function polymodStep(pre) {
      const b = pre >> 25;
      return (pre & 33554431) << 5 ^ -(b >> 0 & 1) & 996825010 ^ -(b >> 1 & 1) & 642813549 ^ -(b >> 2 & 1) & 513874426 ^ -(b >> 3 & 1) & 1027748829 ^ -(b >> 4 & 1) & 705979059;
    }
    function prefixChk(prefix) {
      let chk = 1;
      for (let i = 0; i < prefix.length; ++i) {
        const c = prefix.charCodeAt(i);
        if (c < 33 || c > 126)
          return "Invalid prefix (" + prefix + ")";
        chk = polymodStep(chk) ^ c >> 5;
      }
      chk = polymodStep(chk);
      for (let i = 0; i < prefix.length; ++i) {
        const v = prefix.charCodeAt(i);
        chk = polymodStep(chk) ^ v & 31;
      }
      return chk;
    }
    function convert(data, inBits, outBits, pad) {
      let value = 0;
      let bits = 0;
      const maxV = (1 << outBits) - 1;
      const result = [];
      for (let i = 0; i < data.length; ++i) {
        value = value << inBits | data[i];
        bits += inBits;
        while (bits >= outBits) {
          bits -= outBits;
          result.push(value >> bits & maxV);
        }
      }
      if (pad) {
        if (bits > 0) {
          result.push(value << outBits - bits & maxV);
        }
      } else {
        if (bits >= inBits)
          return "Excess padding";
        if (value << outBits - bits & maxV)
          return "Non-zero padding";
      }
      return result;
    }
    function toWords(bytes) {
      return convert(bytes, 8, 5, true);
    }
    function fromWordsUnsafe(words) {
      const res = convert(words, 5, 8, false);
      if (Array.isArray(res))
        return res;
    }
    function fromWords(words) {
      const res = convert(words, 5, 8, false);
      if (Array.isArray(res))
        return res;
      throw new Error(res);
    }
    function getLibraryFromEncoding(encoding) {
      let ENCODING_CONST;
      if (encoding === "bech32") {
        ENCODING_CONST = 1;
      } else {
        ENCODING_CONST = 734539939;
      }
      function encode2(prefix, words, LIMIT) {
        LIMIT = LIMIT || 90;
        if (prefix.length + 7 + words.length > LIMIT)
          throw new TypeError("Exceeds length limit");
        prefix = prefix.toLowerCase();
        let chk = prefixChk(prefix);
        if (typeof chk === "string")
          throw new Error(chk);
        let result = prefix + "1";
        for (let i = 0; i < words.length; ++i) {
          const x = words[i];
          if (x >> 5 !== 0)
            throw new Error("Non 5-bit word");
          chk = polymodStep(chk) ^ x;
          result += ALPHABET.charAt(x);
        }
        for (let i = 0; i < 6; ++i) {
          chk = polymodStep(chk);
        }
        chk ^= ENCODING_CONST;
        for (let i = 0; i < 6; ++i) {
          const v = chk >> (5 - i) * 5 & 31;
          result += ALPHABET.charAt(v);
        }
        return result;
      }
      function __decode(str, LIMIT) {
        LIMIT = LIMIT || 90;
        if (str.length < 8)
          return str + " too short";
        if (str.length > LIMIT)
          return "Exceeds length limit";
        const lowered = str.toLowerCase();
        const uppered = str.toUpperCase();
        if (str !== lowered && str !== uppered)
          return "Mixed-case string " + str;
        str = lowered;
        const split = str.lastIndexOf("1");
        if (split === -1)
          return "No separator character for " + str;
        if (split === 0)
          return "Missing prefix for " + str;
        const prefix = str.slice(0, split);
        const wordChars = str.slice(split + 1);
        if (wordChars.length < 6)
          return "Data too short";
        let chk = prefixChk(prefix);
        if (typeof chk === "string")
          return chk;
        const words = [];
        for (let i = 0; i < wordChars.length; ++i) {
          const c = wordChars.charAt(i);
          const v = ALPHABET_MAP[c];
          if (v === void 0)
            return "Unknown character " + c;
          chk = polymodStep(chk) ^ v;
          if (i + 6 >= wordChars.length)
            continue;
          words.push(v);
        }
        if (chk !== ENCODING_CONST)
          return "Invalid checksum for " + str;
        return { prefix, words };
      }
      function decodeUnsafe(str, LIMIT) {
        const res = __decode(str, LIMIT);
        if (typeof res === "object")
          return res;
      }
      function decode2(str, LIMIT) {
        const res = __decode(str, LIMIT);
        if (typeof res === "object")
          return res;
        throw new Error(res);
      }
      return {
        decodeUnsafe,
        decode: decode2,
        encode: encode2,
        toWords,
        fromWordsUnsafe,
        fromWords
      };
    }
    exports.bech32 = getLibraryFromEncoding("bech32");
    exports.bech32m = getLibraryFromEncoding("bech32m");
  }
});

// src/reducers/crdt/balance_by_address.ts
var balance_by_address_exports = {};
__export(balance_by_address_exports, {
  apply: () => apply,
  undo: () => undo
});

// ../../../../.cache/deno/deno_esbuild/@bufbuild/protobuf@1.4.2/node_modules/@bufbuild/protobuf/dist/esm/private/assert.js
function assert(condition, msg) {
  if (!condition) {
    throw new Error(msg);
  }
}
var FLOAT32_MAX = 34028234663852886e22;
var FLOAT32_MIN = -34028234663852886e22;
var UINT32_MAX = 4294967295;
var INT32_MAX = 2147483647;
var INT32_MIN = -2147483648;
function assertInt32(arg) {
  if (typeof arg !== "number")
    throw new Error("invalid int 32: " + typeof arg);
  if (!Number.isInteger(arg) || arg > INT32_MAX || arg < INT32_MIN)
    throw new Error("invalid int 32: " + arg);
}
function assertUInt32(arg) {
  if (typeof arg !== "number")
    throw new Error("invalid uint 32: " + typeof arg);
  if (!Number.isInteger(arg) || arg > UINT32_MAX || arg < 0)
    throw new Error("invalid uint 32: " + arg);
}
function assertFloat32(arg) {
  if (typeof arg !== "number")
    throw new Error("invalid float 32: " + typeof arg);
  if (!Number.isFinite(arg))
    return;
  if (arg > FLOAT32_MAX || arg < FLOAT32_MIN)
    throw new Error("invalid float 32: " + arg);
}

// ../../../../.cache/deno/deno_esbuild/@bufbuild/protobuf@1.4.2/node_modules/@bufbuild/protobuf/dist/esm/private/enum.js
var enumTypeSymbol = Symbol("@bufbuild/protobuf/enum-type");
function getEnumType(enumObject) {
  const t = enumObject[enumTypeSymbol];
  assert(t, "missing enum type on enum object");
  return t;
}
function setEnumType(enumObject, typeName, values, opt) {
  enumObject[enumTypeSymbol] = makeEnumType(typeName, values.map((v) => ({
    no: v.no,
    name: v.name,
    localName: enumObject[v.no]
  })), opt);
}
function makeEnumType(typeName, values, _opt) {
  const names = /* @__PURE__ */ Object.create(null);
  const numbers = /* @__PURE__ */ Object.create(null);
  const normalValues = [];
  for (const value of values) {
    const n = normalizeEnumValue(value);
    normalValues.push(n);
    names[value.name] = n;
    numbers[value.no] = n;
  }
  return {
    typeName,
    values: normalValues,
    // We do not surface options at this time
    // options: opt?.options ?? Object.create(null),
    findName(name) {
      return names[name];
    },
    findNumber(no) {
      return numbers[no];
    }
  };
}
function makeEnum(typeName, values, opt) {
  const enumObject = {};
  for (const value of values) {
    const n = normalizeEnumValue(value);
    enumObject[n.localName] = n.no;
    enumObject[n.no] = n.localName;
  }
  setEnumType(enumObject, typeName, values, opt);
  return enumObject;
}
function normalizeEnumValue(value) {
  if ("localName" in value) {
    return value;
  }
  return Object.assign(Object.assign({}, value), { localName: value.name });
}

// ../../../../.cache/deno/deno_esbuild/@bufbuild/protobuf@1.4.2/node_modules/@bufbuild/protobuf/dist/esm/message.js
var Message = class {
  /**
   * Compare with a message of the same type.
   */
  equals(other) {
    return this.getType().runtime.util.equals(this.getType(), this, other);
  }
  /**
   * Create a deep copy.
   */
  clone() {
    return this.getType().runtime.util.clone(this);
  }
  /**
   * Parse from binary data, merging fields.
   *
   * Repeated fields are appended. Map entries are added, overwriting
   * existing keys.
   *
   * If a message field is already present, it will be merged with the
   * new data.
   */
  fromBinary(bytes, options) {
    const type = this.getType(), format = type.runtime.bin, opt = format.makeReadOptions(options);
    format.readMessage(this, opt.readerFactory(bytes), bytes.byteLength, opt);
    return this;
  }
  /**
   * Parse a message from a JSON value.
   */
  fromJson(jsonValue, options) {
    const type = this.getType(), format = type.runtime.json, opt = format.makeReadOptions(options);
    format.readMessage(type, jsonValue, opt, this);
    return this;
  }
  /**
   * Parse a message from a JSON string.
   */
  fromJsonString(jsonString, options) {
    let json;
    try {
      json = JSON.parse(jsonString);
    } catch (e) {
      throw new Error(`cannot decode ${this.getType().typeName} from JSON: ${e instanceof Error ? e.message : String(e)}`);
    }
    return this.fromJson(json, options);
  }
  /**
   * Serialize the message to binary data.
   */
  toBinary(options) {
    const type = this.getType(), bin = type.runtime.bin, opt = bin.makeWriteOptions(options), writer = opt.writerFactory();
    bin.writeMessage(this, writer, opt);
    return writer.finish();
  }
  /**
   * Serialize the message to a JSON value, a JavaScript value that can be
   * passed to JSON.stringify().
   */
  toJson(options) {
    const type = this.getType(), json = type.runtime.json, opt = json.makeWriteOptions(options);
    return json.writeMessage(this, opt);
  }
  /**
   * Serialize the message to a JSON string.
   */
  toJsonString(options) {
    var _a;
    const value = this.toJson(options);
    return JSON.stringify(value, null, (_a = options === null || options === void 0 ? void 0 : options.prettySpaces) !== null && _a !== void 0 ? _a : 0);
  }
  /**
   * Override for serialization behavior. This will be invoked when calling
   * JSON.stringify on this message (i.e. JSON.stringify(msg)).
   *
   * Note that this will not serialize google.protobuf.Any with a packed
   * message because the protobuf JSON format specifies that it needs to be
   * unpacked, and this is only possible with a type registry to look up the
   * message type.  As a result, attempting to serialize a message with this
   * type will throw an Error.
   *
   * This method is protected because you should not need to invoke it
   * directly -- instead use JSON.stringify or toJsonString for
   * stringified JSON.  Alternatively, if actual JSON is desired, you should
   * use toJson.
   */
  toJSON() {
    return this.toJson({
      emitDefaultValues: true
    });
  }
  /**
   * Retrieve the MessageType of this message - a singleton that represents
   * the protobuf message declaration and provides metadata for reflection-
   * based operations.
   */
  getType() {
    return Object.getPrototypeOf(this).constructor;
  }
};

// ../../../../.cache/deno/deno_esbuild/@bufbuild/protobuf@1.4.2/node_modules/@bufbuild/protobuf/dist/esm/private/message-type.js
function makeMessageType(runtime, typeName, fields, opt) {
  var _a;
  const localName = (_a = opt === null || opt === void 0 ? void 0 : opt.localName) !== null && _a !== void 0 ? _a : typeName.substring(typeName.lastIndexOf(".") + 1);
  const type = {
    [localName]: function(data) {
      runtime.util.initFields(this);
      runtime.util.initPartial(data, this);
    }
  }[localName];
  Object.setPrototypeOf(type.prototype, new Message());
  Object.assign(type, {
    runtime,
    typeName,
    fields: runtime.util.newFieldList(fields),
    fromBinary(bytes, options) {
      return new type().fromBinary(bytes, options);
    },
    fromJson(jsonValue, options) {
      return new type().fromJson(jsonValue, options);
    },
    fromJsonString(jsonString, options) {
      return new type().fromJsonString(jsonString, options);
    },
    equals(a, b) {
      return runtime.util.equals(type, a, b);
    }
  });
  return type;
}

// ../../../../.cache/deno/deno_esbuild/@bufbuild/protobuf@1.4.2/node_modules/@bufbuild/protobuf/dist/esm/private/proto-runtime.js
function makeProtoRuntime(syntax, json, bin, util) {
  return {
    syntax,
    json,
    bin,
    util,
    makeMessageType(typeName, fields, opt) {
      return makeMessageType(this, typeName, fields, opt);
    },
    makeEnum,
    makeEnumType,
    getEnumType
  };
}

// ../../../../.cache/deno/deno_esbuild/@bufbuild/protobuf@1.4.2/node_modules/@bufbuild/protobuf/dist/esm/field.js
var ScalarType;
(function(ScalarType2) {
  ScalarType2[ScalarType2["DOUBLE"] = 1] = "DOUBLE";
  ScalarType2[ScalarType2["FLOAT"] = 2] = "FLOAT";
  ScalarType2[ScalarType2["INT64"] = 3] = "INT64";
  ScalarType2[ScalarType2["UINT64"] = 4] = "UINT64";
  ScalarType2[ScalarType2["INT32"] = 5] = "INT32";
  ScalarType2[ScalarType2["FIXED64"] = 6] = "FIXED64";
  ScalarType2[ScalarType2["FIXED32"] = 7] = "FIXED32";
  ScalarType2[ScalarType2["BOOL"] = 8] = "BOOL";
  ScalarType2[ScalarType2["STRING"] = 9] = "STRING";
  ScalarType2[ScalarType2["BYTES"] = 12] = "BYTES";
  ScalarType2[ScalarType2["UINT32"] = 13] = "UINT32";
  ScalarType2[ScalarType2["SFIXED32"] = 15] = "SFIXED32";
  ScalarType2[ScalarType2["SFIXED64"] = 16] = "SFIXED64";
  ScalarType2[ScalarType2["SINT32"] = 17] = "SINT32";
  ScalarType2[ScalarType2["SINT64"] = 18] = "SINT64";
})(ScalarType || (ScalarType = {}));
var LongType;
(function(LongType2) {
  LongType2[LongType2["BIGINT"] = 0] = "BIGINT";
  LongType2[LongType2["STRING"] = 1] = "STRING";
})(LongType || (LongType = {}));

// ../../../../.cache/deno/deno_esbuild/@bufbuild/protobuf@1.4.2/node_modules/@bufbuild/protobuf/dist/esm/google/varint.js
function varint64read() {
  let lowBits = 0;
  let highBits = 0;
  for (let shift = 0; shift < 28; shift += 7) {
    let b = this.buf[this.pos++];
    lowBits |= (b & 127) << shift;
    if ((b & 128) == 0) {
      this.assertBounds();
      return [lowBits, highBits];
    }
  }
  let middleByte = this.buf[this.pos++];
  lowBits |= (middleByte & 15) << 28;
  highBits = (middleByte & 112) >> 4;
  if ((middleByte & 128) == 0) {
    this.assertBounds();
    return [lowBits, highBits];
  }
  for (let shift = 3; shift <= 31; shift += 7) {
    let b = this.buf[this.pos++];
    highBits |= (b & 127) << shift;
    if ((b & 128) == 0) {
      this.assertBounds();
      return [lowBits, highBits];
    }
  }
  throw new Error("invalid varint");
}
function varint64write(lo, hi, bytes) {
  for (let i = 0; i < 28; i = i + 7) {
    const shift = lo >>> i;
    const hasNext = !(shift >>> 7 == 0 && hi == 0);
    const byte = (hasNext ? shift | 128 : shift) & 255;
    bytes.push(byte);
    if (!hasNext) {
      return;
    }
  }
  const splitBits = lo >>> 28 & 15 | (hi & 7) << 4;
  const hasMoreBits = !(hi >> 3 == 0);
  bytes.push((hasMoreBits ? splitBits | 128 : splitBits) & 255);
  if (!hasMoreBits) {
    return;
  }
  for (let i = 3; i < 31; i = i + 7) {
    const shift = hi >>> i;
    const hasNext = !(shift >>> 7 == 0);
    const byte = (hasNext ? shift | 128 : shift) & 255;
    bytes.push(byte);
    if (!hasNext) {
      return;
    }
  }
  bytes.push(hi >>> 31 & 1);
}
var TWO_PWR_32_DBL = 4294967296;
function int64FromString(dec) {
  const minus = dec[0] === "-";
  if (minus) {
    dec = dec.slice(1);
  }
  const base = 1e6;
  let lowBits = 0;
  let highBits = 0;
  function add1e6digit(begin, end) {
    const digit1e6 = Number(dec.slice(begin, end));
    highBits *= base;
    lowBits = lowBits * base + digit1e6;
    if (lowBits >= TWO_PWR_32_DBL) {
      highBits = highBits + (lowBits / TWO_PWR_32_DBL | 0);
      lowBits = lowBits % TWO_PWR_32_DBL;
    }
  }
  add1e6digit(-24, -18);
  add1e6digit(-18, -12);
  add1e6digit(-12, -6);
  add1e6digit(-6);
  return minus ? negate(lowBits, highBits) : newBits(lowBits, highBits);
}
function int64ToString(lo, hi) {
  let bits = newBits(lo, hi);
  const negative = bits.hi & 2147483648;
  if (negative) {
    bits = negate(bits.lo, bits.hi);
  }
  const result = uInt64ToString(bits.lo, bits.hi);
  return negative ? "-" + result : result;
}
function uInt64ToString(lo, hi) {
  ({ lo, hi } = toUnsigned(lo, hi));
  if (hi <= 2097151) {
    return String(TWO_PWR_32_DBL * hi + lo);
  }
  const low = lo & 16777215;
  const mid = (lo >>> 24 | hi << 8) & 16777215;
  const high = hi >> 16 & 65535;
  let digitA = low + mid * 6777216 + high * 6710656;
  let digitB = mid + high * 8147497;
  let digitC = high * 2;
  const base = 1e7;
  if (digitA >= base) {
    digitB += Math.floor(digitA / base);
    digitA %= base;
  }
  if (digitB >= base) {
    digitC += Math.floor(digitB / base);
    digitB %= base;
  }
  return digitC.toString() + decimalFrom1e7WithLeadingZeros(digitB) + decimalFrom1e7WithLeadingZeros(digitA);
}
function toUnsigned(lo, hi) {
  return { lo: lo >>> 0, hi: hi >>> 0 };
}
function newBits(lo, hi) {
  return { lo: lo | 0, hi: hi | 0 };
}
function negate(lowBits, highBits) {
  highBits = ~highBits;
  if (lowBits) {
    lowBits = ~lowBits + 1;
  } else {
    highBits += 1;
  }
  return newBits(lowBits, highBits);
}
var decimalFrom1e7WithLeadingZeros = (digit1e7) => {
  const partial = String(digit1e7);
  return "0000000".slice(partial.length) + partial;
};
function varint32write(value, bytes) {
  if (value >= 0) {
    while (value > 127) {
      bytes.push(value & 127 | 128);
      value = value >>> 7;
    }
    bytes.push(value);
  } else {
    for (let i = 0; i < 9; i++) {
      bytes.push(value & 127 | 128);
      value = value >> 7;
    }
    bytes.push(1);
  }
}
function varint32read() {
  let b = this.buf[this.pos++];
  let result = b & 127;
  if ((b & 128) == 0) {
    this.assertBounds();
    return result;
  }
  b = this.buf[this.pos++];
  result |= (b & 127) << 7;
  if ((b & 128) == 0) {
    this.assertBounds();
    return result;
  }
  b = this.buf[this.pos++];
  result |= (b & 127) << 14;
  if ((b & 128) == 0) {
    this.assertBounds();
    return result;
  }
  b = this.buf[this.pos++];
  result |= (b & 127) << 21;
  if ((b & 128) == 0) {
    this.assertBounds();
    return result;
  }
  b = this.buf[this.pos++];
  result |= (b & 15) << 28;
  for (let readBytes = 5; (b & 128) !== 0 && readBytes < 10; readBytes++)
    b = this.buf[this.pos++];
  if ((b & 128) != 0)
    throw new Error("invalid varint");
  this.assertBounds();
  return result >>> 0;
}

// ../../../../.cache/deno/deno_esbuild/@bufbuild/protobuf@1.4.2/node_modules/@bufbuild/protobuf/dist/esm/proto-int64.js
function makeInt64Support() {
  const dv = new DataView(new ArrayBuffer(8));
  const ok = typeof BigInt === "function" && typeof dv.getBigInt64 === "function" && typeof dv.getBigUint64 === "function" && typeof dv.setBigInt64 === "function" && typeof dv.setBigUint64 === "function" && (typeof process != "object" || typeof process.env != "object" || process.env.BUF_BIGINT_DISABLE !== "1");
  if (ok) {
    const MIN = BigInt("-9223372036854775808"), MAX = BigInt("9223372036854775807"), UMIN = BigInt("0"), UMAX = BigInt("18446744073709551615");
    return {
      zero: BigInt(0),
      supported: true,
      parse(value) {
        const bi = typeof value == "bigint" ? value : BigInt(value);
        if (bi > MAX || bi < MIN) {
          throw new Error(`int64 invalid: ${value}`);
        }
        return bi;
      },
      uParse(value) {
        const bi = typeof value == "bigint" ? value : BigInt(value);
        if (bi > UMAX || bi < UMIN) {
          throw new Error(`uint64 invalid: ${value}`);
        }
        return bi;
      },
      enc(value) {
        dv.setBigInt64(0, this.parse(value), true);
        return {
          lo: dv.getInt32(0, true),
          hi: dv.getInt32(4, true)
        };
      },
      uEnc(value) {
        dv.setBigInt64(0, this.uParse(value), true);
        return {
          lo: dv.getInt32(0, true),
          hi: dv.getInt32(4, true)
        };
      },
      dec(lo, hi) {
        dv.setInt32(0, lo, true);
        dv.setInt32(4, hi, true);
        return dv.getBigInt64(0, true);
      },
      uDec(lo, hi) {
        dv.setInt32(0, lo, true);
        dv.setInt32(4, hi, true);
        return dv.getBigUint64(0, true);
      }
    };
  }
  const assertInt64String = (value) => assert(/^-?[0-9]+$/.test(value), `int64 invalid: ${value}`);
  const assertUInt64String = (value) => assert(/^[0-9]+$/.test(value), `uint64 invalid: ${value}`);
  return {
    zero: "0",
    supported: false,
    parse(value) {
      if (typeof value != "string") {
        value = value.toString();
      }
      assertInt64String(value);
      return value;
    },
    uParse(value) {
      if (typeof value != "string") {
        value = value.toString();
      }
      assertUInt64String(value);
      return value;
    },
    enc(value) {
      if (typeof value != "string") {
        value = value.toString();
      }
      assertInt64String(value);
      return int64FromString(value);
    },
    uEnc(value) {
      if (typeof value != "string") {
        value = value.toString();
      }
      assertUInt64String(value);
      return int64FromString(value);
    },
    dec(lo, hi) {
      return int64ToString(lo, hi);
    },
    uDec(lo, hi) {
      return uInt64ToString(lo, hi);
    }
  };
}
var protoInt64 = makeInt64Support();

// ../../../../.cache/deno/deno_esbuild/@bufbuild/protobuf@1.4.2/node_modules/@bufbuild/protobuf/dist/esm/binary-encoding.js
var WireType;
(function(WireType2) {
  WireType2[WireType2["Varint"] = 0] = "Varint";
  WireType2[WireType2["Bit64"] = 1] = "Bit64";
  WireType2[WireType2["LengthDelimited"] = 2] = "LengthDelimited";
  WireType2[WireType2["StartGroup"] = 3] = "StartGroup";
  WireType2[WireType2["EndGroup"] = 4] = "EndGroup";
  WireType2[WireType2["Bit32"] = 5] = "Bit32";
})(WireType || (WireType = {}));
var BinaryWriter = class {
  constructor(textEncoder2) {
    this.stack = [];
    this.textEncoder = textEncoder2 !== null && textEncoder2 !== void 0 ? textEncoder2 : new TextEncoder();
    this.chunks = [];
    this.buf = [];
  }
  /**
   * Return all bytes written and reset this writer.
   */
  finish() {
    this.chunks.push(new Uint8Array(this.buf));
    let len = 0;
    for (let i = 0; i < this.chunks.length; i++)
      len += this.chunks[i].length;
    let bytes = new Uint8Array(len);
    let offset = 0;
    for (let i = 0; i < this.chunks.length; i++) {
      bytes.set(this.chunks[i], offset);
      offset += this.chunks[i].length;
    }
    this.chunks = [];
    return bytes;
  }
  /**
   * Start a new fork for length-delimited data like a message
   * or a packed repeated field.
   *
   * Must be joined later with `join()`.
   */
  fork() {
    this.stack.push({ chunks: this.chunks, buf: this.buf });
    this.chunks = [];
    this.buf = [];
    return this;
  }
  /**
   * Join the last fork. Write its length and bytes, then
   * return to the previous state.
   */
  join() {
    let chunk = this.finish();
    let prev = this.stack.pop();
    if (!prev)
      throw new Error("invalid state, fork stack empty");
    this.chunks = prev.chunks;
    this.buf = prev.buf;
    this.uint32(chunk.byteLength);
    return this.raw(chunk);
  }
  /**
   * Writes a tag (field number and wire type).
   *
   * Equivalent to `uint32( (fieldNo << 3 | type) >>> 0 )`.
   *
   * Generated code should compute the tag ahead of time and call `uint32()`.
   */
  tag(fieldNo, type) {
    return this.uint32((fieldNo << 3 | type) >>> 0);
  }
  /**
   * Write a chunk of raw bytes.
   */
  raw(chunk) {
    if (this.buf.length) {
      this.chunks.push(new Uint8Array(this.buf));
      this.buf = [];
    }
    this.chunks.push(chunk);
    return this;
  }
  /**
   * Write a `uint32` value, an unsigned 32 bit varint.
   */
  uint32(value) {
    assertUInt32(value);
    while (value > 127) {
      this.buf.push(value & 127 | 128);
      value = value >>> 7;
    }
    this.buf.push(value);
    return this;
  }
  /**
   * Write a `int32` value, a signed 32 bit varint.
   */
  int32(value) {
    assertInt32(value);
    varint32write(value, this.buf);
    return this;
  }
  /**
   * Write a `bool` value, a variant.
   */
  bool(value) {
    this.buf.push(value ? 1 : 0);
    return this;
  }
  /**
   * Write a `bytes` value, length-delimited arbitrary data.
   */
  bytes(value) {
    this.uint32(value.byteLength);
    return this.raw(value);
  }
  /**
   * Write a `string` value, length-delimited data converted to UTF-8 text.
   */
  string(value) {
    let chunk = this.textEncoder.encode(value);
    this.uint32(chunk.byteLength);
    return this.raw(chunk);
  }
  /**
   * Write a `float` value, 32-bit floating point number.
   */
  float(value) {
    assertFloat32(value);
    let chunk = new Uint8Array(4);
    new DataView(chunk.buffer).setFloat32(0, value, true);
    return this.raw(chunk);
  }
  /**
   * Write a `double` value, a 64-bit floating point number.
   */
  double(value) {
    let chunk = new Uint8Array(8);
    new DataView(chunk.buffer).setFloat64(0, value, true);
    return this.raw(chunk);
  }
  /**
   * Write a `fixed32` value, an unsigned, fixed-length 32-bit integer.
   */
  fixed32(value) {
    assertUInt32(value);
    let chunk = new Uint8Array(4);
    new DataView(chunk.buffer).setUint32(0, value, true);
    return this.raw(chunk);
  }
  /**
   * Write a `sfixed32` value, a signed, fixed-length 32-bit integer.
   */
  sfixed32(value) {
    assertInt32(value);
    let chunk = new Uint8Array(4);
    new DataView(chunk.buffer).setInt32(0, value, true);
    return this.raw(chunk);
  }
  /**
   * Write a `sint32` value, a signed, zigzag-encoded 32-bit varint.
   */
  sint32(value) {
    assertInt32(value);
    value = (value << 1 ^ value >> 31) >>> 0;
    varint32write(value, this.buf);
    return this;
  }
  /**
   * Write a `fixed64` value, a signed, fixed-length 64-bit integer.
   */
  sfixed64(value) {
    let chunk = new Uint8Array(8), view = new DataView(chunk.buffer), tc = protoInt64.enc(value);
    view.setInt32(0, tc.lo, true);
    view.setInt32(4, tc.hi, true);
    return this.raw(chunk);
  }
  /**
   * Write a `fixed64` value, an unsigned, fixed-length 64 bit integer.
   */
  fixed64(value) {
    let chunk = new Uint8Array(8), view = new DataView(chunk.buffer), tc = protoInt64.uEnc(value);
    view.setInt32(0, tc.lo, true);
    view.setInt32(4, tc.hi, true);
    return this.raw(chunk);
  }
  /**
   * Write a `int64` value, a signed 64-bit varint.
   */
  int64(value) {
    let tc = protoInt64.enc(value);
    varint64write(tc.lo, tc.hi, this.buf);
    return this;
  }
  /**
   * Write a `sint64` value, a signed, zig-zag-encoded 64-bit varint.
   */
  sint64(value) {
    let tc = protoInt64.enc(value), sign = tc.hi >> 31, lo = tc.lo << 1 ^ sign, hi = (tc.hi << 1 | tc.lo >>> 31) ^ sign;
    varint64write(lo, hi, this.buf);
    return this;
  }
  /**
   * Write a `uint64` value, an unsigned 64-bit varint.
   */
  uint64(value) {
    let tc = protoInt64.uEnc(value);
    varint64write(tc.lo, tc.hi, this.buf);
    return this;
  }
};
var BinaryReader = class {
  constructor(buf, textDecoder2) {
    this.varint64 = varint64read;
    this.uint32 = varint32read;
    this.buf = buf;
    this.len = buf.length;
    this.pos = 0;
    this.view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    this.textDecoder = textDecoder2 !== null && textDecoder2 !== void 0 ? textDecoder2 : new TextDecoder();
  }
  /**
   * Reads a tag - field number and wire type.
   */
  tag() {
    let tag = this.uint32(), fieldNo = tag >>> 3, wireType = tag & 7;
    if (fieldNo <= 0 || wireType < 0 || wireType > 5)
      throw new Error("illegal tag: field no " + fieldNo + " wire type " + wireType);
    return [fieldNo, wireType];
  }
  /**
   * Skip one element on the wire and return the skipped data.
   * Supports WireType.StartGroup since v2.0.0-alpha.23.
   */
  skip(wireType) {
    let start = this.pos;
    switch (wireType) {
      case WireType.Varint:
        while (this.buf[this.pos++] & 128) {
        }
        break;
      case WireType.Bit64:
        this.pos += 4;
      case WireType.Bit32:
        this.pos += 4;
        break;
      case WireType.LengthDelimited:
        let len = this.uint32();
        this.pos += len;
        break;
      case WireType.StartGroup:
        let t;
        while ((t = this.tag()[1]) !== WireType.EndGroup) {
          this.skip(t);
        }
        break;
      default:
        throw new Error("cant skip wire type " + wireType);
    }
    this.assertBounds();
    return this.buf.subarray(start, this.pos);
  }
  /**
   * Throws error if position in byte array is out of range.
   */
  assertBounds() {
    if (this.pos > this.len)
      throw new RangeError("premature EOF");
  }
  /**
   * Read a `int32` field, a signed 32 bit varint.
   */
  int32() {
    return this.uint32() | 0;
  }
  /**
   * Read a `sint32` field, a signed, zigzag-encoded 32-bit varint.
   */
  sint32() {
    let zze = this.uint32();
    return zze >>> 1 ^ -(zze & 1);
  }
  /**
   * Read a `int64` field, a signed 64-bit varint.
   */
  int64() {
    return protoInt64.dec(...this.varint64());
  }
  /**
   * Read a `uint64` field, an unsigned 64-bit varint.
   */
  uint64() {
    return protoInt64.uDec(...this.varint64());
  }
  /**
   * Read a `sint64` field, a signed, zig-zag-encoded 64-bit varint.
   */
  sint64() {
    let [lo, hi] = this.varint64();
    let s = -(lo & 1);
    lo = (lo >>> 1 | (hi & 1) << 31) ^ s;
    hi = hi >>> 1 ^ s;
    return protoInt64.dec(lo, hi);
  }
  /**
   * Read a `bool` field, a variant.
   */
  bool() {
    let [lo, hi] = this.varint64();
    return lo !== 0 || hi !== 0;
  }
  /**
   * Read a `fixed32` field, an unsigned, fixed-length 32-bit integer.
   */
  fixed32() {
    return this.view.getUint32((this.pos += 4) - 4, true);
  }
  /**
   * Read a `sfixed32` field, a signed, fixed-length 32-bit integer.
   */
  sfixed32() {
    return this.view.getInt32((this.pos += 4) - 4, true);
  }
  /**
   * Read a `fixed64` field, an unsigned, fixed-length 64 bit integer.
   */
  fixed64() {
    return protoInt64.uDec(this.sfixed32(), this.sfixed32());
  }
  /**
   * Read a `fixed64` field, a signed, fixed-length 64-bit integer.
   */
  sfixed64() {
    return protoInt64.dec(this.sfixed32(), this.sfixed32());
  }
  /**
   * Read a `float` field, 32-bit floating point number.
   */
  float() {
    return this.view.getFloat32((this.pos += 4) - 4, true);
  }
  /**
   * Read a `double` field, a 64-bit floating point number.
   */
  double() {
    return this.view.getFloat64((this.pos += 8) - 8, true);
  }
  /**
   * Read a `bytes` field, length-delimited arbitrary data.
   */
  bytes() {
    let len = this.uint32(), start = this.pos;
    this.pos += len;
    this.assertBounds();
    return this.buf.subarray(start, start + len);
  }
  /**
   * Read a `string` field, length-delimited data converted to UTF-8 text.
   */
  string() {
    return this.textDecoder.decode(this.bytes());
  }
};

// ../../../../.cache/deno/deno_esbuild/@bufbuild/protobuf@1.4.2/node_modules/@bufbuild/protobuf/dist/esm/private/field-wrapper.js
function wrapField(type, value) {
  if (value instanceof Message || !type.fieldWrapper) {
    return value;
  }
  return type.fieldWrapper.wrapField(value);
}
var wktWrapperToScalarType = {
  "google.protobuf.DoubleValue": ScalarType.DOUBLE,
  "google.protobuf.FloatValue": ScalarType.FLOAT,
  "google.protobuf.Int64Value": ScalarType.INT64,
  "google.protobuf.UInt64Value": ScalarType.UINT64,
  "google.protobuf.Int32Value": ScalarType.INT32,
  "google.protobuf.UInt32Value": ScalarType.UINT32,
  "google.protobuf.BoolValue": ScalarType.BOOL,
  "google.protobuf.StringValue": ScalarType.STRING,
  "google.protobuf.BytesValue": ScalarType.BYTES
};

// ../../../../.cache/deno/deno_esbuild/@bufbuild/protobuf@1.4.2/node_modules/@bufbuild/protobuf/dist/esm/private/scalars.js
function scalarEquals(type, a, b) {
  if (a === b) {
    return true;
  }
  if (type == ScalarType.BYTES) {
    if (!(a instanceof Uint8Array) || !(b instanceof Uint8Array)) {
      return false;
    }
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }
  switch (type) {
    case ScalarType.UINT64:
    case ScalarType.FIXED64:
    case ScalarType.INT64:
    case ScalarType.SFIXED64:
    case ScalarType.SINT64:
      return a == b;
  }
  return false;
}
function scalarDefaultValue(type, longType) {
  switch (type) {
    case ScalarType.BOOL:
      return false;
    case ScalarType.UINT64:
    case ScalarType.FIXED64:
    case ScalarType.INT64:
    case ScalarType.SFIXED64:
    case ScalarType.SINT64:
      return longType == 0 ? protoInt64.zero : "0";
    case ScalarType.DOUBLE:
    case ScalarType.FLOAT:
      return 0;
    case ScalarType.BYTES:
      return new Uint8Array(0);
    case ScalarType.STRING:
      return "";
    default:
      return 0;
  }
}
function scalarTypeInfo(type, value) {
  const isUndefined = value === void 0;
  let wireType = WireType.Varint;
  let isIntrinsicDefault = value === 0;
  switch (type) {
    case ScalarType.STRING:
      isIntrinsicDefault = isUndefined || !value.length;
      wireType = WireType.LengthDelimited;
      break;
    case ScalarType.BOOL:
      isIntrinsicDefault = value === false;
      break;
    case ScalarType.DOUBLE:
      wireType = WireType.Bit64;
      break;
    case ScalarType.FLOAT:
      wireType = WireType.Bit32;
      break;
    case ScalarType.INT64:
      isIntrinsicDefault = isUndefined || value == 0;
      break;
    case ScalarType.UINT64:
      isIntrinsicDefault = isUndefined || value == 0;
      break;
    case ScalarType.FIXED64:
      isIntrinsicDefault = isUndefined || value == 0;
      wireType = WireType.Bit64;
      break;
    case ScalarType.BYTES:
      isIntrinsicDefault = isUndefined || !value.byteLength;
      wireType = WireType.LengthDelimited;
      break;
    case ScalarType.FIXED32:
      wireType = WireType.Bit32;
      break;
    case ScalarType.SFIXED32:
      wireType = WireType.Bit32;
      break;
    case ScalarType.SFIXED64:
      isIntrinsicDefault = isUndefined || value == 0;
      wireType = WireType.Bit64;
      break;
    case ScalarType.SINT64:
      isIntrinsicDefault = isUndefined || value == 0;
      break;
  }
  const method = ScalarType[type].toLowerCase();
  return [wireType, method, isUndefined || isIntrinsicDefault];
}

// ../../../../.cache/deno/deno_esbuild/@bufbuild/protobuf@1.4.2/node_modules/@bufbuild/protobuf/dist/esm/private/binary-format-common.js
var unknownFieldsSymbol = Symbol("@bufbuild/protobuf/unknown-fields");
var readDefaults = {
  readUnknownFields: true,
  readerFactory: (bytes) => new BinaryReader(bytes)
};
var writeDefaults = {
  writeUnknownFields: true,
  writerFactory: () => new BinaryWriter()
};
function makeReadOptions(options) {
  return options ? Object.assign(Object.assign({}, readDefaults), options) : readDefaults;
}
function makeWriteOptions(options) {
  return options ? Object.assign(Object.assign({}, writeDefaults), options) : writeDefaults;
}
function makeBinaryFormatCommon() {
  return {
    makeReadOptions,
    makeWriteOptions,
    listUnknownFields(message) {
      var _a;
      return (_a = message[unknownFieldsSymbol]) !== null && _a !== void 0 ? _a : [];
    },
    discardUnknownFields(message) {
      delete message[unknownFieldsSymbol];
    },
    writeUnknownFields(message, writer) {
      const m = message;
      const c = m[unknownFieldsSymbol];
      if (c) {
        for (const f of c) {
          writer.tag(f.no, f.wireType).raw(f.data);
        }
      }
    },
    onUnknownField(message, no, wireType, data) {
      const m = message;
      if (!Array.isArray(m[unknownFieldsSymbol])) {
        m[unknownFieldsSymbol] = [];
      }
      m[unknownFieldsSymbol].push({ no, wireType, data });
    },
    readMessage(message, reader, length, options) {
      const type = message.getType();
      const end = length === void 0 ? reader.len : reader.pos + length;
      while (reader.pos < end) {
        const [fieldNo, wireType] = reader.tag(), field = type.fields.find(fieldNo);
        if (!field) {
          const data = reader.skip(wireType);
          if (options.readUnknownFields) {
            this.onUnknownField(message, fieldNo, wireType, data);
          }
          continue;
        }
        let target = message, repeated = field.repeated, localName = field.localName;
        if (field.oneof) {
          target = target[field.oneof.localName];
          if (target.case != localName) {
            delete target.value;
          }
          target.case = localName;
          localName = "value";
        }
        switch (field.kind) {
          case "scalar":
          case "enum":
            const scalarType = field.kind == "enum" ? ScalarType.INT32 : field.T;
            let read = readScalar;
            if (field.kind == "scalar" && field.L > 0) {
              read = readScalarLTString;
            }
            if (repeated) {
              let arr = target[localName];
              if (wireType == WireType.LengthDelimited && scalarType != ScalarType.STRING && scalarType != ScalarType.BYTES) {
                let e = reader.uint32() + reader.pos;
                while (reader.pos < e) {
                  arr.push(read(reader, scalarType));
                }
              } else {
                arr.push(read(reader, scalarType));
              }
            } else {
              target[localName] = read(reader, scalarType);
            }
            break;
          case "message":
            const messageType = field.T;
            if (repeated) {
              target[localName].push(readMessageField(reader, new messageType(), options));
            } else {
              if (target[localName] instanceof Message) {
                readMessageField(reader, target[localName], options);
              } else {
                target[localName] = readMessageField(reader, new messageType(), options);
                if (messageType.fieldWrapper && !field.oneof && !field.repeated) {
                  target[localName] = messageType.fieldWrapper.unwrapField(target[localName]);
                }
              }
            }
            break;
          case "map":
            let [mapKey, mapVal] = readMapEntry(field, reader, options);
            target[localName][mapKey] = mapVal;
            break;
        }
      }
    }
  };
}
function readMessageField(reader, message, options) {
  const format = message.getType().runtime.bin;
  format.readMessage(message, reader, reader.uint32(), options);
  return message;
}
function readMapEntry(field, reader, options) {
  const length = reader.uint32(), end = reader.pos + length;
  let key, val;
  while (reader.pos < end) {
    let [fieldNo] = reader.tag();
    switch (fieldNo) {
      case 1:
        key = readScalar(reader, field.K);
        break;
      case 2:
        switch (field.V.kind) {
          case "scalar":
            val = readScalar(reader, field.V.T);
            break;
          case "enum":
            val = reader.int32();
            break;
          case "message":
            val = readMessageField(reader, new field.V.T(), options);
            break;
        }
        break;
    }
  }
  if (key === void 0) {
    let keyRaw = scalarDefaultValue(field.K, LongType.BIGINT);
    key = field.K == ScalarType.BOOL ? keyRaw.toString() : keyRaw;
  }
  if (typeof key != "string" && typeof key != "number") {
    key = key.toString();
  }
  if (val === void 0) {
    switch (field.V.kind) {
      case "scalar":
        val = scalarDefaultValue(field.V.T, LongType.BIGINT);
        break;
      case "enum":
        val = 0;
        break;
      case "message":
        val = new field.V.T();
        break;
    }
  }
  return [key, val];
}
function readScalarLTString(reader, type) {
  const v = readScalar(reader, type);
  return typeof v == "bigint" ? v.toString() : v;
}
function readScalar(reader, type) {
  switch (type) {
    case ScalarType.STRING:
      return reader.string();
    case ScalarType.BOOL:
      return reader.bool();
    case ScalarType.DOUBLE:
      return reader.double();
    case ScalarType.FLOAT:
      return reader.float();
    case ScalarType.INT32:
      return reader.int32();
    case ScalarType.INT64:
      return reader.int64();
    case ScalarType.UINT64:
      return reader.uint64();
    case ScalarType.FIXED64:
      return reader.fixed64();
    case ScalarType.BYTES:
      return reader.bytes();
    case ScalarType.FIXED32:
      return reader.fixed32();
    case ScalarType.SFIXED32:
      return reader.sfixed32();
    case ScalarType.SFIXED64:
      return reader.sfixed64();
    case ScalarType.SINT64:
      return reader.sint64();
    case ScalarType.UINT32:
      return reader.uint32();
    case ScalarType.SINT32:
      return reader.sint32();
  }
}
function writeMapEntry(writer, options, field, key, value) {
  writer.tag(field.no, WireType.LengthDelimited);
  writer.fork();
  let keyValue = key;
  switch (field.K) {
    case ScalarType.INT32:
    case ScalarType.FIXED32:
    case ScalarType.UINT32:
    case ScalarType.SFIXED32:
    case ScalarType.SINT32:
      keyValue = Number.parseInt(key);
      break;
    case ScalarType.BOOL:
      assert(key == "true" || key == "false");
      keyValue = key == "true";
      break;
  }
  writeScalar(writer, field.K, 1, keyValue, true);
  switch (field.V.kind) {
    case "scalar":
      writeScalar(writer, field.V.T, 2, value, true);
      break;
    case "enum":
      writeScalar(writer, ScalarType.INT32, 2, value, true);
      break;
    case "message":
      writeMessageField(writer, options, field.V.T, 2, value);
      break;
  }
  writer.join();
}
function writeMessageField(writer, options, type, fieldNo, value) {
  if (value !== void 0) {
    const message = wrapField(type, value);
    writer.tag(fieldNo, WireType.LengthDelimited).bytes(message.toBinary(options));
  }
}
function writeScalar(writer, type, fieldNo, value, emitIntrinsicDefault) {
  let [wireType, method, isIntrinsicDefault] = scalarTypeInfo(type, value);
  if (!isIntrinsicDefault || emitIntrinsicDefault) {
    writer.tag(fieldNo, wireType)[method](value);
  }
}
function writePacked(writer, type, fieldNo, value) {
  if (!value.length) {
    return;
  }
  writer.tag(fieldNo, WireType.LengthDelimited).fork();
  let [, method] = scalarTypeInfo(type);
  for (let i = 0; i < value.length; i++) {
    writer[method](value[i]);
  }
  writer.join();
}

// ../../../../.cache/deno/deno_esbuild/@bufbuild/protobuf@1.4.2/node_modules/@bufbuild/protobuf/dist/esm/private/binary-format-proto3.js
function makeBinaryFormatProto3() {
  return Object.assign(Object.assign({}, makeBinaryFormatCommon()), { writeMessage(message, writer, options) {
    const type = message.getType();
    for (const field of type.fields.byNumber()) {
      let value, repeated = field.repeated, localName = field.localName;
      if (field.oneof) {
        const oneof = message[field.oneof.localName];
        if (oneof.case !== localName) {
          continue;
        }
        value = oneof.value;
      } else {
        value = message[localName];
      }
      switch (field.kind) {
        case "scalar":
        case "enum":
          let scalarType = field.kind == "enum" ? ScalarType.INT32 : field.T;
          if (repeated) {
            if (field.packed) {
              writePacked(writer, scalarType, field.no, value);
            } else {
              for (const item of value) {
                writeScalar(writer, scalarType, field.no, item, true);
              }
            }
          } else {
            if (value !== void 0) {
              writeScalar(writer, scalarType, field.no, value, !!field.oneof || field.opt);
            }
          }
          break;
        case "message":
          if (repeated) {
            for (const item of value) {
              writeMessageField(writer, options, field.T, field.no, item);
            }
          } else {
            writeMessageField(writer, options, field.T, field.no, value);
          }
          break;
        case "map":
          for (const [key, val] of Object.entries(value)) {
            writeMapEntry(writer, options, field, key, val);
          }
          break;
      }
    }
    if (options.writeUnknownFields) {
      this.writeUnknownFields(message, writer);
    }
    return writer;
  } });
}

// ../../../../.cache/deno/deno_esbuild/@bufbuild/protobuf@1.4.2/node_modules/@bufbuild/protobuf/dist/esm/proto-base64.js
var encTable = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
var decTable = [];
for (let i = 0; i < encTable.length; i++)
  decTable[encTable[i].charCodeAt(0)] = i;
decTable["-".charCodeAt(0)] = encTable.indexOf("+");
decTable["_".charCodeAt(0)] = encTable.indexOf("/");
var protoBase64 = {
  /**
   * Decodes a base64 string to a byte array.
   *
   * - ignores white-space, including line breaks and tabs
   * - allows inner padding (can decode concatenated base64 strings)
   * - does not require padding
   * - understands base64url encoding:
   *   "-" instead of "+",
   *   "_" instead of "/",
   *   no padding
   */
  dec(base64Str) {
    let es = base64Str.length * 3 / 4;
    if (base64Str[base64Str.length - 2] == "=")
      es -= 2;
    else if (base64Str[base64Str.length - 1] == "=")
      es -= 1;
    let bytes = new Uint8Array(es), bytePos = 0, groupPos = 0, b, p = 0;
    for (let i = 0; i < base64Str.length; i++) {
      b = decTable[base64Str.charCodeAt(i)];
      if (b === void 0) {
        switch (base64Str[i]) {
          case "=":
            groupPos = 0;
          case "\n":
          case "\r":
          case "	":
          case " ":
            continue;
          default:
            throw Error("invalid base64 string.");
        }
      }
      switch (groupPos) {
        case 0:
          p = b;
          groupPos = 1;
          break;
        case 1:
          bytes[bytePos++] = p << 2 | (b & 48) >> 4;
          p = b;
          groupPos = 2;
          break;
        case 2:
          bytes[bytePos++] = (p & 15) << 4 | (b & 60) >> 2;
          p = b;
          groupPos = 3;
          break;
        case 3:
          bytes[bytePos++] = (p & 3) << 6 | b;
          groupPos = 0;
          break;
      }
    }
    if (groupPos == 1)
      throw Error("invalid base64 string.");
    return bytes.subarray(0, bytePos);
  },
  /**
   * Encode a byte array to a base64 string.
   */
  enc(bytes) {
    let base64 = "", groupPos = 0, b, p = 0;
    for (let i = 0; i < bytes.length; i++) {
      b = bytes[i];
      switch (groupPos) {
        case 0:
          base64 += encTable[b >> 2];
          p = (b & 3) << 4;
          groupPos = 1;
          break;
        case 1:
          base64 += encTable[p | b >> 4];
          p = (b & 15) << 2;
          groupPos = 2;
          break;
        case 2:
          base64 += encTable[p | b >> 6];
          base64 += encTable[b & 63];
          groupPos = 0;
          break;
      }
    }
    if (groupPos) {
      base64 += encTable[p];
      base64 += "=";
      if (groupPos == 1)
        base64 += "=";
    }
    return base64;
  }
};

// ../../../../.cache/deno/deno_esbuild/@bufbuild/protobuf@1.4.2/node_modules/@bufbuild/protobuf/dist/esm/private/json-format-common.js
var jsonReadDefaults = {
  ignoreUnknownFields: false
};
var jsonWriteDefaults = {
  emitDefaultValues: false,
  enumAsInteger: false,
  useProtoFieldName: false,
  prettySpaces: 0
};
function makeReadOptions2(options) {
  return options ? Object.assign(Object.assign({}, jsonReadDefaults), options) : jsonReadDefaults;
}
function makeWriteOptions2(options) {
  return options ? Object.assign(Object.assign({}, jsonWriteDefaults), options) : jsonWriteDefaults;
}
function makeJsonFormatCommon(makeWriteField) {
  const writeField = makeWriteField(writeEnum, writeScalar2);
  return {
    makeReadOptions: makeReadOptions2,
    makeWriteOptions: makeWriteOptions2,
    readMessage(type, json, options, message) {
      if (json == null || Array.isArray(json) || typeof json != "object") {
        throw new Error(`cannot decode message ${type.typeName} from JSON: ${this.debug(json)}`);
      }
      message = message !== null && message !== void 0 ? message : new type();
      const oneofSeen = {};
      for (const [jsonKey, jsonValue] of Object.entries(json)) {
        const field = type.fields.findJsonName(jsonKey);
        if (!field) {
          if (!options.ignoreUnknownFields) {
            throw new Error(`cannot decode message ${type.typeName} from JSON: key "${jsonKey}" is unknown`);
          }
          continue;
        }
        let localName = field.localName;
        let target = message;
        if (field.oneof) {
          if (jsonValue === null && field.kind == "scalar") {
            continue;
          }
          const seen = oneofSeen[field.oneof.localName];
          if (seen) {
            throw new Error(`cannot decode message ${type.typeName} from JSON: multiple keys for oneof "${field.oneof.name}" present: "${seen}", "${jsonKey}"`);
          }
          oneofSeen[field.oneof.localName] = jsonKey;
          target = target[field.oneof.localName] = { case: localName };
          localName = "value";
        }
        if (field.repeated) {
          if (jsonValue === null) {
            continue;
          }
          if (!Array.isArray(jsonValue)) {
            throw new Error(`cannot decode field ${type.typeName}.${field.name} from JSON: ${this.debug(jsonValue)}`);
          }
          const targetArray = target[localName];
          for (const jsonItem of jsonValue) {
            if (jsonItem === null) {
              throw new Error(`cannot decode field ${type.typeName}.${field.name} from JSON: ${this.debug(jsonItem)}`);
            }
            let val;
            switch (field.kind) {
              case "message":
                val = field.T.fromJson(jsonItem, options);
                break;
              case "enum":
                val = readEnum(field.T, jsonItem, options.ignoreUnknownFields);
                if (val === void 0)
                  continue;
                break;
              case "scalar":
                try {
                  val = readScalar2(field.T, jsonItem, field.L);
                } catch (e) {
                  let m = `cannot decode field ${type.typeName}.${field.name} from JSON: ${this.debug(jsonItem)}`;
                  if (e instanceof Error && e.message.length > 0) {
                    m += `: ${e.message}`;
                  }
                  throw new Error(m);
                }
                break;
            }
            targetArray.push(val);
          }
        } else if (field.kind == "map") {
          if (jsonValue === null) {
            continue;
          }
          if (Array.isArray(jsonValue) || typeof jsonValue != "object") {
            throw new Error(`cannot decode field ${type.typeName}.${field.name} from JSON: ${this.debug(jsonValue)}`);
          }
          const targetMap = target[localName];
          for (const [jsonMapKey, jsonMapValue] of Object.entries(jsonValue)) {
            if (jsonMapValue === null) {
              throw new Error(`cannot decode field ${type.typeName}.${field.name} from JSON: map value null`);
            }
            let val;
            switch (field.V.kind) {
              case "message":
                val = field.V.T.fromJson(jsonMapValue, options);
                break;
              case "enum":
                val = readEnum(field.V.T, jsonMapValue, options.ignoreUnknownFields);
                if (val === void 0)
                  continue;
                break;
              case "scalar":
                try {
                  val = readScalar2(field.V.T, jsonMapValue, LongType.BIGINT);
                } catch (e) {
                  let m = `cannot decode map value for field ${type.typeName}.${field.name} from JSON: ${this.debug(jsonValue)}`;
                  if (e instanceof Error && e.message.length > 0) {
                    m += `: ${e.message}`;
                  }
                  throw new Error(m);
                }
                break;
            }
            try {
              targetMap[readScalar2(field.K, field.K == ScalarType.BOOL ? jsonMapKey == "true" ? true : jsonMapKey == "false" ? false : jsonMapKey : jsonMapKey, LongType.BIGINT).toString()] = val;
            } catch (e) {
              let m = `cannot decode map key for field ${type.typeName}.${field.name} from JSON: ${this.debug(jsonValue)}`;
              if (e instanceof Error && e.message.length > 0) {
                m += `: ${e.message}`;
              }
              throw new Error(m);
            }
          }
        } else {
          switch (field.kind) {
            case "message":
              const messageType = field.T;
              if (jsonValue === null && messageType.typeName != "google.protobuf.Value") {
                if (field.oneof) {
                  throw new Error(`cannot decode field ${type.typeName}.${field.name} from JSON: null is invalid for oneof field "${jsonKey}"`);
                }
                continue;
              }
              if (target[localName] instanceof Message) {
                target[localName].fromJson(jsonValue, options);
              } else {
                target[localName] = messageType.fromJson(jsonValue, options);
                if (messageType.fieldWrapper && !field.oneof) {
                  target[localName] = messageType.fieldWrapper.unwrapField(target[localName]);
                }
              }
              break;
            case "enum":
              const enumValue = readEnum(field.T, jsonValue, options.ignoreUnknownFields);
              if (enumValue !== void 0) {
                target[localName] = enumValue;
              }
              break;
            case "scalar":
              try {
                target[localName] = readScalar2(field.T, jsonValue, field.L);
              } catch (e) {
                let m = `cannot decode field ${type.typeName}.${field.name} from JSON: ${this.debug(jsonValue)}`;
                if (e instanceof Error && e.message.length > 0) {
                  m += `: ${e.message}`;
                }
                throw new Error(m);
              }
              break;
          }
        }
      }
      return message;
    },
    writeMessage(message, options) {
      const type = message.getType();
      const json = {};
      let field;
      try {
        for (const member of type.fields.byMember()) {
          let jsonValue;
          if (member.kind == "oneof") {
            const oneof = message[member.localName];
            if (oneof.value === void 0) {
              continue;
            }
            field = member.findField(oneof.case);
            if (!field) {
              throw "oneof case not found: " + oneof.case;
            }
            jsonValue = writeField(field, oneof.value, options);
          } else {
            field = member;
            jsonValue = writeField(field, message[field.localName], options);
          }
          if (jsonValue !== void 0) {
            json[options.useProtoFieldName ? field.name : field.jsonName] = jsonValue;
          }
        }
      } catch (e) {
        const m = field ? `cannot encode field ${type.typeName}.${field.name} to JSON` : `cannot encode message ${type.typeName} to JSON`;
        const r = e instanceof Error ? e.message : String(e);
        throw new Error(m + (r.length > 0 ? `: ${r}` : ""));
      }
      return json;
    },
    readScalar: readScalar2,
    writeScalar: writeScalar2,
    debug: debugJsonValue
  };
}
function debugJsonValue(json) {
  if (json === null) {
    return "null";
  }
  switch (typeof json) {
    case "object":
      return Array.isArray(json) ? "array" : "object";
    case "string":
      return json.length > 100 ? "string" : `"${json.split('"').join('\\"')}"`;
    default:
      return String(json);
  }
}
function readScalar2(type, json, longType) {
  switch (type) {
    case ScalarType.DOUBLE:
    case ScalarType.FLOAT:
      if (json === null)
        return 0;
      if (json === "NaN")
        return Number.NaN;
      if (json === "Infinity")
        return Number.POSITIVE_INFINITY;
      if (json === "-Infinity")
        return Number.NEGATIVE_INFINITY;
      if (json === "") {
        break;
      }
      if (typeof json == "string" && json.trim().length !== json.length) {
        break;
      }
      if (typeof json != "string" && typeof json != "number") {
        break;
      }
      const float = Number(json);
      if (Number.isNaN(float)) {
        break;
      }
      if (!Number.isFinite(float)) {
        break;
      }
      if (type == ScalarType.FLOAT)
        assertFloat32(float);
      return float;
    case ScalarType.INT32:
    case ScalarType.FIXED32:
    case ScalarType.SFIXED32:
    case ScalarType.SINT32:
    case ScalarType.UINT32:
      if (json === null)
        return 0;
      let int32;
      if (typeof json == "number")
        int32 = json;
      else if (typeof json == "string" && json.length > 0) {
        if (json.trim().length === json.length)
          int32 = Number(json);
      }
      if (int32 === void 0)
        break;
      if (type == ScalarType.UINT32)
        assertUInt32(int32);
      else
        assertInt32(int32);
      return int32;
    case ScalarType.INT64:
    case ScalarType.SFIXED64:
    case ScalarType.SINT64:
      if (json === null)
        return protoInt64.zero;
      if (typeof json != "number" && typeof json != "string")
        break;
      const long = protoInt64.parse(json);
      return longType ? long.toString() : long;
    case ScalarType.FIXED64:
    case ScalarType.UINT64:
      if (json === null)
        return protoInt64.zero;
      if (typeof json != "number" && typeof json != "string")
        break;
      const uLong = protoInt64.uParse(json);
      return longType ? uLong.toString() : uLong;
    case ScalarType.BOOL:
      if (json === null)
        return false;
      if (typeof json !== "boolean")
        break;
      return json;
    case ScalarType.STRING:
      if (json === null)
        return "";
      if (typeof json !== "string") {
        break;
      }
      try {
        encodeURIComponent(json);
      } catch (e) {
        throw new Error("invalid UTF8");
      }
      return json;
    case ScalarType.BYTES:
      if (json === null || json === "")
        return new Uint8Array(0);
      if (typeof json !== "string")
        break;
      return protoBase64.dec(json);
  }
  throw new Error();
}
function readEnum(type, json, ignoreUnknownFields) {
  if (json === null) {
    return 0;
  }
  switch (typeof json) {
    case "number":
      if (Number.isInteger(json)) {
        return json;
      }
      break;
    case "string":
      const value = type.findName(json);
      if (value || ignoreUnknownFields) {
        return value === null || value === void 0 ? void 0 : value.no;
      }
      break;
  }
  throw new Error(`cannot decode enum ${type.typeName} from JSON: ${debugJsonValue(json)}`);
}
function writeEnum(type, value, emitIntrinsicDefault, enumAsInteger) {
  var _a;
  if (value === void 0) {
    return value;
  }
  if (value === 0 && !emitIntrinsicDefault) {
    return void 0;
  }
  if (enumAsInteger) {
    return value;
  }
  if (type.typeName == "google.protobuf.NullValue") {
    return null;
  }
  const val = type.findNumber(value);
  return (_a = val === null || val === void 0 ? void 0 : val.name) !== null && _a !== void 0 ? _a : value;
}
function writeScalar2(type, value, emitIntrinsicDefault) {
  if (value === void 0) {
    return void 0;
  }
  switch (type) {
    case ScalarType.INT32:
    case ScalarType.SFIXED32:
    case ScalarType.SINT32:
    case ScalarType.FIXED32:
    case ScalarType.UINT32:
      assert(typeof value == "number");
      return value != 0 || emitIntrinsicDefault ? value : void 0;
    case ScalarType.FLOAT:
    case ScalarType.DOUBLE:
      assert(typeof value == "number");
      if (Number.isNaN(value))
        return "NaN";
      if (value === Number.POSITIVE_INFINITY)
        return "Infinity";
      if (value === Number.NEGATIVE_INFINITY)
        return "-Infinity";
      return value !== 0 || emitIntrinsicDefault ? value : void 0;
    case ScalarType.STRING:
      assert(typeof value == "string");
      return value.length > 0 || emitIntrinsicDefault ? value : void 0;
    case ScalarType.BOOL:
      assert(typeof value == "boolean");
      return value || emitIntrinsicDefault ? value : void 0;
    case ScalarType.UINT64:
    case ScalarType.FIXED64:
    case ScalarType.INT64:
    case ScalarType.SFIXED64:
    case ScalarType.SINT64:
      assert(typeof value == "bigint" || typeof value == "string" || typeof value == "number");
      return emitIntrinsicDefault || value != 0 ? value.toString(10) : void 0;
    case ScalarType.BYTES:
      assert(value instanceof Uint8Array);
      return emitIntrinsicDefault || value.byteLength > 0 ? protoBase64.enc(value) : void 0;
  }
}

// ../../../../.cache/deno/deno_esbuild/@bufbuild/protobuf@1.4.2/node_modules/@bufbuild/protobuf/dist/esm/private/json-format-proto3.js
function makeJsonFormatProto3() {
  return makeJsonFormatCommon((writeEnum2, writeScalar3) => {
    return function writeField(field, value, options) {
      if (field.kind == "map") {
        const jsonObj = {};
        switch (field.V.kind) {
          case "scalar":
            for (const [entryKey, entryValue] of Object.entries(value)) {
              const val = writeScalar3(field.V.T, entryValue, true);
              assert(val !== void 0);
              jsonObj[entryKey.toString()] = val;
            }
            break;
          case "message":
            for (const [entryKey, entryValue] of Object.entries(value)) {
              jsonObj[entryKey.toString()] = entryValue.toJson(options);
            }
            break;
          case "enum":
            const enumType = field.V.T;
            for (const [entryKey, entryValue] of Object.entries(value)) {
              assert(entryValue === void 0 || typeof entryValue == "number");
              const val = writeEnum2(enumType, entryValue, true, options.enumAsInteger);
              assert(val !== void 0);
              jsonObj[entryKey.toString()] = val;
            }
            break;
        }
        return options.emitDefaultValues || Object.keys(jsonObj).length > 0 ? jsonObj : void 0;
      } else if (field.repeated) {
        const jsonArr = [];
        switch (field.kind) {
          case "scalar":
            for (let i = 0; i < value.length; i++) {
              jsonArr.push(writeScalar3(field.T, value[i], true));
            }
            break;
          case "enum":
            for (let i = 0; i < value.length; i++) {
              jsonArr.push(writeEnum2(field.T, value[i], true, options.enumAsInteger));
            }
            break;
          case "message":
            for (let i = 0; i < value.length; i++) {
              jsonArr.push(wrapField(field.T, value[i]).toJson(options));
            }
            break;
        }
        return options.emitDefaultValues || jsonArr.length > 0 ? jsonArr : void 0;
      } else {
        switch (field.kind) {
          case "scalar":
            return writeScalar3(field.T, value, !!field.oneof || field.opt || options.emitDefaultValues);
          case "enum":
            return writeEnum2(field.T, value, !!field.oneof || field.opt || options.emitDefaultValues, options.enumAsInteger);
          case "message":
            return value !== void 0 ? wrapField(field.T, value).toJson(options) : void 0;
        }
      }
    };
  });
}

// ../../../../.cache/deno/deno_esbuild/@bufbuild/protobuf@1.4.2/node_modules/@bufbuild/protobuf/dist/esm/private/util-common.js
function makeUtilCommon() {
  return {
    setEnumType,
    initPartial(source, target) {
      if (source === void 0) {
        return;
      }
      const type = target.getType();
      for (const member of type.fields.byMember()) {
        const localName = member.localName, t = target, s = source;
        if (s[localName] === void 0) {
          continue;
        }
        switch (member.kind) {
          case "oneof":
            const sk = s[localName].case;
            if (sk === void 0) {
              continue;
            }
            const sourceField = member.findField(sk);
            let val = s[localName].value;
            if (sourceField && sourceField.kind == "message" && !(val instanceof sourceField.T)) {
              val = new sourceField.T(val);
            } else if (sourceField && sourceField.kind === "scalar" && sourceField.T === ScalarType.BYTES) {
              val = toU8Arr(val);
            }
            t[localName] = { case: sk, value: val };
            break;
          case "scalar":
          case "enum":
            let copy = s[localName];
            if (member.T === ScalarType.BYTES) {
              copy = member.repeated ? copy.map(toU8Arr) : toU8Arr(copy);
            }
            t[localName] = copy;
            break;
          case "map":
            switch (member.V.kind) {
              case "scalar":
              case "enum":
                if (member.V.T === ScalarType.BYTES) {
                  for (const [k, v] of Object.entries(s[localName])) {
                    t[localName][k] = toU8Arr(v);
                  }
                } else {
                  Object.assign(t[localName], s[localName]);
                }
                break;
              case "message":
                const messageType = member.V.T;
                for (const k of Object.keys(s[localName])) {
                  let val2 = s[localName][k];
                  if (!messageType.fieldWrapper) {
                    val2 = new messageType(val2);
                  }
                  t[localName][k] = val2;
                }
                break;
            }
            break;
          case "message":
            const mt = member.T;
            if (member.repeated) {
              t[localName] = s[localName].map((val2) => val2 instanceof mt ? val2 : new mt(val2));
            } else if (s[localName] !== void 0) {
              const val2 = s[localName];
              if (mt.fieldWrapper) {
                if (
                  // We can't use BytesValue.typeName as that will create a circular import
                  mt.typeName === "google.protobuf.BytesValue"
                ) {
                  t[localName] = toU8Arr(val2);
                } else {
                  t[localName] = val2;
                }
              } else {
                t[localName] = val2 instanceof mt ? val2 : new mt(val2);
              }
            }
            break;
        }
      }
    },
    equals(type, a, b) {
      if (a === b) {
        return true;
      }
      if (!a || !b) {
        return false;
      }
      return type.fields.byMember().every((m) => {
        const va = a[m.localName];
        const vb = b[m.localName];
        if (m.repeated) {
          if (va.length !== vb.length) {
            return false;
          }
          switch (m.kind) {
            case "message":
              return va.every((a2, i) => m.T.equals(a2, vb[i]));
            case "scalar":
              return va.every((a2, i) => scalarEquals(m.T, a2, vb[i]));
            case "enum":
              return va.every((a2, i) => scalarEquals(ScalarType.INT32, a2, vb[i]));
          }
          throw new Error(`repeated cannot contain ${m.kind}`);
        }
        switch (m.kind) {
          case "message":
            return m.T.equals(va, vb);
          case "enum":
            return scalarEquals(ScalarType.INT32, va, vb);
          case "scalar":
            return scalarEquals(m.T, va, vb);
          case "oneof":
            if (va.case !== vb.case) {
              return false;
            }
            const s = m.findField(va.case);
            if (s === void 0) {
              return true;
            }
            switch (s.kind) {
              case "message":
                return s.T.equals(va.value, vb.value);
              case "enum":
                return scalarEquals(ScalarType.INT32, va.value, vb.value);
              case "scalar":
                return scalarEquals(s.T, va.value, vb.value);
            }
            throw new Error(`oneof cannot contain ${s.kind}`);
          case "map":
            const keys = Object.keys(va).concat(Object.keys(vb));
            switch (m.V.kind) {
              case "message":
                const messageType = m.V.T;
                return keys.every((k) => messageType.equals(va[k], vb[k]));
              case "enum":
                return keys.every((k) => scalarEquals(ScalarType.INT32, va[k], vb[k]));
              case "scalar":
                const scalarType = m.V.T;
                return keys.every((k) => scalarEquals(scalarType, va[k], vb[k]));
            }
            break;
        }
      });
    },
    clone(message) {
      const type = message.getType(), target = new type(), any = target;
      for (const member of type.fields.byMember()) {
        const source = message[member.localName];
        let copy;
        if (member.repeated) {
          copy = source.map(cloneSingularField);
        } else if (member.kind == "map") {
          copy = any[member.localName];
          for (const [key, v] of Object.entries(source)) {
            copy[key] = cloneSingularField(v);
          }
        } else if (member.kind == "oneof") {
          const f = member.findField(source.case);
          copy = f ? { case: source.case, value: cloneSingularField(source.value) } : { case: void 0 };
        } else {
          copy = cloneSingularField(source);
        }
        any[member.localName] = copy;
      }
      return target;
    }
  };
}
function cloneSingularField(value) {
  if (value === void 0) {
    return value;
  }
  if (value instanceof Message) {
    return value.clone();
  }
  if (value instanceof Uint8Array) {
    const c = new Uint8Array(value.byteLength);
    c.set(value);
    return c;
  }
  return value;
}
function toU8Arr(input) {
  return input instanceof Uint8Array ? input : new Uint8Array(input);
}

// ../../../../.cache/deno/deno_esbuild/@bufbuild/protobuf@1.4.2/node_modules/@bufbuild/protobuf/dist/esm/private/field-list.js
var InternalFieldList = class {
  constructor(fields, normalizer) {
    this._fields = fields;
    this._normalizer = normalizer;
  }
  findJsonName(jsonName) {
    if (!this.jsonNames) {
      const t = {};
      for (const f of this.list()) {
        t[f.jsonName] = t[f.name] = f;
      }
      this.jsonNames = t;
    }
    return this.jsonNames[jsonName];
  }
  find(fieldNo) {
    if (!this.numbers) {
      const t = {};
      for (const f of this.list()) {
        t[f.no] = f;
      }
      this.numbers = t;
    }
    return this.numbers[fieldNo];
  }
  list() {
    if (!this.all) {
      this.all = this._normalizer(this._fields);
    }
    return this.all;
  }
  byNumber() {
    if (!this.numbersAsc) {
      this.numbersAsc = this.list().concat().sort((a, b) => a.no - b.no);
    }
    return this.numbersAsc;
  }
  byMember() {
    if (!this.members) {
      this.members = [];
      const a = this.members;
      let o;
      for (const f of this.list()) {
        if (f.oneof) {
          if (f.oneof !== o) {
            o = f.oneof;
            a.push(o);
          }
        } else {
          a.push(f);
        }
      }
    }
    return this.members;
  }
};

// ../../../../.cache/deno/deno_esbuild/@bufbuild/protobuf@1.4.2/node_modules/@bufbuild/protobuf/dist/esm/private/names.js
function localFieldName(protoName, inOneof) {
  const name = protoCamelCase(protoName);
  if (inOneof) {
    return name;
  }
  return safeObjectProperty(safeMessageProperty(name));
}
function localOneofName(protoName) {
  return localFieldName(protoName, false);
}
var fieldJsonName = protoCamelCase;
function protoCamelCase(snakeCase) {
  let capNext = false;
  const b = [];
  for (let i = 0; i < snakeCase.length; i++) {
    let c = snakeCase.charAt(i);
    switch (c) {
      case "_":
        capNext = true;
        break;
      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        b.push(c);
        capNext = false;
        break;
      default:
        if (capNext) {
          capNext = false;
          c = c.toUpperCase();
        }
        b.push(c);
        break;
    }
  }
  return b.join("");
}
var reservedObjectProperties = /* @__PURE__ */ new Set([
  // names reserved by JavaScript
  "constructor",
  "toString",
  "toJSON",
  "valueOf"
]);
var reservedMessageProperties = /* @__PURE__ */ new Set([
  // names reserved by the runtime
  "getType",
  "clone",
  "equals",
  "fromBinary",
  "fromJson",
  "fromJsonString",
  "toBinary",
  "toJson",
  "toJsonString",
  // names reserved by the runtime for the future
  "toObject"
]);
var fallback = (name) => `${name}$`;
var safeMessageProperty = (name) => {
  if (reservedMessageProperties.has(name)) {
    return fallback(name);
  }
  return name;
};
var safeObjectProperty = (name) => {
  if (reservedObjectProperties.has(name)) {
    return fallback(name);
  }
  return name;
};

// ../../../../.cache/deno/deno_esbuild/@bufbuild/protobuf@1.4.2/node_modules/@bufbuild/protobuf/dist/esm/private/field.js
var InternalOneofInfo = class {
  constructor(name) {
    this.kind = "oneof";
    this.repeated = false;
    this.packed = false;
    this.opt = false;
    this.default = void 0;
    this.fields = [];
    this.name = name;
    this.localName = localOneofName(name);
  }
  addField(field) {
    assert(field.oneof === this, `field ${field.name} not one of ${this.name}`);
    this.fields.push(field);
  }
  findField(localName) {
    if (!this._lookup) {
      this._lookup = /* @__PURE__ */ Object.create(null);
      for (let i = 0; i < this.fields.length; i++) {
        this._lookup[this.fields[i].localName] = this.fields[i];
      }
    }
    return this._lookup[localName];
  }
};

// ../../../../.cache/deno/deno_esbuild/@bufbuild/protobuf@1.4.2/node_modules/@bufbuild/protobuf/dist/esm/proto3.js
var proto3 = makeProtoRuntime("proto3", makeJsonFormatProto3(), makeBinaryFormatProto3(), Object.assign(Object.assign({}, makeUtilCommon()), {
  newFieldList(fields) {
    return new InternalFieldList(fields, normalizeFieldInfosProto3);
  },
  initFields(target) {
    for (const member of target.getType().fields.byMember()) {
      if (member.opt) {
        continue;
      }
      const name = member.localName, t = target;
      if (member.repeated) {
        t[name] = [];
        continue;
      }
      switch (member.kind) {
        case "oneof":
          t[name] = { case: void 0 };
          break;
        case "enum":
          t[name] = 0;
          break;
        case "map":
          t[name] = {};
          break;
        case "scalar":
          t[name] = scalarDefaultValue(member.T, member.L);
          break;
        case "message":
          break;
      }
    }
  }
}));
function normalizeFieldInfosProto3(fieldInfos) {
  var _a, _b, _c, _d;
  const r = [];
  let o;
  for (const field of typeof fieldInfos == "function" ? fieldInfos() : fieldInfos) {
    const f = field;
    f.localName = localFieldName(field.name, field.oneof !== void 0);
    f.jsonName = (_a = field.jsonName) !== null && _a !== void 0 ? _a : fieldJsonName(field.name);
    f.repeated = (_b = field.repeated) !== null && _b !== void 0 ? _b : false;
    if (field.kind == "scalar") {
      f.L = (_c = field.L) !== null && _c !== void 0 ? _c : LongType.BIGINT;
    }
    f.packed = (_d = field.packed) !== null && _d !== void 0 ? _d : field.kind == "enum" || field.kind == "scalar" && field.T != ScalarType.BYTES && field.T != ScalarType.STRING;
    if (field.oneof !== void 0) {
      const ooname = typeof field.oneof == "string" ? field.oneof : field.oneof.name;
      if (!o || o.name != ooname) {
        o = new InternalOneofInfo(ooname);
      }
      f.oneof = o;
      o.addField(f);
    }
    r.push(f);
  }
  return r;
}

// ../../../../.cache/deno/deno_esbuild/@utxorpc-web/cardano-spec@1.0.0-alpha.0/node_modules/@utxorpc-web/cardano-spec/lib/utxorpc/cardano/v1/cardano_pb.js
var RedeemerPurpose;
(function(RedeemerPurpose2) {
  RedeemerPurpose2[RedeemerPurpose2["UNSPECIFIED"] = 0] = "UNSPECIFIED";
  RedeemerPurpose2[RedeemerPurpose2["SPEND"] = 1] = "SPEND";
  RedeemerPurpose2[RedeemerPurpose2["MINT"] = 2] = "MINT";
  RedeemerPurpose2[RedeemerPurpose2["CERT"] = 3] = "CERT";
  RedeemerPurpose2[RedeemerPurpose2["REWARD"] = 4] = "REWARD";
})(RedeemerPurpose || (RedeemerPurpose = {}));
proto3.util.setEnumType(RedeemerPurpose, "utxorpc.cardano.v1.RedeemerPurpose", [
  { no: 0, name: "REDEEMER_PURPOSE_UNSPECIFIED" },
  { no: 1, name: "REDEEMER_PURPOSE_SPEND" },
  { no: 2, name: "REDEEMER_PURPOSE_MINT" },
  { no: 3, name: "REDEEMER_PURPOSE_CERT" },
  { no: 4, name: "REDEEMER_PURPOSE_REWARD" }
]);
var MirSource;
(function(MirSource2) {
  MirSource2[MirSource2["UNSPECIFIED"] = 0] = "UNSPECIFIED";
  MirSource2[MirSource2["RESERVES"] = 1] = "RESERVES";
  MirSource2[MirSource2["TREASURY"] = 2] = "TREASURY";
})(MirSource || (MirSource = {}));
proto3.util.setEnumType(MirSource, "utxorpc.cardano.v1.MirSource", [
  { no: 0, name: "MIR_SOURCE_UNSPECIFIED" },
  { no: 1, name: "MIR_SOURCE_RESERVES" },
  { no: 2, name: "MIR_SOURCE_TREASURY" }
]);
var Redeemer = class extends Message {
  constructor(data) {
    super();
    this.purpose = RedeemerPurpose.UNSPECIFIED;
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new Redeemer().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new Redeemer().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new Redeemer().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(Redeemer, a, b);
  }
};
Redeemer.runtime = proto3;
Redeemer.typeName = "utxorpc.cardano.v1.Redeemer";
Redeemer.fields = proto3.util.newFieldList(() => [
  { no: 1, name: "purpose", kind: "enum", T: proto3.getEnumType(RedeemerPurpose) },
  { no: 2, name: "datum", kind: "message", T: PlutusData }
]);
var TxInput = class extends Message {
  constructor(data) {
    super();
    this.txHash = new Uint8Array(0);
    this.outputIndex = 0;
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new TxInput().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new TxInput().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new TxInput().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(TxInput, a, b);
  }
};
TxInput.runtime = proto3;
TxInput.typeName = "utxorpc.cardano.v1.TxInput";
TxInput.fields = proto3.util.newFieldList(() => [
  {
    no: 1,
    name: "tx_hash",
    kind: "scalar",
    T: 12
    /* ScalarType.BYTES */
  },
  {
    no: 2,
    name: "output_index",
    kind: "scalar",
    T: 13
    /* ScalarType.UINT32 */
  },
  { no: 3, name: "as_output", kind: "message", T: TxOutput },
  { no: 4, name: "redeemer", kind: "message", T: Redeemer }
]);
var TxOutput = class extends Message {
  constructor(data) {
    super();
    this.address = new Uint8Array(0);
    this.coin = protoInt64.zero;
    this.assets = [];
    this.datumHash = new Uint8Array(0);
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new TxOutput().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new TxOutput().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new TxOutput().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(TxOutput, a, b);
  }
};
TxOutput.runtime = proto3;
TxOutput.typeName = "utxorpc.cardano.v1.TxOutput";
TxOutput.fields = proto3.util.newFieldList(() => [
  {
    no: 1,
    name: "address",
    kind: "scalar",
    T: 12
    /* ScalarType.BYTES */
  },
  {
    no: 2,
    name: "coin",
    kind: "scalar",
    T: 4
    /* ScalarType.UINT64 */
  },
  { no: 3, name: "assets", kind: "message", T: Multiasset, repeated: true },
  { no: 4, name: "datum", kind: "message", T: PlutusData },
  {
    no: 5,
    name: "datum_hash",
    kind: "scalar",
    T: 12
    /* ScalarType.BYTES */
  },
  { no: 6, name: "script", kind: "message", T: Script }
]);
var Asset = class extends Message {
  constructor(data) {
    super();
    this.name = new Uint8Array(0);
    this.outputCoin = protoInt64.zero;
    this.mintCoin = protoInt64.zero;
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new Asset().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new Asset().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new Asset().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(Asset, a, b);
  }
};
Asset.runtime = proto3;
Asset.typeName = "utxorpc.cardano.v1.Asset";
Asset.fields = proto3.util.newFieldList(() => [
  {
    no: 1,
    name: "name",
    kind: "scalar",
    T: 12
    /* ScalarType.BYTES */
  },
  {
    no: 2,
    name: "output_coin",
    kind: "scalar",
    T: 4
    /* ScalarType.UINT64 */
  },
  {
    no: 3,
    name: "mint_coin",
    kind: "scalar",
    T: 3
    /* ScalarType.INT64 */
  }
]);
var Multiasset = class extends Message {
  constructor(data) {
    super();
    this.policyId = new Uint8Array(0);
    this.assets = [];
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new Multiasset().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new Multiasset().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new Multiasset().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(Multiasset, a, b);
  }
};
Multiasset.runtime = proto3;
Multiasset.typeName = "utxorpc.cardano.v1.Multiasset";
Multiasset.fields = proto3.util.newFieldList(() => [
  {
    no: 1,
    name: "policy_id",
    kind: "scalar",
    T: 12
    /* ScalarType.BYTES */
  },
  { no: 2, name: "assets", kind: "message", T: Asset, repeated: true }
]);
var TxValidity = class extends Message {
  constructor(data) {
    super();
    this.start = protoInt64.zero;
    this.ttl = protoInt64.zero;
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new TxValidity().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new TxValidity().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new TxValidity().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(TxValidity, a, b);
  }
};
TxValidity.runtime = proto3;
TxValidity.typeName = "utxorpc.cardano.v1.TxValidity";
TxValidity.fields = proto3.util.newFieldList(() => [
  {
    no: 1,
    name: "start",
    kind: "scalar",
    T: 4
    /* ScalarType.UINT64 */
  },
  {
    no: 2,
    name: "ttl",
    kind: "scalar",
    T: 4
    /* ScalarType.UINT64 */
  }
]);
var Collateral = class extends Message {
  constructor(data) {
    super();
    this.collateral = [];
    this.totalCollateral = protoInt64.zero;
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new Collateral().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new Collateral().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new Collateral().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(Collateral, a, b);
  }
};
Collateral.runtime = proto3;
Collateral.typeName = "utxorpc.cardano.v1.Collateral";
Collateral.fields = proto3.util.newFieldList(() => [
  { no: 1, name: "collateral", kind: "message", T: TxInput, repeated: true },
  { no: 2, name: "collateral_return", kind: "message", T: TxOutput },
  {
    no: 3,
    name: "total_collateral",
    kind: "scalar",
    T: 4
    /* ScalarType.UINT64 */
  }
]);
var Withdrawal = class extends Message {
  constructor(data) {
    super();
    this.rewardAccount = new Uint8Array(0);
    this.coin = protoInt64.zero;
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new Withdrawal().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new Withdrawal().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new Withdrawal().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(Withdrawal, a, b);
  }
};
Withdrawal.runtime = proto3;
Withdrawal.typeName = "utxorpc.cardano.v1.Withdrawal";
Withdrawal.fields = proto3.util.newFieldList(() => [
  {
    no: 1,
    name: "reward_account",
    kind: "scalar",
    T: 12
    /* ScalarType.BYTES */
  },
  {
    no: 2,
    name: "coin",
    kind: "scalar",
    T: 4
    /* ScalarType.UINT64 */
  }
]);
var WitnessSet = class extends Message {
  constructor(data) {
    super();
    this.vkeywitness = [];
    this.script = [];
    this.plutusDatums = [];
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new WitnessSet().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new WitnessSet().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new WitnessSet().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(WitnessSet, a, b);
  }
};
WitnessSet.runtime = proto3;
WitnessSet.typeName = "utxorpc.cardano.v1.WitnessSet";
WitnessSet.fields = proto3.util.newFieldList(() => [
  { no: 1, name: "vkeywitness", kind: "message", T: VKeyWitness, repeated: true },
  { no: 2, name: "script", kind: "message", T: Script, repeated: true },
  { no: 3, name: "plutus_datums", kind: "message", T: PlutusData, repeated: true }
]);
var AuxData = class extends Message {
  constructor(data) {
    super();
    this.metadata = [];
    this.scripts = [];
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new AuxData().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new AuxData().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new AuxData().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(AuxData, a, b);
  }
};
AuxData.runtime = proto3;
AuxData.typeName = "utxorpc.cardano.v1.AuxData";
AuxData.fields = proto3.util.newFieldList(() => [
  { no: 1, name: "metadata", kind: "message", T: Metadata, repeated: true },
  { no: 2, name: "scripts", kind: "message", T: Script, repeated: true }
]);
var Tx = class extends Message {
  constructor(data) {
    super();
    this.inputs = [];
    this.outputs = [];
    this.certificates = [];
    this.withdrawals = [];
    this.mint = [];
    this.referenceInputs = [];
    this.fee = protoInt64.zero;
    this.successful = false;
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new Tx().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new Tx().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new Tx().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(Tx, a, b);
  }
};
Tx.runtime = proto3;
Tx.typeName = "utxorpc.cardano.v1.Tx";
Tx.fields = proto3.util.newFieldList(() => [
  { no: 1, name: "inputs", kind: "message", T: TxInput, repeated: true },
  { no: 2, name: "outputs", kind: "message", T: TxOutput, repeated: true },
  { no: 3, name: "certificates", kind: "message", T: Certificate, repeated: true },
  { no: 4, name: "withdrawals", kind: "message", T: Withdrawal, repeated: true },
  { no: 5, name: "mint", kind: "message", T: Multiasset, repeated: true },
  { no: 6, name: "reference_inputs", kind: "message", T: TxInput, repeated: true },
  { no: 7, name: "witnesses", kind: "message", T: WitnessSet },
  { no: 8, name: "collateral", kind: "message", T: Collateral },
  {
    no: 9,
    name: "fee",
    kind: "scalar",
    T: 4
    /* ScalarType.UINT64 */
  },
  { no: 10, name: "validity", kind: "message", T: TxValidity },
  {
    no: 11,
    name: "successful",
    kind: "scalar",
    T: 8
    /* ScalarType.BOOL */
  },
  { no: 12, name: "auxiliary", kind: "message", T: AuxData }
]);
var BlockHeader = class extends Message {
  constructor(data) {
    super();
    this.slot = protoInt64.zero;
    this.hash = new Uint8Array(0);
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new BlockHeader().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new BlockHeader().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new BlockHeader().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(BlockHeader, a, b);
  }
};
BlockHeader.runtime = proto3;
BlockHeader.typeName = "utxorpc.cardano.v1.BlockHeader";
BlockHeader.fields = proto3.util.newFieldList(() => [
  {
    no: 1,
    name: "slot",
    kind: "scalar",
    T: 4
    /* ScalarType.UINT64 */
  },
  {
    no: 2,
    name: "hash",
    kind: "scalar",
    T: 12
    /* ScalarType.BYTES */
  }
]);
var BlockBody = class extends Message {
  constructor(data) {
    super();
    this.tx = [];
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new BlockBody().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new BlockBody().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new BlockBody().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(BlockBody, a, b);
  }
};
BlockBody.runtime = proto3;
BlockBody.typeName = "utxorpc.cardano.v1.BlockBody";
BlockBody.fields = proto3.util.newFieldList(() => [
  { no: 1, name: "tx", kind: "message", T: Tx, repeated: true }
]);
var Block = class extends Message {
  constructor(data) {
    super();
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new Block().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new Block().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new Block().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(Block, a, b);
  }
};
Block.runtime = proto3;
Block.typeName = "utxorpc.cardano.v1.Block";
Block.fields = proto3.util.newFieldList(() => [
  { no: 1, name: "header", kind: "message", T: BlockHeader },
  { no: 2, name: "body", kind: "message", T: BlockBody }
]);
var VKeyWitness = class extends Message {
  constructor(data) {
    super();
    this.vkey = new Uint8Array(0);
    this.signature = new Uint8Array(0);
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new VKeyWitness().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new VKeyWitness().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new VKeyWitness().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(VKeyWitness, a, b);
  }
};
VKeyWitness.runtime = proto3;
VKeyWitness.typeName = "utxorpc.cardano.v1.VKeyWitness";
VKeyWitness.fields = proto3.util.newFieldList(() => [
  {
    no: 1,
    name: "vkey",
    kind: "scalar",
    T: 12
    /* ScalarType.BYTES */
  },
  {
    no: 2,
    name: "signature",
    kind: "scalar",
    T: 12
    /* ScalarType.BYTES */
  }
]);
var NativeScript = class extends Message {
  constructor(data) {
    super();
    this.nativeScript = { case: void 0 };
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new NativeScript().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new NativeScript().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new NativeScript().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(NativeScript, a, b);
  }
};
NativeScript.runtime = proto3;
NativeScript.typeName = "utxorpc.cardano.v1.NativeScript";
NativeScript.fields = proto3.util.newFieldList(() => [
  { no: 1, name: "script_pubkey", kind: "scalar", T: 12, oneof: "native_script" },
  { no: 2, name: "script_all", kind: "message", T: NativeScriptList, oneof: "native_script" },
  { no: 3, name: "script_any", kind: "message", T: NativeScriptList, oneof: "native_script" },
  { no: 4, name: "script_n_of_k", kind: "message", T: ScriptNOfK, oneof: "native_script" },
  { no: 5, name: "invalid_before", kind: "scalar", T: 4, oneof: "native_script" },
  { no: 6, name: "invalid_hereafter", kind: "scalar", T: 4, oneof: "native_script" }
]);
var NativeScriptList = class extends Message {
  constructor(data) {
    super();
    this.items = [];
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new NativeScriptList().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new NativeScriptList().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new NativeScriptList().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(NativeScriptList, a, b);
  }
};
NativeScriptList.runtime = proto3;
NativeScriptList.typeName = "utxorpc.cardano.v1.NativeScriptList";
NativeScriptList.fields = proto3.util.newFieldList(() => [
  { no: 1, name: "items", kind: "message", T: NativeScript, repeated: true }
]);
var ScriptNOfK = class extends Message {
  constructor(data) {
    super();
    this.k = 0;
    this.scripts = [];
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new ScriptNOfK().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new ScriptNOfK().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new ScriptNOfK().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(ScriptNOfK, a, b);
  }
};
ScriptNOfK.runtime = proto3;
ScriptNOfK.typeName = "utxorpc.cardano.v1.ScriptNOfK";
ScriptNOfK.fields = proto3.util.newFieldList(() => [
  {
    no: 1,
    name: "k",
    kind: "scalar",
    T: 13
    /* ScalarType.UINT32 */
  },
  { no: 2, name: "scripts", kind: "message", T: NativeScript, repeated: true }
]);
var Constr = class extends Message {
  constructor(data) {
    super();
    this.tag = 0;
    this.anyConstructor = protoInt64.zero;
    this.fields = [];
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new Constr().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new Constr().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new Constr().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(Constr, a, b);
  }
};
Constr.runtime = proto3;
Constr.typeName = "utxorpc.cardano.v1.Constr";
Constr.fields = proto3.util.newFieldList(() => [
  {
    no: 1,
    name: "tag",
    kind: "scalar",
    T: 13
    /* ScalarType.UINT32 */
  },
  {
    no: 2,
    name: "any_constructor",
    kind: "scalar",
    T: 4
    /* ScalarType.UINT64 */
  },
  { no: 3, name: "fields", kind: "message", T: PlutusData, repeated: true }
]);
var BigInt2 = class extends Message {
  constructor(data) {
    super();
    this.bigInt = { case: void 0 };
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new BigInt2().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new BigInt2().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new BigInt2().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(BigInt2, a, b);
  }
};
BigInt2.runtime = proto3;
BigInt2.typeName = "utxorpc.cardano.v1.BigInt";
BigInt2.fields = proto3.util.newFieldList(() => [
  { no: 1, name: "int", kind: "scalar", T: 3, oneof: "big_int" },
  { no: 2, name: "big_u_int", kind: "scalar", T: 12, oneof: "big_int" },
  { no: 3, name: "big_n_int", kind: "scalar", T: 12, oneof: "big_int" }
]);
var PlutusDataPair = class extends Message {
  constructor(data) {
    super();
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new PlutusDataPair().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new PlutusDataPair().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new PlutusDataPair().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(PlutusDataPair, a, b);
  }
};
PlutusDataPair.runtime = proto3;
PlutusDataPair.typeName = "utxorpc.cardano.v1.PlutusDataPair";
PlutusDataPair.fields = proto3.util.newFieldList(() => [
  { no: 1, name: "key", kind: "message", T: PlutusData },
  { no: 2, name: "value", kind: "message", T: PlutusData }
]);
var PlutusData = class extends Message {
  constructor(data) {
    super();
    this.plutusData = { case: void 0 };
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new PlutusData().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new PlutusData().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new PlutusData().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(PlutusData, a, b);
  }
};
PlutusData.runtime = proto3;
PlutusData.typeName = "utxorpc.cardano.v1.PlutusData";
PlutusData.fields = proto3.util.newFieldList(() => [
  { no: 1, name: "constr", kind: "message", T: Constr, oneof: "plutus_data" },
  { no: 2, name: "map", kind: "message", T: PlutusDataMap, oneof: "plutus_data" },
  { no: 3, name: "big_int", kind: "message", T: BigInt2, oneof: "plutus_data" },
  { no: 4, name: "bounded_bytes", kind: "scalar", T: 12, oneof: "plutus_data" },
  { no: 5, name: "array", kind: "message", T: PlutusDataArray, oneof: "plutus_data" }
]);
var PlutusDataMap = class extends Message {
  constructor(data) {
    super();
    this.pairs = [];
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new PlutusDataMap().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new PlutusDataMap().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new PlutusDataMap().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(PlutusDataMap, a, b);
  }
};
PlutusDataMap.runtime = proto3;
PlutusDataMap.typeName = "utxorpc.cardano.v1.PlutusDataMap";
PlutusDataMap.fields = proto3.util.newFieldList(() => [
  { no: 1, name: "pairs", kind: "message", T: PlutusDataPair, repeated: true }
]);
var PlutusDataArray = class extends Message {
  constructor(data) {
    super();
    this.items = [];
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new PlutusDataArray().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new PlutusDataArray().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new PlutusDataArray().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(PlutusDataArray, a, b);
  }
};
PlutusDataArray.runtime = proto3;
PlutusDataArray.typeName = "utxorpc.cardano.v1.PlutusDataArray";
PlutusDataArray.fields = proto3.util.newFieldList(() => [
  { no: 1, name: "items", kind: "message", T: PlutusData, repeated: true }
]);
var Script = class extends Message {
  constructor(data) {
    super();
    this.script = { case: void 0 };
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new Script().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new Script().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new Script().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(Script, a, b);
  }
};
Script.runtime = proto3;
Script.typeName = "utxorpc.cardano.v1.Script";
Script.fields = proto3.util.newFieldList(() => [
  { no: 1, name: "native", kind: "message", T: NativeScript, oneof: "script" },
  { no: 2, name: "plutus_v1", kind: "scalar", T: 12, oneof: "script" },
  { no: 3, name: "plutus_v2", kind: "scalar", T: 12, oneof: "script" }
]);
var Metadatum = class extends Message {
  constructor(data) {
    super();
    this.metadatum = { case: void 0 };
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new Metadatum().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new Metadatum().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new Metadatum().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(Metadatum, a, b);
  }
};
Metadatum.runtime = proto3;
Metadatum.typeName = "utxorpc.cardano.v1.Metadatum";
Metadatum.fields = proto3.util.newFieldList(() => [
  { no: 1, name: "int", kind: "scalar", T: 3, oneof: "metadatum" },
  { no: 2, name: "bytes", kind: "scalar", T: 12, oneof: "metadatum" },
  { no: 3, name: "text", kind: "scalar", T: 9, oneof: "metadatum" },
  { no: 4, name: "array", kind: "message", T: MetadatumArray, oneof: "metadatum" },
  { no: 5, name: "map", kind: "message", T: MetadatumMap, oneof: "metadatum" }
]);
var MetadatumArray = class extends Message {
  constructor(data) {
    super();
    this.items = [];
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new MetadatumArray().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new MetadatumArray().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new MetadatumArray().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(MetadatumArray, a, b);
  }
};
MetadatumArray.runtime = proto3;
MetadatumArray.typeName = "utxorpc.cardano.v1.MetadatumArray";
MetadatumArray.fields = proto3.util.newFieldList(() => [
  { no: 1, name: "items", kind: "message", T: Metadatum, repeated: true }
]);
var MetadatumMap = class extends Message {
  constructor(data) {
    super();
    this.pairs = [];
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new MetadatumMap().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new MetadatumMap().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new MetadatumMap().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(MetadatumMap, a, b);
  }
};
MetadatumMap.runtime = proto3;
MetadatumMap.typeName = "utxorpc.cardano.v1.MetadatumMap";
MetadatumMap.fields = proto3.util.newFieldList(() => [
  { no: 1, name: "pairs", kind: "message", T: MetadatumPair, repeated: true }
]);
var MetadatumPair = class extends Message {
  constructor(data) {
    super();
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new MetadatumPair().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new MetadatumPair().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new MetadatumPair().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(MetadatumPair, a, b);
  }
};
MetadatumPair.runtime = proto3;
MetadatumPair.typeName = "utxorpc.cardano.v1.MetadatumPair";
MetadatumPair.fields = proto3.util.newFieldList(() => [
  { no: 1, name: "key", kind: "message", T: Metadatum },
  { no: 2, name: "value", kind: "message", T: Metadatum }
]);
var Metadata = class extends Message {
  constructor(data) {
    super();
    this.label = protoInt64.zero;
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new Metadata().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new Metadata().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new Metadata().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(Metadata, a, b);
  }
};
Metadata.runtime = proto3;
Metadata.typeName = "utxorpc.cardano.v1.Metadata";
Metadata.fields = proto3.util.newFieldList(() => [
  {
    no: 1,
    name: "label",
    kind: "scalar",
    T: 4
    /* ScalarType.UINT64 */
  },
  { no: 2, name: "value", kind: "message", T: Metadatum }
]);
var StakeCredential = class extends Message {
  constructor(data) {
    super();
    this.stakeCredential = { case: void 0 };
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new StakeCredential().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new StakeCredential().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new StakeCredential().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(StakeCredential, a, b);
  }
};
StakeCredential.runtime = proto3;
StakeCredential.typeName = "utxorpc.cardano.v1.StakeCredential";
StakeCredential.fields = proto3.util.newFieldList(() => [
  { no: 1, name: "addr_key_hash", kind: "scalar", T: 12, oneof: "stake_credential" },
  { no: 2, name: "script_hash", kind: "scalar", T: 12, oneof: "stake_credential" }
]);
var RationalNumber = class extends Message {
  constructor(data) {
    super();
    this.numerator = 0;
    this.denominator = 0;
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new RationalNumber().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new RationalNumber().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new RationalNumber().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(RationalNumber, a, b);
  }
};
RationalNumber.runtime = proto3;
RationalNumber.typeName = "utxorpc.cardano.v1.RationalNumber";
RationalNumber.fields = proto3.util.newFieldList(() => [
  {
    no: 1,
    name: "numerator",
    kind: "scalar",
    T: 5
    /* ScalarType.INT32 */
  },
  {
    no: 2,
    name: "denominator",
    kind: "scalar",
    T: 13
    /* ScalarType.UINT32 */
  }
]);
var Relay = class extends Message {
  constructor(data) {
    super();
    this.ipV4 = new Uint8Array(0);
    this.ipV6 = new Uint8Array(0);
    this.dnsName = "";
    this.port = 0;
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new Relay().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new Relay().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new Relay().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(Relay, a, b);
  }
};
Relay.runtime = proto3;
Relay.typeName = "utxorpc.cardano.v1.Relay";
Relay.fields = proto3.util.newFieldList(() => [
  {
    no: 1,
    name: "ip_v4",
    kind: "scalar",
    T: 12
    /* ScalarType.BYTES */
  },
  {
    no: 2,
    name: "ip_v6",
    kind: "scalar",
    T: 12
    /* ScalarType.BYTES */
  },
  {
    no: 3,
    name: "dns_name",
    kind: "scalar",
    T: 9
    /* ScalarType.STRING */
  },
  {
    no: 4,
    name: "port",
    kind: "scalar",
    T: 13
    /* ScalarType.UINT32 */
  }
]);
var PoolMetadata = class extends Message {
  constructor(data) {
    super();
    this.url = "";
    this.hash = new Uint8Array(0);
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new PoolMetadata().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new PoolMetadata().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new PoolMetadata().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(PoolMetadata, a, b);
  }
};
PoolMetadata.runtime = proto3;
PoolMetadata.typeName = "utxorpc.cardano.v1.PoolMetadata";
PoolMetadata.fields = proto3.util.newFieldList(() => [
  {
    no: 1,
    name: "url",
    kind: "scalar",
    T: 9
    /* ScalarType.STRING */
  },
  {
    no: 2,
    name: "hash",
    kind: "scalar",
    T: 12
    /* ScalarType.BYTES */
  }
]);
var Certificate = class extends Message {
  constructor(data) {
    super();
    this.certificate = { case: void 0 };
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new Certificate().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new Certificate().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new Certificate().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(Certificate, a, b);
  }
};
Certificate.runtime = proto3;
Certificate.typeName = "utxorpc.cardano.v1.Certificate";
Certificate.fields = proto3.util.newFieldList(() => [
  { no: 1, name: "stake_registration", kind: "message", T: StakeCredential, oneof: "certificate" },
  { no: 2, name: "stake_deregistration", kind: "message", T: StakeCredential, oneof: "certificate" },
  { no: 3, name: "stake_delegation", kind: "message", T: StakeDelegationCert, oneof: "certificate" },
  { no: 4, name: "pool_registration", kind: "message", T: PoolRegistrationCert, oneof: "certificate" },
  { no: 5, name: "pool_retirement", kind: "message", T: PoolRetirementCert, oneof: "certificate" },
  { no: 6, name: "genesis_key_delegation", kind: "message", T: GenesisKeyDelegationCert, oneof: "certificate" },
  { no: 7, name: "mir_cert", kind: "message", T: MirCert, oneof: "certificate" }
]);
var StakeDelegationCert = class extends Message {
  constructor(data) {
    super();
    this.poolKeyhash = new Uint8Array(0);
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new StakeDelegationCert().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new StakeDelegationCert().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new StakeDelegationCert().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(StakeDelegationCert, a, b);
  }
};
StakeDelegationCert.runtime = proto3;
StakeDelegationCert.typeName = "utxorpc.cardano.v1.StakeDelegationCert";
StakeDelegationCert.fields = proto3.util.newFieldList(() => [
  { no: 1, name: "stake_credential", kind: "message", T: StakeCredential },
  {
    no: 2,
    name: "pool_keyhash",
    kind: "scalar",
    T: 12
    /* ScalarType.BYTES */
  }
]);
var PoolRegistrationCert = class extends Message {
  constructor(data) {
    super();
    this.operator = new Uint8Array(0);
    this.vrfKeyhash = new Uint8Array(0);
    this.pledge = protoInt64.zero;
    this.cost = protoInt64.zero;
    this.rewardAccount = new Uint8Array(0);
    this.poolOwners = [];
    this.relays = [];
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new PoolRegistrationCert().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new PoolRegistrationCert().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new PoolRegistrationCert().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(PoolRegistrationCert, a, b);
  }
};
PoolRegistrationCert.runtime = proto3;
PoolRegistrationCert.typeName = "utxorpc.cardano.v1.PoolRegistrationCert";
PoolRegistrationCert.fields = proto3.util.newFieldList(() => [
  {
    no: 1,
    name: "operator",
    kind: "scalar",
    T: 12
    /* ScalarType.BYTES */
  },
  {
    no: 2,
    name: "vrf_keyhash",
    kind: "scalar",
    T: 12
    /* ScalarType.BYTES */
  },
  {
    no: 3,
    name: "pledge",
    kind: "scalar",
    T: 4
    /* ScalarType.UINT64 */
  },
  {
    no: 4,
    name: "cost",
    kind: "scalar",
    T: 4
    /* ScalarType.UINT64 */
  },
  { no: 5, name: "margin", kind: "message", T: RationalNumber },
  {
    no: 6,
    name: "reward_account",
    kind: "scalar",
    T: 12
    /* ScalarType.BYTES */
  },
  { no: 7, name: "pool_owners", kind: "scalar", T: 12, repeated: true },
  { no: 8, name: "relays", kind: "message", T: Relay, repeated: true },
  { no: 9, name: "pool_metadata", kind: "message", T: PoolMetadata }
]);
var PoolRetirementCert = class extends Message {
  constructor(data) {
    super();
    this.poolKeyhash = new Uint8Array(0);
    this.epoch = protoInt64.zero;
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new PoolRetirementCert().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new PoolRetirementCert().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new PoolRetirementCert().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(PoolRetirementCert, a, b);
  }
};
PoolRetirementCert.runtime = proto3;
PoolRetirementCert.typeName = "utxorpc.cardano.v1.PoolRetirementCert";
PoolRetirementCert.fields = proto3.util.newFieldList(() => [
  {
    no: 1,
    name: "pool_keyhash",
    kind: "scalar",
    T: 12
    /* ScalarType.BYTES */
  },
  {
    no: 2,
    name: "epoch",
    kind: "scalar",
    T: 4
    /* ScalarType.UINT64 */
  }
]);
var GenesisKeyDelegationCert = class extends Message {
  constructor(data) {
    super();
    this.genesisHash = new Uint8Array(0);
    this.genesisDelegateHash = new Uint8Array(0);
    this.vrfKeyhash = new Uint8Array(0);
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new GenesisKeyDelegationCert().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new GenesisKeyDelegationCert().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new GenesisKeyDelegationCert().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(GenesisKeyDelegationCert, a, b);
  }
};
GenesisKeyDelegationCert.runtime = proto3;
GenesisKeyDelegationCert.typeName = "utxorpc.cardano.v1.GenesisKeyDelegationCert";
GenesisKeyDelegationCert.fields = proto3.util.newFieldList(() => [
  {
    no: 1,
    name: "genesis_hash",
    kind: "scalar",
    T: 12
    /* ScalarType.BYTES */
  },
  {
    no: 2,
    name: "genesis_delegate_hash",
    kind: "scalar",
    T: 12
    /* ScalarType.BYTES */
  },
  {
    no: 3,
    name: "vrf_keyhash",
    kind: "scalar",
    T: 12
    /* ScalarType.BYTES */
  }
]);
var MirTarget = class extends Message {
  constructor(data) {
    super();
    this.deltaCoin = protoInt64.zero;
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new MirTarget().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new MirTarget().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new MirTarget().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(MirTarget, a, b);
  }
};
MirTarget.runtime = proto3;
MirTarget.typeName = "utxorpc.cardano.v1.MirTarget";
MirTarget.fields = proto3.util.newFieldList(() => [
  { no: 1, name: "stake_credential", kind: "message", T: StakeCredential },
  {
    no: 2,
    name: "delta_coin",
    kind: "scalar",
    T: 3
    /* ScalarType.INT64 */
  }
]);
var MirCert = class extends Message {
  constructor(data) {
    super();
    this.from = MirSource.UNSPECIFIED;
    this.to = [];
    this.otherPot = protoInt64.zero;
    proto3.util.initPartial(data, this);
  }
  static fromBinary(bytes, options) {
    return new MirCert().fromBinary(bytes, options);
  }
  static fromJson(jsonValue, options) {
    return new MirCert().fromJson(jsonValue, options);
  }
  static fromJsonString(jsonString, options) {
    return new MirCert().fromJsonString(jsonString, options);
  }
  static equals(a, b) {
    return proto3.util.equals(MirCert, a, b);
  }
};
MirCert.runtime = proto3;
MirCert.typeName = "utxorpc.cardano.v1.MirCert";
MirCert.fields = proto3.util.newFieldList(() => [
  { no: 1, name: "from", kind: "enum", T: proto3.getEnumType(MirSource) },
  { no: 2, name: "to", kind: "message", T: MirTarget, repeated: true },
  {
    no: 3,
    name: "other_pot",
    kind: "scalar",
    T: 4
    /* ScalarType.UINT64 */
  }
]);

// src/lib/cml.ts
import * as C from "./lib/cardano_multiplatform_lib/cardano_multiplatform_lib.generated.js";
async function unsafeInstantiate(module, url) {
  try {
    await module.instantiate({
      // Exception for Deno fresh framework
      url
    });
  } catch (_e) {
  }
}
await Promise.all([
  unsafeInstantiate(
    C,
    `./cardano_multiplatform_lib/cardano_multiplatform_lib_bg.wasm`
  )
]);

// https://deno.land/x/base64@v0.2.1/base.ts
function getLengths(b64) {
  const len = b64.length;
  let validLen = b64.indexOf("=");
  if (validLen === -1) {
    validLen = len;
  }
  const placeHoldersLen = validLen === len ? 0 : 4 - validLen % 4;
  return [validLen, placeHoldersLen];
}
function init(lookup3, revLookup3, urlsafe = false) {
  function _byteLength(validLen, placeHoldersLen) {
    return Math.floor((validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen);
  }
  function tripletToBase64(num) {
    return lookup3[num >> 18 & 63] + lookup3[num >> 12 & 63] + lookup3[num >> 6 & 63] + lookup3[num & 63];
  }
  function encodeChunk(buf, start, end) {
    const out = new Array((end - start) / 3);
    for (let i = start, curTriplet = 0; i < end; i += 3) {
      out[curTriplet++] = tripletToBase64(
        (buf[i] << 16) + (buf[i + 1] << 8) + buf[i + 2]
      );
    }
    return out.join("");
  }
  return {
    // base64 is 4/3 + up to two characters of the original data
    byteLength(b64) {
      return _byteLength.apply(null, getLengths(b64));
    },
    toUint8Array(b64) {
      const [validLen, placeHoldersLen] = getLengths(b64);
      const buf = new Uint8Array(_byteLength(validLen, placeHoldersLen));
      const len = placeHoldersLen ? validLen - 4 : validLen;
      let tmp;
      let curByte = 0;
      let i;
      for (i = 0; i < len; i += 4) {
        tmp = revLookup3[b64.charCodeAt(i)] << 18 | revLookup3[b64.charCodeAt(i + 1)] << 12 | revLookup3[b64.charCodeAt(i + 2)] << 6 | revLookup3[b64.charCodeAt(i + 3)];
        buf[curByte++] = tmp >> 16 & 255;
        buf[curByte++] = tmp >> 8 & 255;
        buf[curByte++] = tmp & 255;
      }
      if (placeHoldersLen === 2) {
        tmp = revLookup3[b64.charCodeAt(i)] << 2 | revLookup3[b64.charCodeAt(i + 1)] >> 4;
        buf[curByte++] = tmp & 255;
      } else if (placeHoldersLen === 1) {
        tmp = revLookup3[b64.charCodeAt(i)] << 10 | revLookup3[b64.charCodeAt(i + 1)] << 4 | revLookup3[b64.charCodeAt(i + 2)] >> 2;
        buf[curByte++] = tmp >> 8 & 255;
        buf[curByte++] = tmp & 255;
      }
      return buf;
    },
    fromUint8Array(buf) {
      const maxChunkLength = 16383;
      const len = buf.length;
      const extraBytes = len % 3;
      const len2 = len - extraBytes;
      const parts = new Array(
        Math.ceil(len2 / maxChunkLength) + (extraBytes ? 1 : 0)
      );
      let curChunk = 0;
      let chunkEnd;
      for (let i = 0; i < len2; i += maxChunkLength) {
        chunkEnd = i + maxChunkLength;
        parts[curChunk++] = encodeChunk(
          buf,
          i,
          chunkEnd > len2 ? len2 : chunkEnd
        );
      }
      let tmp;
      if (extraBytes === 1) {
        tmp = buf[len2];
        parts[curChunk] = lookup3[tmp >> 2] + lookup3[tmp << 4 & 63];
        if (!urlsafe)
          parts[curChunk] += "==";
      } else if (extraBytes === 2) {
        tmp = buf[len2] << 8 | buf[len2 + 1] & 255;
        parts[curChunk] = lookup3[tmp >> 10] + lookup3[tmp >> 4 & 63] + lookup3[tmp << 2 & 63];
        if (!urlsafe)
          parts[curChunk] += "=";
      }
      return parts.join("");
    }
  };
}

// https://deno.land/x/base64@v0.2.1/mod.ts
var lookup = [];
var revLookup = [];
var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
for (let i = 0, l = code.length; i < l; ++i) {
  lookup[i] = code[i];
  revLookup[code.charCodeAt(i)] = i;
}
revLookup["-".charCodeAt(0)] = 62;
revLookup["_".charCodeAt(0)] = 63;
var { byteLength, toUint8Array, fromUint8Array } = init(
  lookup,
  revLookup
);

// https://deno.land/x/base64@v0.2.1/base64url.ts
var lookup2 = [];
var revLookup2 = [];
var code2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
for (let i = 0, l = code2.length; i < l; ++i) {
  lookup2[i] = code2[i];
  revLookup2[code2.charCodeAt(i)] = i;
}
var { byteLength: byteLength2, toUint8Array: toUint8Array2, fromUint8Array: fromUint8Array2 } = init(
  lookup2,
  revLookup2,
  true
);

// https://denopkg.com/chiefbiiko/std-encoding@master/mod.ts
var decoder = new TextDecoder();
var encoder = new TextEncoder();
function toHexString(buf) {
  return buf.reduce(
    (hex, byte) => `${hex}${byte < 16 ? "0" : ""}${byte.toString(16)}`,
    ""
  );
}
function fromHexString(hex) {
  const len = hex.length;
  if (len % 2 || !/^[0-9a-fA-F]+$/.test(hex)) {
    throw new TypeError("Invalid hex string.");
  }
  hex = hex.toLowerCase();
  const buf = new Uint8Array(Math.floor(len / 2));
  const end = len / 2;
  for (let i = 0; i < end; ++i) {
    buf[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return buf;
}
function decode(buf, encoding = "utf8") {
  if (/^utf-?8$/i.test(encoding)) {
    return decoder.decode(buf);
  } else if (/^base64$/i.test(encoding)) {
    return fromUint8Array(buf);
  } else if (/^base64url$/i.test(encoding)) {
    return fromUint8Array2(buf);
  } else if (/^hex(?:adecimal)?$/i.test(encoding)) {
    return toHexString(buf);
  } else {
    throw new TypeError("Unsupported string encoding.");
  }
}
function encode(str, encoding = "utf8") {
  if (/^utf-?8$/i.test(encoding)) {
    return encoder.encode(str);
  } else if (/^base64(?:url)?$/i.test(encoding)) {
    return toUint8Array(str);
  } else if (/^hex(?:adecimal)?$/i.test(encoding)) {
    return fromHexString(str);
  } else {
    throw new TypeError("Unsupported string encoding.");
  }
}

// https://deno.land/x/blake2b@v0.1.0/loadWasm.ts
function loadWasm() {
  const mod = {};
  mod.buffer = toUint8Array(
    "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"
  );
  mod.exports = new WebAssembly.Instance(
    new WebAssembly.Module(mod.buffer)
  ).exports;
  mod.memory = new Uint8Array(mod.exports.memory.buffer);
  mod.realloc = (size) => {
    const pages = Math.ceil(Math.abs(size - mod.memory.length) / 65536);
    mod.exports.memory.grow(pages);
    mod.memory = new Uint8Array(mod.exports.memory.buffer);
  };
  return mod;
}

// https://deno.land/x/blake2b@v0.1.0/mod.ts
function assert2(sth) {
  if (!sth) {
    throw new Error("sth is falsy");
  }
}
var BYTES_MIN = 1;
var BYTES_MAX = 64;
var INPUTBYTES_MAX = 2n ** 128n - 1n;
var KEYBYTES_MAX = 64;
var SALTBYTES = 16;
var PERSONALBYTES = 16;
var _Blake2b = class {
  /**
   * Creates a new Blake2b instance computing the BLAKE2b checksum with a custom
   * length. Providing a key turns the hash into a MAC. The key must be between
   *  zero and 64 bytes long. The digest size can be a value between 1 and 64 but
   * it is highly recommended to use values equal or greater than:
   *   - 32 if BLAKE2b is used as a hash function (key is zero bytes long).
   *   - 16 if BLAKE2b is used as a MAC function (key is at least 16 bytes long).
   * @constructor
   * @param {number} bytes - Digest length. Must be inbetween
   *   Blake2b.BYTES_MIN and Blake2b.BYTES_MAX.
   * @param {Uint8Array} [key] - Key length must be inbetween
   *  Blake2b.KEYBYTES_MIN and Blake2b.KEYBYTES_MAX
   * @param {Uint8Array} [salt] - Must be Blake2b.SALTBYTES long.
   * @param {Uint8Array} [personal] - Must be Blake2b.PERSONALBYTES long.
   */
  constructor(bytes, key, salt, personal, inputEncoding) {
    assert2(bytes >= BYTES_MIN);
    assert2(bytes <= BYTES_MAX);
    if (key) {
      if (typeof key === "string") {
        key = encode(key, inputEncoding);
      }
      assert2(key.byteLength <= KEYBYTES_MAX);
    }
    if (salt) {
      if (typeof salt === "string") {
        salt = encode(salt, inputEncoding);
      }
      assert2(salt.byteLength === SALTBYTES);
    }
    if (personal) {
      if (typeof personal === "string") {
        personal = encode(personal, inputEncoding);
      }
      assert2(personal.byteLength === PERSONALBYTES);
    }
    if (!_Blake2b.freeList.length) {
      _Blake2b.freeList.push(_Blake2b.head);
      _Blake2b.head += 216;
    }
    this.bytes = bytes;
    this.finalized = false;
    this.pointer = _Blake2b.freeList.pop() ?? 0;
    _Blake2b.wasm.memory.fill(0, 0, 64);
    _Blake2b.wasm.memory[0] = this.bytes;
    _Blake2b.wasm.memory[1] = key ? key.length : 0;
    _Blake2b.wasm.memory[2] = 1;
    _Blake2b.wasm.memory[3] = 1;
    if (salt) {
      _Blake2b.wasm.memory.set(salt, 32);
    }
    if (personal) {
      _Blake2b.wasm.memory.set(personal, 48);
    }
    if (this.pointer + 216 > _Blake2b.wasm.memory.byteLength) {
      _Blake2b.wasm.realloc(this.pointer + 216);
    }
    _Blake2b.wasm.exports.blake2b_init(this.pointer, this.bytes);
    if (key) {
      this.update(key);
      _Blake2b.wasm.memory.fill(0, _Blake2b.head, _Blake2b.head + key.length);
      _Blake2b.wasm.memory[this.pointer + 200] = 128;
    }
  }
  /** Updates the hash with additional data. */
  update(input, inputEncoding) {
    if (typeof input === "string") {
      input = encode(input, inputEncoding);
    }
    if (_Blake2b.head + input.byteLength > _Blake2b.wasm.memory.byteLength) {
      _Blake2b.wasm.realloc(_Blake2b.head + input.byteLength);
    }
    _Blake2b.wasm.memory.set(input, _Blake2b.head);
    _Blake2b.wasm.exports.blake2b_update(
      this.pointer,
      _Blake2b.head,
      _Blake2b.head + input.byteLength
    );
    return this;
  }
  /** Obtains a digest of all fed-in data. */
  digest(outputEncoding) {
    assert2(!this.finalized);
    const out = new Uint8Array(this.bytes);
    _Blake2b.freeList.push(this.pointer);
    _Blake2b.wasm.exports.blake2b_final(this.pointer);
    this.finalized = true;
    for (let i = 0; i < this.bytes; i++) {
      out[i] = _Blake2b.wasm.memory[this.pointer + 128 + i];
    }
    return outputEncoding ? decode(out, outputEncoding) : out;
  }
};
var Blake2b = _Blake2b;
Blake2b.wasm = loadWasm();
Blake2b.freeList = [];
Blake2b.head = 64;
Blake2b.WASM = _Blake2b.wasm.buffer;
function blake2b(msg, inputEncoding, outputEncoding, bytes = BYTES_MAX, key, salt, personal) {
  return new Blake2b(bytes, key, salt, personal).update(msg, inputEncoding).digest(outputEncoding);
}

// src/lib/utils.ts
var import_npm_bech32 = __toESM(require_dist());
var BYRON_UNIX = 1506203091;
var BYRON_SLOT = 0;
var BYRON_SLOT_LEN = 20;
var SHELLEY_UNIX = 1596059091;
var SHELLEY_SLOT = 4492800;
var SHELLEY_SLOT_LEN = 1;
function compute_linear_timestamp(known_slot, known_time, slot_length, query_slot) {
  return known_time + (query_slot - known_slot) * slot_length;
}
function slotToTimestamp(slotNumber) {
  let unixTimestamp;
  if (slotNumber < SHELLEY_SLOT) {
    unixTimestamp = compute_linear_timestamp(
      BYRON_SLOT,
      BYRON_UNIX,
      BYRON_SLOT_LEN,
      slotNumber
    );
  } else {
    unixTimestamp = compute_linear_timestamp(
      SHELLEY_SLOT,
      SHELLEY_UNIX,
      SHELLEY_SLOT_LEN,
      slotNumber
    );
  }
  const date = new Date(unixTimestamp * 1e3);
  return date.toISOString();
}
function assetFingerprint(policy, name) {
  const hash = blake2b(
    new Uint8Array([...policy, ...name]),
    void 0,
    void 0,
    20
  );
  const words = import_npm_bech32.bech32.toWords(hash);
  return import_npm_bech32.bech32.encode("asset", words);
}

// src/reducers/crdt/balance_by_address.ts
function processTxOutput(txOuput, addressType, action) {
  const address = C.Address.from_bytes(txOuput.address);
  let key;
  switch (addressType) {
    case "payment":
      if (address.as_byron()) {
        key = address.as_byron()?.to_base58();
      } else if (address.to_bech32(void 0)) {
        key = address.to_bech32(void 0);
      } else {
        const addressHex = Array.from(
          txOuput.address,
          (byte) => byte.toString(16).padStart(2, "0")
        ).join("");
        throw new Error(`address "${addressHex}" could not be parsed!`);
      }
      break;
    case "stake":
      if (address.as_base()) {
        const network_id = address.network_id();
        const stake_cred = address.as_base()?.stake_cred();
        key = C.RewardAddress.new(network_id, stake_cred).to_address().to_bech32(void 0);
      } else {
        return null;
      }
      break;
    default:
      throw new Error(`address type "${addressType}" not implemented`);
  }
  let value;
  switch (action) {
    case "consume" /* Consume */:
      value = -txOuput.coin;
      break;
    case "produce" /* Produce */:
      value = txOuput.coin;
      break;
  }
  return { key, value };
}
function processBlock(blockJson, config, method) {
  const block = Block.fromJson(blockJson);
  const addressType = config.addressType;
  const prefix = config.prefix;
  const deltas = {};
  for (const tx of block.body?.tx ?? []) {
    for (const txOutput of tx.outputs) {
      let action;
      switch (method) {
        case "apply" /* Apply */:
          action = "produce" /* Produce */;
          break;
        case "undo" /* Undo */:
          action = "consume" /* Consume */;
          break;
      }
      const delta = processTxOutput(txOutput, addressType, action);
      if (delta) {
        if (delta.key in deltas) {
          deltas[delta.key] += delta.value;
        } else {
          deltas[delta.key] = delta.value;
        }
      }
    }
    for (const txInput of tx.inputs) {
      const txOutput = txInput.asOutput;
      if (txOutput) {
        let action;
        switch (method) {
          case "apply" /* Apply */:
            action = "consume" /* Consume */;
            break;
          case "undo" /* Undo */:
            action = "produce" /* Produce */;
            break;
        }
        const delta = processTxOutput(txOutput, addressType, action);
        if (delta) {
          if (delta.key in deltas) {
            deltas[delta.key] += delta.value;
          } else {
            deltas[delta.key] = delta.value;
          }
        }
      }
    }
  }
  const commands = [];
  for (const [key, value] of Object.entries(deltas)) {
    commands.push({
      command: "PNCounter",
      key: prefix + "." + key,
      value: value.toString()
    });
  }
  return commands;
}
function apply(blockJson, config) {
  return processBlock(blockJson, config, "apply" /* Apply */);
}
function undo(blockJson, config) {
  return processBlock(blockJson, config, "undo" /* Undo */);
}

// src/reducers/sql/address_state/address_state.ts
var address_state_exports = {};
__export(address_state_exports, {
  apply: () => apply2,
  undo: () => undo2
});

// https://deno.land/std@0.209.0/encoding/_util.ts
var encoder2 = new TextEncoder();
function getTypeName(value) {
  const type = typeof value;
  if (type !== "object") {
    return type;
  } else if (value === null) {
    return "null";
  } else {
    return value?.constructor?.name ?? "object";
  }
}
function validateBinaryLike(source) {
  if (typeof source === "string") {
    return encoder2.encode(source);
  } else if (source instanceof Uint8Array) {
    return source;
  } else if (source instanceof ArrayBuffer) {
    return new Uint8Array(source);
  }
  throw new TypeError(
    `The input must be a Uint8Array, a string, or an ArrayBuffer. Received a value of the type ${getTypeName(source)}.`
  );
}

// https://deno.land/std@0.209.0/encoding/hex.ts
var hexTable = new TextEncoder().encode("0123456789abcdef");
var textEncoder = new TextEncoder();
var textDecoder = new TextDecoder();
function encodeHex(src) {
  const u8 = validateBinaryLike(src);
  const dst = new Uint8Array(u8.length * 2);
  for (let i = 0; i < dst.length; i++) {
    const v = u8[i];
    dst[i * 2] = hexTable[v >> 4];
    dst[i * 2 + 1] = hexTable[v & 15];
  }
  return textDecoder.decode(dst);
}

// src/reducers/sql/address_state/address_state.ts
var AddressType = /* @__PURE__ */ ((AddressType3) => {
  AddressType3["Payment"] = "payment";
  AddressType3["Stake"] = "stake";
  return AddressType3;
})(AddressType || {});
function toAddressType(value) {
  return Object.values(AddressType).find((type) => type === value);
}
function processTxOutput2(txOutput, addressType, action, addressState, addresses) {
  const address = C.Address.from_bytes(txOutput.address);
  let bech322;
  let raw;
  let stake_address_id = null;
  switch (addressType) {
    case "payment":
      if (address.as_byron()) {
        bech322 = address.as_byron()?.to_base58();
      } else if (address.to_bech32(void 0)) {
        bech322 = address.to_bech32(void 0);
        if (address.as_base()) {
          const network_id = address.network_id();
          const stake_cred = address.as_base()?.stake_cred();
          const stake_address = C.RewardAddress.new(network_id, stake_cred).to_address();
          stake_address_id = stake_address.to_bech32(void 0);
        }
      } else {
        throw new Error(
          `address "${encodeHex(txOutput.address)}" could not be parsed!`
        );
      }
      raw = txOutput.address;
      break;
    case "stake":
      if (address.as_base()) {
        const network_id = address.network_id();
        const stake_cred = address.as_base()?.stake_cred();
        const stake_address = C.RewardAddress.new(network_id, stake_cred).to_address();
        bech322 = stake_address.to_bech32(void 0);
        raw = stake_address.to_bytes();
      } else {
        return;
      }
      break;
    default:
      throw new Error(`address type "${addressType}" not implemented!`);
  }
  addresses.add(bech322);
  let amount;
  let count;
  switch (action) {
    case "consume" /* Consume */:
      amount = -txOutput.coin;
      count = -1n;
      break;
    case "produce" /* Produce */:
      amount = txOutput.coin;
      count = 1n;
      break;
  }
  const existingState = addressState.get(bech322);
  if (existingState) {
    existingState.balance += amount;
    existingState.utxo_count += count;
    addressState.set(bech322, existingState);
  } else {
    addressState.set(bech322, {
      bech32: bech322,
      raw,
      stake_address_id,
      balance: amount,
      tx_count: 0n,
      tx_count_as_source: 0n,
      tx_count_as_dest: 0n,
      utxo_count: count
    });
  }
}
function processBlock2(blockJson, config, method) {
  const block = Block.fromJson(blockJson);
  const blockTime = slotToTimestamp(Number(block.header?.slot));
  const addressType = toAddressType(config.addressType);
  if (addressType === void 0) {
    throw new Error(`Invalid address type "${config.addressType}"`);
  }
  const addressState = /* @__PURE__ */ new Map();
  for (const tx of block.body?.tx ?? []) {
    const sourceAddresses = /* @__PURE__ */ new Set();
    const destAddresses = /* @__PURE__ */ new Set();
    for (const txOutput of tx.outputs) {
      const action = method === "apply" /* Apply */ ? "produce" /* Produce */ : "consume" /* Consume */;
      processTxOutput2(
        txOutput,
        addressType,
        action,
        addressState,
        destAddresses
      );
    }
    for (const txInput of tx.inputs) {
      const action = method === "apply" /* Apply */ ? "consume" /* Consume */ : "produce" /* Produce */;
      const txOutput = txInput.asOutput;
      if (txOutput) {
        processTxOutput2(
          txOutput,
          addressType,
          action,
          addressState,
          sourceAddresses
        );
      }
    }
    (/* @__PURE__ */ new Set([...sourceAddresses, ...destAddresses])).forEach((bech322) => {
      const state = addressState.get(bech322);
      if (state) {
        state.tx_count += method === "apply" /* Apply */ ? 1n : -1n;
        addressState.set(bech322, state);
      }
    });
    sourceAddresses.forEach((bech322) => {
      const state = addressState.get(bech322);
      if (state) {
        state.tx_count_as_source += method === "apply" /* Apply */ ? 1n : -1n;
        addressState.set(bech322, state);
      }
    });
    destAddresses.forEach((bech322) => {
      const state = addressState.get(bech322);
      if (state) {
        state.tx_count_as_dest += method === "apply" /* Apply */ ? 1n : -1n;
        addressState.set(bech322, state);
      }
    });
  }
  const values = Array.from(addressState.values());
  if (values.length > 0) {
    const addresses = values.map((value) => `'${value.bech32}'`).join(",");
    const addressesRaw = values.map(
      (value) => `decode('${encodeHex(value.raw)}', 'hex')`
    ).join(",");
    const stakeAddresses = values.map((value) => `'${value.stake_address_id}'`).join(",");
    const balances = values.map((value) => `${value.balance}`).join(",");
    const txCounts = values.map((value) => `${value.tx_count}`).join(",");
    const sourceCounts = values.map((value) => `${value.tx_count_as_source}`).join(",");
    const destCounts = values.map((value) => `${value.tx_count_as_dest}`).join(
      ","
    );
    const utxoCounts = values.map((value) => `${value.utxo_count}`).join(",");
    const table = addressType == "payment" /* Payment */ ? "address_state" : "stake_address_state";
    const inserted = `
      ${addressType == "payment" /* Payment */ ? `
      WITH stake_address AS (
        SELECT 
          address.bech32,
          stake_address_state.id AS stake_address_id
        FROM (
          SELECT unnest(ARRAY[${addresses}]) AS bech32,
                 unnest(ARRAY[${stakeAddresses}]) AS stake_bech32
        ) as address
        LEFT JOIN scrolls.stake_address_state 
        ON stake_address_state.bech32 = stake_bech32
      )
      ` : ``}
      INSERT INTO scrolls.${table} (
        bech32,
        raw,
        ${addressType == "payment" /* Payment */ ? `stake_address_id,` : ``}
        balance,
        utxo_count,
        tx_count,
        tx_count_as_source,
        tx_count_as_dest,
        first_tx_time,
        last_tx_time
      )
      SELECT 
        bech32,
        raw,
        ${addressType == "payment" /* Payment */ ? `stake_address_id,` : ``}
        balance,
        utxo_count,
        tx_count,
        tx_count_as_source,
        tx_count_as_dest,
        '${blockTime}'::timestamptz AS first_tx_time,
        '${blockTime}'::timestamptz AS last_tx_time
      FROM (
        SELECT  unnest(ARRAY[${addresses}]) AS bech32,
                unnest(ARRAY[${addressesRaw}]) AS raw,
                unnest(ARRAY[${balances}]) AS balance,
                unnest(ARRAY[${utxoCounts}]) AS utxo_count,
                unnest(ARRAY[${txCounts}]) AS tx_count,
                unnest(ARRAY[${sourceCounts}]) AS tx_count_as_source,
                unnest(ARRAY[${destCounts}]) AS tx_count_as_dest
      )
      ${addressType == "payment" /* Payment */ ? `
      JOIN stake_address using(bech32)
      ` : ``}
      ON CONFLICT (bech32) DO UPDATE
      SET balance = ${table}.balance + EXCLUDED.balance,
          utxo_count = ${table}.utxo_count + EXCLUDED.utxo_count,
          tx_count = ${table}.tx_count + EXCLUDED.tx_count,
          tx_count_as_source = ${table}.tx_count_as_source + EXCLUDED.tx_count_as_source,
          tx_count_as_dest = ${table}.tx_count_as_dest + EXCLUDED.tx_count_as_dest,
          last_tx_time = EXCLUDED.last_tx_time
    `;
    const deleted = `
      DELETE FROM scrolls.${table}
      WHERE bech32 IN (${addresses})
        AND tx_count = 0
    `;
    return [inserted, deleted];
  } else {
    return [];
  }
}
function apply2(blockJson, config) {
  return processBlock2(blockJson, config, "apply" /* Apply */);
}
function undo2(blockJson, config) {
  return processBlock2(blockJson, config, "undo" /* Undo */);
}

// src/reducers/sql/address_token_state/address_token_state.ts
var address_token_state_exports = {};
__export(address_token_state_exports, {
  apply: () => apply3,
  undo: () => undo3
});
var AddressType2 = /* @__PURE__ */ ((AddressType3) => {
  AddressType3["Payment"] = "payment";
  AddressType3["Stake"] = "stake";
  return AddressType3;
})(AddressType2 || {});
function toAddressType2(value) {
  return Object.values(AddressType2).find((type) => type === value);
}
function processTxOutput3(txOutput, addressType, action, addressTokenState) {
  const address = C.Address.from_bytes(txOutput.address);
  let bech322;
  switch (addressType) {
    case "payment" /* Payment */:
      if (address.as_byron()) {
        bech322 = address.as_byron()?.to_base58();
      } else if (address.to_bech32(void 0)) {
        bech322 = address.to_bech32(void 0);
      } else {
        throw new Error(
          `address "${encodeHex(txOutput.address)}" could not be parsed!`
        );
      }
      break;
    case "stake" /* Stake */:
      if (address.as_base()) {
        const network_id = address.network_id();
        const stake_cred = address.as_base()?.stake_cred();
        const stake_address = C.RewardAddress.new(network_id, stake_cred).to_address();
        bech322 = stake_address.to_bech32(void 0);
      } else {
        return;
      }
      break;
    default:
      throw new Error(`address type "${addressType}" not implemented!`);
  }
  let fingerprint;
  for (const multiasset of txOutput.assets ?? []) {
    for (const asset of multiasset.assets) {
      fingerprint = assetFingerprint(multiasset.policyId, asset.name);
      const balance = action === "produce" /* Produce */ ? asset.outputCoin : -asset.outputCoin;
      const existingState = addressTokenState.get(bech322 + fingerprint);
      if (existingState) {
        existingState.balance += balance;
        addressTokenState.set(bech322 + fingerprint, existingState);
      } else {
        addressTokenState.set(bech322 + fingerprint, {
          bech32: bech322,
          fingerprint,
          balance
        });
      }
    }
  }
}
function processBlock3(blockJson, config, method) {
  const block = Block.fromJson(blockJson);
  const blockTime = slotToTimestamp(Number(block.header?.slot));
  const addressType = toAddressType2(config.addressType);
  if (addressType === void 0) {
    throw new Error(`Invalid address type "${config.addressType}"`);
  }
  const addressTokenState = /* @__PURE__ */ new Map();
  for (const tx of block.body?.tx ?? []) {
    for (const txOutput of tx.outputs) {
      const action = method === "apply" /* Apply */ ? "produce" /* Produce */ : "consume" /* Consume */;
      processTxOutput3(txOutput, addressType, action, addressTokenState);
    }
    for (const txInput of tx.inputs) {
      const action = method === "apply" /* Apply */ ? "consume" /* Consume */ : "produce" /* Produce */;
      const txOutput = txInput.asOutput;
      if (txOutput) {
        processTxOutput3(txOutput, addressType, action, addressTokenState);
      }
    }
  }
  const values = Array.from(addressTokenState.values());
  if (values.length > 0) {
    const addresses = values.map((value) => `'${value.bech32}'`).join(",");
    const fingerprints = values.map((value) => `'${value.fingerprint}'`).join(
      ","
    );
    const balances = values.map((value) => `${value.balance}`).join(",");
    const prefix = addressType == "payment" /* Payment */ ? "address" : "stake_address";
    const inserted = `
      WITH 
      address AS (
        SELECT id, bech32 FROM scrolls.${prefix}_state WHERE bech32 IN (${addresses})
      ),
      token AS (
        SELECT id, fingerprint FROM scrolls.token_state WHERE fingerprint IN (${fingerprints})
      )
      INSERT INTO scrolls.${prefix}_token_state (
        ${prefix}_id,
        token_id,
        balance,
        first_tx_time,
        last_tx_time
      )
      SELECT  address.id as ${prefix}_id,
              token.id as token_id,
              addressToken.balance,
              '${blockTime}'::timestamptz AS first_tx_time,
              '${blockTime}'::timestamptz AS last_tx_time
      FROM (
        SELECT  unnest(ARRAY[${addresses}]) AS bech32,
                unnest(ARRAY[${fingerprints}]) AS fingerprint,
                unnest(ARRAY[${balances}]) AS balance
      ) as addressToken
      JOIN address ON address.bech32 = addressToken.bech32
      JOIN token ON token.fingerprint = addressToken.fingerprint
      ON CONFLICT (${prefix}_id, token_id) DO UPDATE
      SET balance = ${prefix}_token_state.balance + EXCLUDED.balance,
          last_tx_time = EXCLUDED.last_tx_time
      ;
    `;
    const deleted = `
      WITH 
      address AS (
        SELECT id, bech32 FROM scrolls.${prefix}_state WHERE bech32 IN (${addresses})
      ),
      token AS (
        SELECT id, fingerprint FROM scrolls.token_state WHERE fingerprint IN (${fingerprints})
      )
      DELETE FROM scrolls.${prefix}_token_state
      USING address, token
      WHERE ${prefix}_id = address.id
        AND token_id = token.id
        AND balance = 0;
    `;
    return [inserted, deleted];
  } else {
    return [];
  }
}
function apply3(blockJson, config) {
  return processBlock3(blockJson, config, "apply" /* Apply */);
}
function undo3(blockJson, config) {
  return processBlock3(blockJson, config, "undo" /* Undo */);
}

// src/reducers/sql/token_state/token_state.ts
var token_state_exports = {};
__export(token_state_exports, {
  apply: () => apply4,
  undo: () => undo4
});
function processMint(mint, method, tokenState) {
  for (const asset of mint.assets) {
    const fingerprint = assetFingerprint(mint.policyId, asset.name);
    const existingState = tokenState.get(fingerprint);
    if (existingState) {
      existingState.supply += method === "apply" /* Apply */ ? asset.mintCoin : -asset.mintCoin;
      tokenState.set(fingerprint, existingState);
    } else {
      tokenState.set(fingerprint, {
        fingerprint,
        policy: mint.policyId,
        name: asset.name,
        supply: asset.mintCoin,
        utxo_count: 0n,
        tx_count: 0n,
        transfer_count: 0n
      });
    }
  }
}
function processTxOutput4(txOutput, action, tokenState, addresses) {
  const address = C.Address.from_bytes(txOutput.address);
  let bech322;
  if (address.as_byron()) {
    bech322 = address.as_byron()?.to_base58();
  } else if (address.as_enterprise() || address.as_pointer()) {
    bech322 = address.to_bech32(void 0);
  } else if (address.as_base()) {
    const network_id = address.network_id();
    const stake_cred = address.as_base()?.stake_cred();
    if (stake_cred) {
      const stake_address = C.RewardAddress.new(network_id, stake_cred).to_address();
      bech322 = stake_address.to_bech32(void 0);
    } else {
      bech322 = address.to_bech32(void 0);
    }
  } else {
    throw new Error(
      `address "${encodeHex(txOutput.address)}" could not be parsed!`
    );
  }
  let fingerprint;
  for (const multiasset of txOutput.assets ?? []) {
    for (const asset of multiasset.assets) {
      fingerprint = assetFingerprint(multiasset.policyId, asset.name);
      const existingSet = addresses.get(fingerprint);
      if (existingSet) {
        existingSet.add(bech322);
        addresses.set(fingerprint, existingSet);
      } else {
        addresses.set(fingerprint, new Set(bech322));
      }
      const utxo_count = action === "produce" /* Produce */ ? 1n : -1n;
      const existingState = tokenState.get(fingerprint);
      if (existingState) {
        existingState.utxo_count += utxo_count;
        tokenState.set(fingerprint, existingState);
      } else {
        tokenState.set(fingerprint, {
          fingerprint,
          policy: multiasset.policyId,
          name: asset.name,
          supply: 0n,
          utxo_count,
          tx_count: 0n,
          transfer_count: 0n
        });
      }
    }
  }
}
function processBlock4(blockJson, config, method) {
  const block = Block.fromJson(blockJson);
  const tokenState = /* @__PURE__ */ new Map();
  for (const tx of block.body?.tx ?? []) {
    for (const mint of tx.mint ?? []) {
      processMint(mint, method, tokenState);
    }
    const sourceAddresses = /* @__PURE__ */ new Map();
    const destAddresses = /* @__PURE__ */ new Map();
    for (const txOutput of tx.outputs) {
      const action = method === "apply" /* Apply */ ? "produce" /* Produce */ : "consume" /* Consume */;
      processTxOutput4(txOutput, action, tokenState, destAddresses);
    }
    for (const txInput of tx.inputs) {
      const action = method === "apply" /* Apply */ ? "consume" /* Consume */ : "produce" /* Produce */;
      const txOutput = txInput.asOutput;
      if (txOutput) {
        processTxOutput4(txOutput, action, tokenState, sourceAddresses);
      }
    }
    const mergedFingerprints = /* @__PURE__ */ new Set([
      ...sourceAddresses.keys(),
      ...destAddresses.keys()
    ]);
    for (const fingerprint of mergedFingerprints) {
      const existingState = tokenState.get(fingerprint);
      if (existingState) {
        existingState.tx_count += "apply" /* Apply */ ? 1n : -1n;
        const areSetsEqual = (setA, setB) => setA.size === setB.size && [...setA].sort().every(
          (value, index) => value === [...setB].sort()[index]
        );
        const sourceSet = sourceAddresses.get(fingerprint);
        const destSet = destAddresses.get(fingerprint);
        if (sourceSet && destSet && !areSetsEqual(sourceSet, destSet)) {
          existingState.transfer_count += "apply" /* Apply */ ? 1n : -1n;
        }
        tokenState.set(fingerprint, existingState);
      }
    }
  }
  const keys = Array.from(tokenState.keys());
  const values = Array.from(tokenState.values());
  if (keys.length > 0) {
    const fingerprints = keys.map((key) => `'${key}'`).join(",");
    const policies = values.map(
      (value) => `decode('${encodeHex(value.policy)}', 'hex')`
    ).join(",");
    const names = values.map(
      (value) => `decode('${encodeHex(value.name)}', 'hex')`
    ).join(",");
    const supplies = values.map((value) => `${value.supply}`).join(",");
    const utxoCounts = values.map((value) => `${value.utxo_count}`).join(",");
    const txCounts = values.map((value) => `${value.tx_count}`).join(",");
    const transferCounts = values.map((value) => `${value.transfer_count}`).join(",");
    const inserted = `
      INSERT INTO scrolls.token_state (
        fingerprint,
        policy,
        name,
        supply,
        utxo_count,
        tx_count,
        transfer_count
      )
      SELECT unnest(ARRAY[${fingerprints}]) AS fingerprint,
              unnest(ARRAY[${policies}]) AS policy,
              unnest(ARRAY[${names}]) AS name,
              unnest(ARRAY[${supplies}]) AS supply,
              unnest(ARRAY[${utxoCounts}]) AS utxo_count,
              unnest(ARRAY[${txCounts}]) AS tx_count,
              unnest(ARRAY[${transferCounts}]) AS transfer_count
      ON CONFLICT (fingerprint) DO UPDATE
      SET supply = token_state.supply + EXCLUDED.supply,
          utxo_count = token_state.utxo_count + EXCLUDED.utxo_count,
          tx_count = token_state.tx_count + EXCLUDED.tx_count,
          transfer_count = token_state.transfer_count + EXCLUDED.transfer_count
    `;
    const deleted = `
      DELETE FROM scrolls.token_state
      WHERE fingerprint IN (${fingerprints})
        AND tx_count = 0
    `;
    return [inserted, deleted];
  } else {
    return [];
  }
}
function apply4(blockJson, config) {
  return processBlock4(blockJson, config, "apply" /* Apply */);
}
function undo4(blockJson, config) {
  return processBlock4(blockJson, config, "undo" /* Undo */);
}

// src/mod.ts
var _CRDT = class {
  static apply(blockJson, reducers) {
    return reducers.flatMap(({ name, config }) => {
      const module = _CRDT.modules[name];
      if (module) {
        return module.apply(blockJson, config);
      }
      throw new Error(`CRDT module with name ${name} does not exist.`);
    });
  }
  static undo(blockJson, reducers) {
    return reducers.flatMap(({ name, config }) => {
      const module = _CRDT.modules[name];
      if (module) {
        return module.undo(blockJson, config);
      }
      throw new Error(`CRDT module with name ${name} does not exist.`);
    });
  }
};
var CRDT = _CRDT;
CRDT.modules = {
  "BalanceByAddress": balance_by_address_exports
};
var _SQL = class {
  static apply(blockJson, reducers) {
    return reducers.flatMap(({ name, config }) => {
      const module = _SQL.modules[name];
      if (module) {
        return module.apply(blockJson, config);
      }
      throw new Error(`SQL module with name ${name} does not exist.`);
    });
  }
  static undo(blockJson, reducers) {
    return reducers.flatMap(({ name, config }) => {
      const module = _SQL.modules[name];
      if (module) {
        return module.undo(blockJson, config);
      }
      throw new Error(`SQL module with name ${name} does not exist.`);
    });
  }
};
var SQL = _SQL;
SQL.modules = {
  "AddressState": address_state_exports,
  "AddressTokenState": address_token_state_exports,
  "TokenState": token_state_exports
};
export {
  CRDT,
  SQL
};
