import { test } from "@siteimprove/alfa-test";

import { Decoder, Encoder } from "../src/index.ts";

test("encode() encodes ASCII characters correctly", (t) => {
  const input = "Hello";
  const output = Encoder.encode(input);

  t.deepEqual(Array.from(output), [0x48, 0x65, 0x6c, 0x6c, 0x6f]);
});

test("encode() encodes 2-byte UTF-8 characters correctly", (t) => {
  const input = "café";
  const output = Encoder.encode(input);

  // c, a, f, é (0xe9 -> 0xc3 0xa9)
  t.deepEqual(Array.from(output), [0x63, 0x61, 0x66, 0xc3, 0xa9]);
});

test("encode() encodes 3-byte UTF-8 characters correctly", (t) => {
  const input = "€";
  const output = Encoder.encode(input);

  // Euro sign (U+20AC -> 0xe2 0x82 0xac)
  t.deepEqual(Array.from(output), [0xe2, 0x82, 0xac]);
});

test("encode() encodes 4-byte UTF-8 characters correctly", (t) => {
  const input = "𝄞"; // Musical symbol G clef (U+1D11E)
  const output = Encoder.encode(input);

  // 0xf0 0x9d 0x84 0x9e
  t.deepEqual(Array.from(output), [0xf0, 0x9d, 0x84, 0x9e]);
});

test("encode() encodes emojis correctly", (t) => {
  const input = "😀";
  const output = Encoder.encode(input);

  // Grinning face (U+1F600 -> 0xf0 0x9f 0x98 0x80)
  t.deepEqual(Array.from(output), [0xf0, 0x9f, 0x98, 0x80]);
});

test("encode() encodes empty string", (t) => {
  const input = "";
  const output = Encoder.encode(input);

  t.deepEqual(Array.from(output), []);
});

test("decode() decodes ASCII characters correctly", (t) => {
  const input = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
  const output = Decoder.decode(input);

  t.equal(output, "Hello");
});

test("decode() decodes 2-byte UTF-8 characters correctly", (t) => {
  const input = new Uint8Array([0x63, 0x61, 0x66, 0xc3, 0xa9]);
  const output = Decoder.decode(input);

  t.equal(output, "café");
});

test("decode() decodes 3-byte UTF-8 characters correctly", (t) => {
  const input = new Uint8Array([0xe2, 0x82, 0xac]);
  const output = Decoder.decode(input);

  t.equal(output, "€");
});

test("decode() decodes 4-byte UTF-8 characters correctly", (t) => {
  const input = new Uint8Array([0xf0, 0x9d, 0x84, 0x9e]);
  const output = Decoder.decode(input);

  t.equal(output, "𝄞");
});

test("decode() decodes emojis correctly", (t) => {
  const input = new Uint8Array([0xf0, 0x9f, 0x98, 0x80]);
  const output = Decoder.decode(input);

  t.equal(output, "😀");
});

test("decode() decodes empty array", (t) => {
  const input = new Uint8Array([]);
  const output = Decoder.decode(input);

  t.equal(output, "");
});

test("decode() handles incomplete multibyte sequences", (t) => {
  // Incomplete 2-byte sequence
  const input = new Uint8Array([0xc3]);
  const output = Decoder.decode(input);

  // Should decode to replacement character
  t.equal(output, "\ufffd");
});

test("encode() and decode() are inverse for ASCII text", (t) => {
  const original = "Hello, World! 123";
  const encoded = Encoder.encode(original);
  const decoded = Decoder.decode(encoded);

  t.equal(decoded, original);
});

test("encode() and decode() are inverse for mixed UTF-8 text", (t) => {
  const original = "Hello café! How are you?";
  const encoded = Encoder.encode(original);
  const decoded = Decoder.decode(encoded);

  t.equal(decoded, original);
});

test("encode() and decode() are inverse for complex Unicode text", (t) => {
  const original = "Mixed: ASCII, café, €100, 中文, العربية, עברית";
  const encoded = Encoder.encode(original);
  const decoded = Decoder.decode(encoded);

  t.equal(decoded, original);
});

test("encode() and decode() are inverse for emojis and symbols", (t) => {
  const original = "Emojis: 😀😃😄😁 Symbols: ♠♣♥♦ Music: 𝄞𝄢";
  const encoded = Encoder.encode(original);
  const decoded = Decoder.decode(encoded);

  t.equal(decoded, original);
});

test("encode() and decode() are inverse for text with various scripts", (t) => {
  const original =
    "English, Français, Español, Deutsch, 日本語, 한국어, Русский, ελληνικά";
  const encoded = Encoder.encode(original);
  const decoded = Decoder.decode(encoded);

  t.equal(decoded, original);
});

test("encode() and decode() are inverse for text with special characters", (t) => {
  const original =
    "Special: \n\t\r \"quotes\" 'apostrophes' [brackets] {braces} <tags>";
  const encoded = Encoder.encode(original);
  const decoded = Decoder.decode(encoded);

  t.equal(decoded, original);
});

test("encode() and decode() are inverse for long text with mixed content", (t) => {
  const original = `
    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    Price: €50.00 or $60.00 or ¥6000
    Math: ∑∫∂∇ Arrows: ←→↑↓
    Emojis: 🎉🎊🎈🎁
    Chinese: 你好世界
    Japanese: こんにちは世界
    Korean: 안녕하세요 세계
    Arabic: مرحبا بالعالم
    Russian: Здравствуй мир
    Musical notes: 𝄞𝄡𝄢𝄫
  `;
  const encoded = Encoder.encode(original);
  const decoded = Decoder.decode(encoded);

  t.equal(decoded, original);
});
