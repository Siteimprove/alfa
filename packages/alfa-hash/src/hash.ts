import { Encoder } from "@siteimprove/alfa-encoding";
import { Equatable } from "@siteimprove/alfa-equatable";

import { Hashable } from "./hashable";
import { BuiltinOffset, IntegerOverflow } from "./constants";

const hashes = new WeakMap<object, number>();

let uid = 1;

export abstract class Hash implements Equatable, Hashable {
  protected constructor() {}

  public abstract finish(): number;

  public abstract write(data: Uint8Array): this;

  public writeString(data: string): this {
    return this.write(Encoder.encode(data));
  }

  public writeNumber(data: number): this {
    if (Number.isInteger(data) && data < IntegerOverflow) {
      return this.writeInt32(data);
    } else {
      return this.writeFloat64(data);
    }
  }

  public writeInt(data: number, size = 32, signed = true): this {
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
      default:
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

  public writeFloat(data: number, size = 32): this {
    const buffer = new ArrayBuffer(size / 8);
    const view = new DataView(buffer);

    switch (size) {
      case 32:
        view.setFloat32(0, data);
        break;
      case 64:
      default:
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
    return this.writeUint8(data ? 1 : 0);
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
        return this;

      case "boolean":
        return this.writeUint8(BuiltinOffset + (data ? 1 : 0));

      case "symbol":
        return this;

      case "undefined":
        return this.writeUint32(BuiltinOffset + 2);

      case "object":
      case "function":
        if (data === null) {
          return this.writeUint32(BuiltinOffset + 3);
        }

        if (Hashable.isHashable(data)) {
          return this.writeHashable(data);
        }

        let id = hashes.get(data);

        if (id === undefined) {
          id = uid++;

          if (uid === IntegerOverflow) {
            uid = 0;
          }

          hashes.set(data, id);
        }

        return this.writeUint32(id);
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
}
