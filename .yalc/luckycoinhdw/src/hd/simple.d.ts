/// <reference types="node" />
/// <reference types="node" />
import { Psbt } from "luckycoinjs-lib";
import { BaseWallet } from "./base";
import { AddressType, Keyring, SerializedSimpleKey, ToSignInput } from "./types";
declare class HDSimpleKey extends BaseWallet implements Keyring<SerializedSimpleKey> {
    privateKey: Uint8Array;
    publicKey: Buffer;
    private pair?;
    constructor(privateKey: Uint8Array);
    private initPair;
    signTypedData(address: string, typedData: Record<string, unknown>): string;
    verifyMessage(_address: string, text: string, sig: string): boolean;
    getAccounts(): string[];
    serialize(): {
        privateKey: string;
        addressType: AddressType;
    };
    deserialize(state: SerializedSimpleKey): this;
    static deserialize(state: SerializedSimpleKey): HDSimpleKey;
    exportAccount(_address: string, _options?: Record<string, unknown> | undefined): string;
    exportPublicKey(_address: string): string;
    signPsbt(psbt: Psbt, inputs: ToSignInput[]): void;
    signAllInputsInPsbt(psbt: Psbt, accountAddress: string, disableTweakSigner?: boolean): {
        signatures: (string | undefined)[];
    };
    signInputsWithoutFinalizing(psbt: Psbt, inputs: ToSignInput[]): {
        inputIndex: number;
        partialSig: {
            pubkey: Buffer;
            signature: Buffer;
        }[];
    }[];
    signMessage(_address: string, message: string): string;
    signPersonalMessage(address: string, message: string): string;
}
export default HDSimpleKey;
