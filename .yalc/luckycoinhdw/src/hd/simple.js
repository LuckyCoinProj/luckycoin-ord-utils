"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const sha256_1 = require("@noble/hashes/sha256");
const utils_1 = require("@noble/hashes/utils");
const tinysecp = __importStar(require("bells-secp256k1"));
const luckycoinjs_lib_1 = require("luckycoinjs-lib");
const luckycoinpair_1 = __importDefault(require("luckycoinpair"));
const util_1 = require("../utils/util");
const base_1 = require("./base");
const common_1 = require("./common");
const types_1 = require("./types");
const ECPair = (0, luckycoinpair_1.default)(tinysecp);
function tapTweakHash(pubKey, h) {
  return luckycoinjs_lib_1.crypto.taggedHash(
    "TapTweak",
    Buffer.concat(h ? [pubKey, h] : [pubKey])
  );
}
function tweakSigner(signer, opts) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let privateKey = signer.privateKey;
  if (!privateKey) {
    throw new Error("Private key is required for tweaking signer!");
  }
  if (signer.publicKey[0] === 3) {
    privateKey = tinysecp.privateNegate(privateKey);
  }
  const tweakedPrivateKey = tinysecp.privateAdd(
    privateKey,
    tapTweakHash((0, util_1.toXOnly)(signer.publicKey), opts.tweakHash)
  );
  if (!tweakedPrivateKey) {
    throw new Error("Invalid tweaked private key!");
  }
  return ECPair.fromPrivateKey(Buffer.from(tweakedPrivateKey));
}
class HDSimpleKey extends base_1.BaseWallet {
  constructor(privateKey) {
    super();
    this.privateKey = common_1.ZERO_PRIVKEY;
    this.publicKey = common_1.ZERO_KEY;
    this.privateKey = privateKey;
  }
  initPair() {
    if (!this.privateKey)
      throw new Error("Simple Keyring: Invalid privateKey provided");
    if (!this.pair) {
      this.pair = ECPair.fromPrivateKey(Buffer.from(this.privateKey));
      this.publicKey = this.pair.publicKey;
    }
  }
  signTypedData(address, typedData) {
    this.initPair();
    return this.signMessage(address, JSON.stringify(typedData));
  }
  verifyMessage(_address, text, sig) {
    this.initPair();
    return this.pair.verify(
      Buffer.from((0, utils_1.hexToBytes)(text)),
      Buffer.from((0, utils_1.hexToBytes)(sig))
    );
  }
  getAccounts() {
    this.initPair();
    return [this.getAddress(this.publicKey)];
  }
  serialize() {
    this.initPair();
    const wif = this.pair?.toWIF();
    if (!wif) throw new Error("Failed to export wif for simple wallet");
    return {
      privateKey: wif,
      addressType: this.addressType,
    };
  }
  deserialize(state) {
    const wallet = HDSimpleKey.deserialize(state);
    this.privateKey = wallet.privateKey;
    this.pair = wallet.pair;
    this.addressType = wallet.addressType;
    return this;
  }
  static deserialize(state) {
    let pair;
    if (state.isHex) {
      pair = ECPair.fromPrivateKey(Buffer.from(state.privateKey, "hex"));
    } else {
      pair = ECPair.fromWIF(state.privateKey);
    }
    const wallet = new this(pair.privateKey);
    wallet.addressType = state.addressType;
    wallet.initPair();
    return wallet;
  }
  exportAccount(_address, _options) {
    this.initPair();
    return this.pair.toWIF();
  }
  exportPublicKey(_address) {
    this.initPair();
    return (0, utils_1.bytesToHex)(this.publicKey);
  }
  signPsbt(psbt, inputs) {
    this.initPair();
    inputs.forEach((input) => {
      const account = this.pair;
      if (
        (this.addressType === types_1.AddressType.P2TR ||
          this.addressType === types_1.AddressType.M44_P2TR) &&
        !input.disableTweakSigner
      ) {
        const signer = tweakSigner(account, {
          network: luckycoinjs_lib_1.networks.luckycoin,
        });
        psbt.signInput(input.index, signer, input.sighashTypes);
      } else {
        const signer = account;
        psbt.signInput(input.index, signer, input.sighashTypes);
      }
    });
    psbt.finalizeAllInputs();
  }
  signAllInputsInPsbt(psbt, accountAddress, disableTweakSigner) {
    this.initPair();
    if (this.pair === undefined)
      throw new Error("Cannot sign all inputs since pair is undefined");
    if (accountAddress !== this.getAddress(this.publicKey))
      throw new Error(
        "Provided account address does not match the wallet's address"
      );
    psbt.data.inputs.forEach((input, idx) => {
      if (
        (this.addressType === types_1.AddressType.P2TR ||
          this.addressType === types_1.AddressType.M44_P2TR) &&
        !disableTweakSigner
      ) {
        const signer = tweakSigner(this.pair, {
          network: luckycoinjs_lib_1.networks.luckycoin,
        });
        psbt.signInput(
          idx,
          signer,
          input.sighashType !== undefined ? [input.sighashType] : undefined
        );
      } else {
        psbt.signInput(
          idx,
          this.pair,
          input.sighashType !== undefined ? [input.sighashType] : undefined
        );
      }
    });
    return {
      signatures: psbt.data.inputs.map((i) => {
        if (
          i.partialSig &&
          i.partialSig[0] &&
          i.partialSig[0].signature.length
        ) {
          return i.partialSig[0].signature.toString("hex");
        }
      }),
    };
  }
  signInputsWithoutFinalizing(psbt, inputs) {
    this.initPair();
    if (this.pair === undefined)
      throw new Error("Cannot sign inputs since pair is undefined");
    inputs.forEach((input) => {
      if (
        (this.addressType === types_1.AddressType.P2TR ||
          this.addressType === types_1.AddressType.M44_P2TR) &&
        !input.disableTweakSigner
      ) {
        const signer = tweakSigner(this.pair, {
          network: luckycoinjs_lib_1.networks.luckycoin,
        });
        psbt.signInput(input.index, signer, input.sighashTypes);
      } else {
        const signer = this.pair;
        psbt.signInput(input.index, signer, input.sighashTypes);
      }
    });
    return psbt.data.inputs.map((f, i) => ({
      inputIndex: i,
      partialSig: f.partialSig?.flatMap((p) => p) ?? [],
    }));
  }
  signMessage(_address, message) {
    this.initPair();
    const encoded = (0, sha256_1.sha256)(message);
    return this.pair.sign(Buffer.from(encoded)).toString("base64");
  }
  signPersonalMessage(address, message) {
    return this.signMessage(address, message);
  }
}
exports.default = HDSimpleKey;
