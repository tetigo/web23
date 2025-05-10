import * as ecc from "tiny-secp256k1";
import ECPairFactory, { ECPairInterface } from "ecpair";

const ECPair = ECPairFactory(ecc);

/**
 * Wallet class (Using ECDSA)
 */
export default class Wallet {
  privateKey: string;
  publicKey: string;

  /**
   * Optional parameter to pass the wif or the private key to recover the wallet
   * If no parameter, a new wallet is created
   * wif = Wallet Import Format
   * @param wifOrPrivateKey
   */
  constructor(wifOrPrivateKey?: string) {
    const keys = wifOrPrivateKey
      ? wifOrPrivateKey.length === 64
        ? ECPair.fromPrivateKey(Buffer.from(wifOrPrivateKey, "hex"))
        : ECPair.fromWIF(wifOrPrivateKey)
      : ECPair.makeRandom();

    /* c8 ignore next */
    this.privateKey = keys.privateKey ? keys.privateKey.toString("hex") : "";
    this.publicKey = keys.publicKey.toString("hex");
  }
}
