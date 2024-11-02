/// <reference types="node" />
/// <reference types="node" />
export declare const MIN_ENTROPY: number;
export declare const MAX_ENTROPY: number;
export declare const ZERO_KEY: Buffer;
export declare const ZERO_PRIVKEY: Buffer;
export declare const SEED_SALT: Uint8Array;
export declare const hash160: (value: string | Uint8Array) => Uint8Array;
export declare const hash256: (value: string | Uint8Array) => Uint8Array;
export declare const assert: (exp: boolean | number, message?: string) => boolean;
