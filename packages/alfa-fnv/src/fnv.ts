import { Hash } from "@siteimprove/alfa-hash";

export class FNV implements Hash {
  public static empty(): FNV {
    return new FNV();
  }

  private hash = 2166136261;

  private constructor() {}

  public write(data: Uint8Array): this {
    let hash = this.hash;

    for (const octet of data) {
      hash ^= octet;
      hash +=
        (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }

    this.hash = hash;

    return this;
  }

  public finish(): number {
    return this.hash >>> 0; // Convert to unsigned 32-bit integer
  }
}
