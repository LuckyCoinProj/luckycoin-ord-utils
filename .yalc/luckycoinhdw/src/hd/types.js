"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DISALLOWED_CHILD_METHODS = exports.AddressType = void 0;
var AddressType;
(function (AddressType) {
  AddressType[(AddressType["P2PKH"] = 0)] = "P2PKH";
  AddressType[(AddressType["P2WPKH"] = 1)] = "P2WPKH";
  AddressType[(AddressType["P2TR"] = 2)] = "P2TR";
  AddressType[(AddressType["P2SH_P2WPKH"] = 3)] = "P2SH_P2WPKH";
  AddressType[(AddressType["M44_P2WPKH"] = 4)] = "M44_P2WPKH";
  AddressType[(AddressType["M44_P2TR"] = 5)] = "M44_P2TR";
})((AddressType = exports.AddressType || (exports.AddressType = {})));
exports.DISALLOWED_CHILD_METHODS = [
  "deserialize",
  "serialize",
  "getAccounts",
  "generate",
];
