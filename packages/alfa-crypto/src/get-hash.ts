import * as sjcl from "sjcl";
import { Algorithm, Bits, Encoding } from "./types";

export class Hash {
  private readonly hash: sjcl.SjclHash;

  public constructor(algorithm: Algorithm) {
    switch (algorithm) {
      case "sha256":
      default:
        this.hash = new sjcl.hash.sha256();
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
      case "hex":
      default:
        codec = sjcl.codec.hex;
        break;
      case "base64":
        codec = sjcl.codec.base64;
    }

    return codec.fromBits(bits);
  }
}

export function getHash(algorithm: Algorithm): Hash {
  return new Hash(algorithm);
}
