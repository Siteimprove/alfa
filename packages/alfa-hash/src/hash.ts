import { Encoder } from "@siteimprove/alfa-encoding";
import { Equatable } from "@siteimprove/alfa-equatable";
import { JSON } from "@siteimprove/alfa-json";

import { Hashable } from "./hashable";

const { keys } = Object;

/**
 * A special offset used for the builtin types `true`, `false`, `undefined`, and
 * `null`. The offset is designed to minimize the chance of collisions for data
 * structures that rely on 5-bit partitioning. We use the first 30 bits for 6 of
 * these partitions, leaving us 2 bits to encode the 4 builtin types.
 */
const builtinOffset = 0b10000_10000_10000_10000_10000_10000_00;

/**
 * @public
 */
export abstract class Hash implements Equatable, Hashable {
  /**
   * A map from objects to their hash values. Objects are weakly referenced as
   * to not prevent them from being garbage collected.
   */
  private static _objectHashes = new WeakMap<object, number>();

  /**
   * A map from symbols to their hash values. As there's not currently a way to
   * weakly reference symbols, we have to instead use strong references.
   *
   * {@link https://github.com/tc39/proposal-symbols-as-weakmap-keys}
   */
  private static _symbolHashes = new Map<symbol, number>();

  /**
   * The next available hash value. This is used for symbols and objects that
   * don't implement the {@link (Hashable:interface)} interface.
   */
  private static _nextHash = 0;

  protected constructor() {}

  /**
   * Get the current hash value as a 32-bit integer.
   *
   * @remarks
   * The method is limited to 32-bit integers as this is the limit of bitwise
   * operations in JavaScript.
   */
  public abstract finish(): number;

  public abstract write(data: Uint8Array): this;

  public writeString(data: string): this {
    return this.write(Encoder.encode(data));
  }

  /**
   * @remarks
   * As JavaScript represents numbers in double-precision floating-point format,
   * numbers in general will be written as such.
   *
   * {@link https://en.wikipedia.org/wiki/Double-precision_floating-point_format}
   */
  public writeNumber(data: number): this {
    return this.writeFloat64(data);
  }

  public writeInt(data: number, size: 8 | 16 | 32 = 32, signed = true): this {
    const buffer = new ArrayBuffer(size / 8);
    const view = new DataView(buffer);

    switch (size) {
      case 8:
        signed ? view.setInt8(0, data) : view.setUint8(0, data);
        break;
      case 16:
        signed ? view.setInt16(0, data) : view.setUint16(0, data);
        break;
      case 32:
        signed ? view.setInt32(0, data) : view.setUint32(0, data);
    }

    return this.write(new Uint8Array(buffer));
  }

  public writeInt8(data: number): this {
    return this.writeInt(data, 8, true);
  }

  public writeUint8(data: number): this {
    return this.writeInt(data, 8, false);
  }

  public writeInt16(data: number): this {
    return this.writeInt(data, 16, true);
  }

  public writeUint16(data: number): this {
    return this.writeInt(data, 16, false);
  }

  public writeInt32(data: number): this {
    return this.writeInt(data, 32, true);
  }

  public writeUint32(data: number): this {
    return this.writeInt(data, 32, false);
  }

  public writeBigInt(data: bigint, size: 64 = 64, signed = true): this {
    const buffer = new ArrayBuffer(size / 8);
    const view = new DataView(buffer);

    switch (size) {
      case 64:
        signed ? view.setBigInt64(0, data) : view.setBigUint64(0, data);
    }

    return this.write(new Uint8Array(buffer));
  }

  public writeBigInt64(data: bigint): this {
    return this.writeBigInt(data, 64, true);
  }

  public writeBigUint64(data: bigint): this {
    return this.writeBigInt(data, 64, false);
  }

  public writeFloat(data: number, size: 32 | 64 = 32): this {
    const buffer = new ArrayBuffer(size / 8);
    const view = new DataView(buffer);

    switch (size) {
      case 32:
        view.setFloat32(0, data);
        break;
      case 64:
        view.setFloat64(0, data);
    }

    return this.write(new Uint8Array(buffer));
  }

  public writeFloat32(data: number): this {
    return this.writeFloat(data, 32);
  }

  public writeFloat64(data: number): this {
    return this.writeFloat(data, 64);
  }

  public writeBoolean(data: boolean): this {
    return this.writeUint8(builtinOffset + (data ? 1 : 0));
  }

  public writeUndefined(): this {
    return this.writeUint32(builtinOffset + 2);
  }

  public writeNull(): this {
    return this.writeUint32(builtinOffset + 3);
  }

  public writeObject(data: object): this {
    let hash = Hash._objectHashes.get(data);

    if (hash === undefined) {
      hash = Hash._getNextHash();
      Hash._objectHashes.set(data, hash);
    }

    return this.writeUint32(hash);
  }

  public writeSymbol(data: symbol): this {
    let hash = Hash._symbolHashes.get(data);

    if (hash === undefined) {
      hash = Hash._getNextHash();
      Hash._symbolHashes.set(data, hash);
    }

    return this.writeUint32(hash);
  }

  public writeHashable(data: Hashable): this {
    data.hash(this);
    return this;
  }

  public writeUnknown(data: unknown): this {
    switch (typeof data) {
      case "string":
        return this.writeString(data);

      case "number":
        return this.writeNumber(data);

      case "bigint":
        return this.writeBigInt(data);

      case "boolean":
        return this.writeBoolean(data);

      case "symbol":
        return this.writeSymbol(data);

      case "undefined":
        return this.writeUndefined();

      case "object":
        if (data === null) {
          return this.writeNull();
        }

        if (Hashable.isHashable(data)) {
          return this.writeHashable(data);
        }

        return this.writeObject(data);

      case "function":
        return this.writeObject(data);
    }
  }

  public writeJSON(data: JSON): this {
    switch (typeof data) {
      case "string":
        return this.writeString(data);

      case "number":
        return this.writeNumber(data);

      case "boolean":
        return this.writeBoolean(data);

      case "object":
        if (Array.isArray(data)) {
          for (let i = 0, n = data.length; i < n; i++) {
            this.writeJSON(data[i]);
          }

          this.writeUint32(data.length);
        } else if (data !== null) {
          for (const key of keys(data).sort()) {
            const value = data[key];

            this.writeString(key);

            if (value !== undefined) {
              this.writeJSON(value);
            }

            // Write a null byte as a separator between key/value pairs.
            this.writeUint8(0);
          }
        }

        return this;
    }
  }

  public equals(value: Hash): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Hash && value.finish() === this.finish();
  }

  public hash(hash: Hash): void {
    hash.writeUint32(this.finish());
  }

  private static _getNextHash(): number {
    const nextHash = Hash._nextHash;

    // Increase the hash, wrapping around when it reaches the limit of 32 bits.
    Hash._nextHash = (Hash._nextHash + 1) >>> 0;

    return nextHash;
  }
}
