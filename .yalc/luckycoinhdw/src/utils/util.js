"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toXOnly =
  exports.parsePath =
  exports.fromRev =
  exports.revHex =
  exports.time =
  exports.date =
  exports.ms =
  exports.now =
  exports.bench =
    void 0;
const utils_1 = require("@noble/hashes/utils");
function bench(time) {
  if (!process.hrtime) {
    const now = Date.now();
    if (time) {
      const [hi, lo] = time;
      const start = hi * 1000 + lo / 1e6;
      return now - start;
    }
    const ms = now % 1000;
    // Seconds
    const hi = (now - ms) / 1000;
    // Nanoseconds
    const lo = ms * 1e6;
    return [hi, lo];
  }
  if (time) {
    const [hi, lo] = process.hrtime(time);
    return hi * 1000 + lo / 1e6;
  }
  return process.hrtime();
}
exports.bench = bench;
function now() {
  return Math.floor(Date.now() / 1000);
}
exports.now = now;
function ms() {
  return Number(Date.now());
}
exports.ms = ms;
function date(time) {
  if (time === undefined) time = now();
  return new Date(time * 1000).toISOString().slice(0, -5) + "Z";
}
exports.date = date;
function time(date) {
  if (date == null) return now();
  return (Number(new Date(date)) / 1000) | 0;
}
exports.time = time;
function revHex(buf) {
  return (0, utils_1.bytesToHex)(buf.reverse());
}
exports.revHex = revHex;
function fromRev(str) {
  if ((str.length & 1) !== 0) throw new Error("Invalid rev");
  return (0, utils_1.hexToBytes)(str).reverse();
}
exports.fromRev = fromRev;
function parsePath(path) {
  const parts = path.split("/");
  const root = parts[0];
  if (root !== "m" && root !== "M" && root !== "m'" && root !== "M'") {
    throw new Error("Invalid path root.");
  }
  const result = [];
  for (let i = 1; i < parts.length; i++) {
    let part = parts[i];
    if (part.length > 10) throw new Error("Path index too large.");
    if (!/^\d+$/.test(part)) throw new Error("Path index is non-numeric.");
    let index = parseInt(part, 10);
    if (index >>> 0 !== index) throw new Error("Path index out of range.");
    result.push(index);
  }
  return result;
}
exports.parsePath = parsePath;
const toXOnly = (pubKey) =>
  pubKey.length === 32 ? pubKey : pubKey.slice(1, 33);
exports.toXOnly = toXOnly;
