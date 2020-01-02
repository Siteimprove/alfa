import { Encoder } from "@siteimprove/alfa-encoding";

import { IntegerOverflow } from "./constants";

export interface Hash {
  write(data: Uint8Array): this;
  finish(): number;
}

export namespace Hash {
  export function writeString(hash: Hash, data: string): void {
    hash.write(Encoder.encode(data));
  }

  export function writeNumber(hash: Hash, data: number): void {
    if (Number.isInteger(data) && data < IntegerOverflow) {
      writeInt32(hash, data);
    } else {
      writeFloat64(hash, data);
    }
  }

  export function writeInt(
    hash: Hash,
    data: number,
    size = 32,
    signed = true
  ): void {
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

    hash.write(new Uint8Array(buffer));
  }

  export function writeInt8(hash: Hash, data: number): void {
    writeInt(hash, data, 8, true);
  }

  export function writeUint8(hash: Hash, data: number): void {
    writeInt(hash, data, 8, false);
  }

  export function writeInt16(hash: Hash, data: number): void {
    writeInt(hash, data, 16, true);
  }

  export function writeUint16(hash: Hash, data: number): void {
    writeInt(hash, data, 16, false);
  }

  export function writeInt32(hash: Hash, data: number): void {
    writeInt(hash, data, 32, true);
  }

  export function writeUint32(hash: Hash, data: number): void {
    writeInt(hash, data, 32, false);
  }

  export function writeFloat(hash: Hash, data: number, size = 32): void {
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

    hash.write(new Uint8Array(buffer));
  }

  export function writeFloat32(hash: Hash, data: number): void {
    writeFloat(hash, data, 32);
  }

  export function writeFloat64(hash: Hash, data: number): void {
    writeFloat(hash, data, 64);
  }
}
