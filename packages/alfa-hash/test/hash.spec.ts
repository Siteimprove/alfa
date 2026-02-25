import { test } from "@siteimprove/alfa-test";

import { Hash } from "../dist/index.js";

class SimpleHash extends Hash {
  private _hash = 0;

  public constructor() {
    super();
  }

  public finish(): number {
    return this._hash >>> 0; // Convert to unsigned 32-bit integer
  }

  // Stupid write function that just adds numbers, we do not care about good
  // hashing here
  public write(data: Uint8Array): this {
    this._hash += data.reduce((a, b) => a + b, 0);

    return this;
  }
}

test(".write() writes raw bytes", (t) => {
  const hash = new SimpleHash();
  const data = new Uint8Array([1, 2, 3, 4, 5]);

  hash.write(data);

  t.equal(hash.finish(), 15);
});

test(".writeString() writes a string", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeString("hello");
  hash2.writeString("hello");

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeString() produces different hashes for different strings", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeString("hello");
  hash2.writeString("world");

  t.notEqual(hash1.finish(), hash2.finish());
});

test(".writeNumber() writes a number", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeNumber(42);
  hash2.writeNumber(42);

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeNumber() produces different hashes for different numbers", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeNumber(42);
  hash2.writeNumber(43);

  t.notEqual(hash1.finish(), hash2.finish());
});

test(".writeInt8() writes a signed 8-bit integer", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeInt8(127);
  hash2.writeInt8(127);

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeInt8() handles negative values", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeInt8(-128);
  hash2.writeInt8(-128);

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeUint8() writes an unsigned 8-bit integer", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeUint8(255);
  hash2.writeUint8(255);

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeInt16() writes a signed 16-bit integer", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeInt16(32767);
  hash2.writeInt16(32767);

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeInt16() handles negative values", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeInt16(-32768);
  hash2.writeInt16(-32768);

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeUint16() writes an unsigned 16-bit integer", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeUint16(65535);
  hash2.writeUint16(65535);

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeInt32() writes a signed 32-bit integer", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeInt32(2147483647);
  hash2.writeInt32(2147483647);

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeInt32() handles negative values", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeInt32(-2147483648);
  hash2.writeInt32(-2147483648);

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeUint32() writes an unsigned 32-bit integer", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeUint32(4294967295);
  hash2.writeUint32(4294967295);

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeBigInt64() writes a signed 64-bit integer", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeBigInt64(9223372036854775807n);
  hash2.writeBigInt64(9223372036854775807n);

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeBigInt64() handles negative values", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeBigInt64(-9223372036854775808n);
  hash2.writeBigInt64(-9223372036854775808n);

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeBigUint64() writes an unsigned 64-bit integer", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeBigUint64(18446744073709551615n);
  hash2.writeBigUint64(18446744073709551615n);

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeFloat32() writes a 32-bit float", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeFloat32(3.14);
  hash2.writeFloat32(3.14);

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeFloat64() writes a 64-bit float", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeFloat64(3.141592653589793);
  hash2.writeFloat64(3.141592653589793);

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeBoolean() writes true", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeBoolean(true);
  hash2.writeBoolean(true);

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeBoolean() writes false", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeBoolean(false);
  hash2.writeBoolean(false);

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeBoolean() produces different hashes for true and false", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeBoolean(true);
  hash2.writeBoolean(false);

  t.notEqual(hash1.finish(), hash2.finish());
});

test(".writeUndefined() writes undefined", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeUndefined();
  hash2.writeUndefined();

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeNull() writes null", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeNull();
  hash2.writeNull();

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeNull() and .writeUndefined() produce different hashes", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeNull();
  hash2.writeUndefined();

  t.notEqual(hash1.finish(), hash2.finish());
});

test(".writeObject() writes an object", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();
  const obj = { foo: "bar" };

  hash1.writeObject(obj);
  hash2.writeObject(obj);

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeObject() produces different hashes for different objects", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();
  const obj1 = { foo: "bar" };
  const obj2 = { foo: "bar" };

  hash1.writeObject(obj1);
  hash2.writeObject(obj2);

  t.notEqual(hash1.finish(), hash2.finish());
});

test(".writeSymbol() writes a symbol", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();
  const sym = Symbol("test");

  hash1.writeSymbol(sym);
  hash2.writeSymbol(sym);

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeSymbol() produces different hashes for different symbols", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();
  const sym1 = Symbol("test");
  const sym2 = Symbol("test");

  hash1.writeSymbol(sym1);
  hash2.writeSymbol(sym2);

  t.notEqual(hash1.finish(), hash2.finish());
});

test(".writeHashable() writes a hashable object", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  const hashable = {
    hash(h: Hash) {
      h.writeString("test");
    },
  };

  hash1.writeHashable(hashable);
  hash2.writeHashable(hashable);

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeUnknown() handles strings", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeUnknown("hello");
  hash2.writeString("hello");

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeUnknown() handles numbers", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeUnknown(42);
  hash2.writeNumber(42);

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeUnknown() handles bigints", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeUnknown(42n);
  hash2.writeBigInt(42n);

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeUnknown() handles booleans", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeUnknown(true);
  hash2.writeBoolean(true);

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeUnknown() handles symbols", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();
  const sym = Symbol("test");

  hash1.writeUnknown(sym);
  hash2.writeSymbol(sym);

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeUnknown() handles undefined", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeUnknown(undefined);
  hash2.writeUndefined();

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeUnknown() handles null", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeUnknown(null);
  hash2.writeNull();

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeUnknown() handles objects", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();
  const obj = { foo: "bar" };

  hash1.writeUnknown(obj);
  hash2.writeObject(obj);

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeUnknown() handles functions", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();
  const fn = () => {};

  hash1.writeUnknown(fn);
  hash2.writeObject(fn);

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeJSON() handles strings", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeJSON("hello");
  hash2.writeString("hello");

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeJSON() handles numbers", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeJSON(42);
  hash2.writeNumber(42);

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeJSON() handles booleans", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeJSON(true);
  hash2.writeBoolean(true);

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeJSON() handles arrays", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeJSON([1, 2, 3]);
  hash2.writeJSON([1, 2, 3]);

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeJSON() produces different hashes for different arrays", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeJSON([1, 2, 3]);
  hash2.writeJSON([1, 2, 4]);

  t.notEqual(hash1.finish(), hash2.finish());
});

test(".writeJSON() handles objects", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeJSON({ foo: "bar", baz: 42 });
  hash2.writeJSON({ foo: "bar", baz: 42 });

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeJSON() produces same hash regardless of key order", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeJSON({ foo: "bar", baz: 42 });
  hash2.writeJSON({ baz: 42, foo: "bar" });

  t.equal(hash1.finish(), hash2.finish());
});

test(".writeJSON() handles nested objects", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeJSON({ foo: { bar: "baz" } });
  hash2.writeJSON({ foo: { bar: "baz" } });

  t.equal(hash1.finish(), hash2.finish());
});

test(".equals() returns true for hashes with same value", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeString("test");
  hash2.writeString("test");

  t(hash1.equals(hash2));
});

test(".equals() returns false for hashes with different values", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();

  hash1.writeString("test1");
  hash2.writeString("test2");

  t(!hash1.equals(hash2));
});

test(".equals() returns false for non-hash values", (t) => {
  const hash = new SimpleHash();

  hash.writeString("test");

  t(!hash.equals("not a hash"));
});

test(".hash() writes hash value to another hash", (t) => {
  const hash1 = new SimpleHash();
  const hash2 = new SimpleHash();
  const hash3 = new SimpleHash();

  hash1.writeString("test");

  const value = hash1.finish();

  hash2.writeUint32(value);
  hash1.hash(hash3);

  t.equal(hash2.finish(), hash3.finish());
});
