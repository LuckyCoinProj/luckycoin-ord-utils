"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseWallet = void 0;
const luckycoinjs_lib_1 = require("luckycoinjs-lib");
const util_1 = require("../utils/util");
const types_1 = require("./types");
class BaseWallet {
  getAddress(publicKey) {
    if (this.addressType === undefined)
      throw new Error("addressType of keyring is not specified");
    switch (this.addressType) {
      case types_1.AddressType.P2WPKH:
        return luckycoinjs_lib_1.payments.p2wpkh({
          pubkey: Buffer.from(publicKey),
        }).address;
      case types_1.AddressType.P2SH_P2WPKH:
        return luckycoinjs_lib_1.payments.p2sh({
          redeem: luckycoinjs_lib_1.payments.p2wpkh({
            pubkey: Buffer.from(publicKey),
          }),
        }).address;
      case types_1.AddressType.P2PKH:
        return luckycoinjs_lib_1.payments.p2pkh({
          pubkey: Buffer.from(publicKey),
        }).address;
      case types_1.AddressType.P2TR:
        return luckycoinjs_lib_1.payments.p2tr({
          internalPubkey: (0, util_1.toXOnly)(Buffer.from(publicKey)),
        }).address;
      default:
        throw new Error("Invalid AddressType");
    }
  }
}
exports.BaseWallet = BaseWallet;
