import { AddressType } from "./types";
export declare class BaseWallet {
    addressType?: AddressType;
    getAddress(publicKey: Uint8Array): string | undefined;
}
