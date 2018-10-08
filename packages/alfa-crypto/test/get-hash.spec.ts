import { test } from "@siteimprove/alfa-test";
import { getHash } from "../src/get-hash";

test("Can hash a SHA-256 bit array", t => {
  const helloWorld = [1214606444, 1864390511, 26390198772736];

  t.equal(
    getHash("sha256")
      .update(helloWorld)
      .digest("hex"),
    "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e"
  );
});

test("Can hash a SHA-256 string", t => {
  // Hex
  t.equal(
    getHash("sha256")
      .update("Hello World")
      .digest("hex"),
    "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e"
  );

  // Base64
  t.equal(
    getHash("sha256")
      .update("Hello World")
      .digest("base64"),
    "pZGm1Av0IEBKARczz7exkNYsZb8LzaMrV7J32a2fFG4="
  );

  // Raw bits
  t.deepEqual(
    getHash("sha256")
      .update("Hello World")
      .digest(),
    [
      -1517181228,
      200548416,
      1241585459,
      -810045040,
      -701733441,
      198026027,
      1471313881,
      -1382083474
    ]
  );
});
