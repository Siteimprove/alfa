import * as sjcl from "sjcl";
import { Algorithm, Encoding, Hash, Bits } from "./types";

const HashImplementation = class Hash {
  private _hash: sjcl.SjclHash;

  constructor(algorithm: Algorithm) {
    switch (algorithm) {
      case "sha1":
        this._hash = new sjcl.hash.sha1();
        break;
      case "sha256":
      default:
        this._hash = new sjcl.hash.sha256();
        break;
      case "sha512":
        this._hash = new sjcl.hash.sha512();
    }
  }

  public update(data: string | Bits): Hash {
    if (typeof data === "string") {
      this._hash.update(data);
    } else {
      this._hash.update(data);
    }
    return this;
  }

  public digest(): Bits;
  public digest(encoding: Encoding): string;

  public digest(encoding?: Encoding): Bits | string {
    const bits = this._hash.finalize();

    if (encoding === undefined) {
      return bits;
    }

    let codec: sjcl.SjclCodec<string>;

    switch (encoding) {
      case "utf8":
      default:
        codec = sjcl.codec.utf8String;
        break;
      case "hex":
        codec = sjcl.codec.hex;
        break;
      case "base64":
        codec = sjcl.codec.base64;
    }

    return codec.fromBits(bits);
  }
};

export function getHash(algorithm: Algorithm): Hash {
  return new HashImplementation(algorithm);
}
