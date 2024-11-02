"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assert =
  exports.hash256 =
  exports.hash160 =
  exports.SEED_SALT =
  exports.ZERO_PRIVKEY =
  exports.ZERO_KEY =
  exports.MAX_ENTROPY =
  exports.MIN_ENTROPY =
    void 0;
const ripemd160_1 = require("@noble/hashes/ripemd160");
const policy_1 = require("../protocol/policy");
const sha256_1 = require("@noble/hashes/sha256");
const utils_1 = require("@noble/hashes/utils");
exports.MIN_ENTROPY = 128;
exports.MAX_ENTROPY = 512;
exports.ZERO_KEY = Buffer.allocUnsafe(policy_1.PUBKEY_SIZE);
exports.ZERO_PRIVKEY = Buffer.allocUnsafe(policy_1.PRIVKEY_SIZE);
exports.SEED_SALT = (0, utils_1.utf8ToBytes)("Tidecoin seed");
const hash160 = (value) =>
  (0, ripemd160_1.ripemd160)((0, sha256_1.sha256)(value));
exports.hash160 = hash160;
const hash256 = (value) => (0, sha256_1.sha256)((0, sha256_1.sha256)(value));
exports.hash256 = hash256;
const assert = (exp, message) => {
  if (exp) return true;
  throw new Error(message);
};
exports.assert = assert;
