import HDPrivateKey from "./private";
import SimpleKey from "./simple";
import { AddressType, Keyring } from "./types";
export declare function fromMnemonic(mnemonic: string, hideRoot?: boolean): Promise<HDPrivateKey>;
export declare function fromPrivateKey(privateKey: Uint8Array): SimpleKey;
export { HDPrivateKey, SimpleKey };
export * as types from "./types";
export { AddressType, Keyring };
