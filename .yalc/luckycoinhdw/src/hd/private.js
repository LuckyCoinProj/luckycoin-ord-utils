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
const browser_hdkey_1 = __importDefault(require("browser-hdkey"));
const luckycoinjs_lib_1 = require("luckycoinjs-lib");
const luckycoinpair_1 = __importDefault(require("luckycoinpair"));
const nintondo_bip39_1 = require("nintondo-bip39");
const util_1 = require("../utils/util");
const base_1 = require("./base");
const common_1 = require("./common");
const types_1 = require("./types");
const ECPair = (0, luckycoinpair_1.default)(tinysecp);
const DEFAULT_HD_PATH = "m/44'/0'/0'/0";
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
class HDPrivateKey extends base_1.BaseWallet {
  constructor(options) {
    super();
    this.childIndex = 0;
    this.privateKey = common_1.ZERO_PRIVKEY;
    this.publicKey = common_1.ZERO_KEY;
    this.accounts = [];
    this.hdPath = DEFAULT_HD_PATH;
    if (options) this.fromOptions(options);
  }
  changeHdPath(hdPath) {
    this.hdPath = hdPath;
    this.root = this.hdWallet?.derive(this.hdPath);
    this.accounts = [];
  }
  signTypedData(address, typedData) {
    return this.signMessage(address, JSON.stringify(typedData));
  }
  exportPublicKey(address) {
    const account = this.findAccount(address);
    return account.publicKey.toString("hex");
  }
  verifyMessage(address, text, sig) {
    const account = this.findAccount(address);
    const hash = (0, sha256_1.sha256)(text);
    return account.verify(Buffer.from(hash), Buffer.from(sig, "base64"));
  }
  getAccounts() {
    const accounts = this.accounts.map((w) => {
      return this.getAddress(w.publicKey);
    });
    if (this.hideRoot) return accounts;
    return [this.getAddress(this.publicKey), ...accounts];
  }
  addAccounts(number = 1) {
    let count = number;
    let currentIdx = this.accounts.length;
    const newAddresses = [];
    while (count) {
      const wallet = this._addressFromIndex(currentIdx);
      newAddresses.push(this.getAddress(wallet.publicKey));
      currentIdx++;
      count--;
    }
    return newAddresses;
  }
  findAccount(account) {
    if (!this.hideRoot) {
      if (this.getAddress(this.publicKey) === account) {
        return ECPair.fromPrivateKey(this.privateKey);
      }
    }
    const foundAccount = this.accounts.find(
      (f) => this.getAddress(f.publicKey) === account
    );
    if (foundAccount !== undefined) {
      return foundAccount;
    }
    throw new Error(
      `HDPrivateKey: Account with address ${account} not founded`
    );
  }
  findAccountByPk(publicKey) {
    try {
      return this.findAccount(this.getAddress(Buffer.from(publicKey, "hex")));
    } catch {
      throw new Error(
        `HDPrivateKey: Account with public key ${publicKey} not founded`
      );
    }
  }
  exportAccount(address) {
    const account = this.findAccount(address);
    return account.toWIF();
  }
  signPsbt(psbt, inputs) {
    let account;
    inputs.forEach((input) => {
      account = this.findAccountByPk(input.publicKey);
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
    const account = this.findAccount(accountAddress);
    psbt.data.inputs.forEach((input, idx) => {
      if (
        (this.addressType === types_1.AddressType.P2TR ||
          this.addressType === types_1.AddressType.M44_P2TR) &&
        !disableTweakSigner
      ) {
        const signer = tweakSigner(account, {
          network: luckycoinjs_lib_1.networks.luckycoin,
        });
        psbt.signInput(
          idx,
          signer,
          input.sighashType !== undefined ? [input.sighashType] : undefined
        );
      } else {
        const signer = account;
        psbt.signInput(
          idx,
          signer,
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
    let account;
    inputs.forEach((input) => {
      account = this.findAccountByPk(input.publicKey);
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
    return psbt.data.inputs.map((f, i) => ({
      inputIndex: i,
      partialSig: f.partialSig?.flatMap((p) => p) ?? [],
    }));
  }
  signMessage(address, text) {
    const account = this.findAccount(address);
    const hash = (0, sha256_1.sha256)(text);
    return account.sign(Buffer.from(hash)).toString("base64");
  }
  signPersonalMessage(address, message) {
    return this.signMessage(address, message);
  }
  async fromOptions(options) {
    this.fromSeed({
      seed: Buffer.from(options.seed),
      hdPath: options.hdPath,
    });
    return this;
  }
  static fromOptions(options) {
    return new this().fromOptions(options);
  }
  fromSeed(opts) {
    this.childIndex = 0;
    this.seed = opts.seed;
    this.hdWallet = browser_hdkey_1.default.fromMasterSeed(
      Buffer.from(opts.seed)
    );
    if (opts.hdPath) {
      this.hdPath = opts.hdPath;
    }
    this.root = this.hdWallet.derive(this.hdPath);
    this.hideRoot = opts.hideRoot;
    this.privateKey = this.root.privateKey;
    this.publicKey = this.root.publicKey;
    this.addressType = opts.addressType;
    return this;
  }
  static fromSeed(opts) {
    return new this().fromSeed(opts);
  }
  toggleHideRoot() {
    this.hideRoot = !this.hideRoot;
    if (this.hideRoot && !this.accounts.length) {
      this.addAccounts();
    }
  }
  async fromMnemonic(opts) {
    const seed = await (0, nintondo_bip39_1.mnemonicToSeed)(
      opts.mnemonic,
      opts.passphrase ?? "lky"
    );
    this.fromSeed({
      seed,
      hideRoot: opts.hideRoot,
      addressType: opts.addressType,
      hdPath: opts.hdPath,
    });
    return this;
  }
  static fromMnemonic(opts) {
    return new this().fromMnemonic(opts);
  }
  fromPrivateKey(_key) {
    throw new Error("Method not allowed for HDPrivateKey.");
  }
  static fromPrivateKey(key) {
    return new this().fromPrivateKey(key);
  }
  getChildCount() {
    return this.accounts.length;
  }
  serialize() {
    if (this.childIndex !== 0)
      throw new Error("You should use only root wallet to serializing");
    return {
      numberOfAccounts: this.getChildCount(),
      seed: (0, utils_1.bytesToHex)(this.seed),
      addressType: this.addressType,
      hdPath: this.hdPath !== DEFAULT_HD_PATH ? this.hdPath : undefined,
    };
  }
  static deserialize(opts) {
    if (opts.numberOfAccounts === undefined || !opts.seed) {
      throw new Error(
        "HDPrivateKey: Deserialize method cannot be called with an opts value for numberOfAccounts and no seed"
      );
    }
    const root = HDPrivateKey.fromSeed({
      seed: (0, utils_1.hexToBytes)(opts.seed),
      hideRoot: opts.hideRoot,
      addressType: opts.addressType,
      hdPath: opts.hdPath,
      network: opts.network,
    });
    root.addAccounts(opts.numberOfAccounts);
    return root;
  }
  deserialize(state) {
    return HDPrivateKey.deserialize(state);
  }
  _addressFromIndex(i) {
    if (!this.accounts[i]) {
      const child = this.root?.deriveChild(i);
      const ecpair = ECPair.fromPrivateKey(Buffer.from(child.privateKey));
      this.accounts.push(ecpair);
    }
    return this.accounts[i];
  }
}
exports.default = HDPrivateKey;
