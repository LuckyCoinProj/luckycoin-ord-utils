/// <reference types="node" />
/// <reference types="node" />
import { Psbt } from "luckycoinjs-lib";
import { ECPairInterface } from "luckycoinpair";
import { BaseWallet } from "./base";
import { FromMnemonicOpts, FromSeedOpts, Hex, Keyring, PrivateKeyOptions, SerializedHDKey, ToSignInput } from "./types";
declare class HDPrivateKey extends BaseWallet implements Keyring<SerializedHDKey> {
    hideRoot?: boolean;
    childIndex: number;
    privateKey: Buffer;
    publicKey: Buffer;
    accounts: ECPairInterface[];
    private seed?;
    private hdWallet?;
    private root?;
    private hdPath;
    constructor(options?: PrivateKeyOptions);
    changeHdPath(hdPath: string): void;
    signTypedData(address: string, typedData: Record<string, unknown>): string;
    exportPublicKey(address: string): string;
    verifyMessage(address: string, text: string, sig: string): boolean;
    getAccounts(): string[];
    addAccounts(number?: number): string[];
    private findAccount;
    private findAccountByPk;
    exportAccount(address: Hex): string;
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
    signMessage(address: Hex, text: string): string;
    signPersonalMessage(address: Hex, message: Hex): string;
    fromOptions(options: PrivateKeyOptions): Promise<this>;
    static fromOptions(options: PrivateKeyOptions): Promise<HDPrivateKey>;
    fromSeed(opts: FromSeedOpts): this;
    static fromSeed(opts: FromSeedOpts): HDPrivateKey;
    toggleHideRoot(): void;
    fromMnemonic(opts: FromMnemonicOpts): Promise<HDPrivateKey>;
    static fromMnemonic(opts: FromMnemonicOpts): Promise<HDPrivateKey>;
    fromPrivateKey(_key: Uint8Array): void;
    static fromPrivateKey(key: Uint8Array): void;
    private getChildCount;
    serialize(): SerializedHDKey;
    static deserialize(opts: SerializedHDKey): HDPrivateKey;
    deserialize(state: SerializedHDKey): HDPrivateKey;
    private _addressFromIndex;
}
export default HDPrivateKey;
