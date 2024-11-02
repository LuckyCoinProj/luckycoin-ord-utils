/// <reference types="node" />
/// <reference types="node" />
export declare function bench(time: [number, number]): number | number[];
export declare function now(): number;
export declare function ms(): number;
export declare function date(time?: number): string;
export declare function time(date?: string): number;
export declare function revHex(buf: Uint8Array): string;
export declare function fromRev(str: string): Uint8Array;
export declare function parsePath(path: string): number[];
export declare const toXOnly: (pubKey: Buffer) => Buffer;
