import * as sjcl from "sjcl";
import { Algorithm, Bits, Encoding, Hash } from "./types";

class HashImplementation {
  private readonly hash: sjcl.SjclHash;

  public constructor(algorithm: Algorithm) {
    switch (algorithm) {
      case "sha1":
        this.hash = new sjcl.hash.sha1();
        break;
      case "sha256":
      default:
        this.hash = new sjcl.hash.sha256();
        break;
      case "sha512":
        this.hash = new sjcl.hash.sha512();
    }
  }

  public update(data: string | Bits): Hash {
    if (typeof data === "string") {
      this.hash.update(data);
    } else {
      this.hash.update(data);
    }
    return this;
  }

  public digest(): Bits;
  public digest(encoding: Encoding): string;

  public digest(encoding?: Encoding): Bits | string {
    const bits = this.hash.finalize();

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
}

export function getHash(algorithm: Algorithm): Hash {
  return new HashImplementation(algorithm);
}
