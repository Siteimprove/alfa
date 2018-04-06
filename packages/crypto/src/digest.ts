export type Algorithm = "sha1" | "sha256" | "sha384" | "sha512";

export let digest: (data: string, algorithm?: Algorithm) => Promise<string>;

if (typeof crypto === "undefined") {
  const crypto = require("crypto");

  digest = async (
    data: string,
    algorithm: Algorithm = "sha256"
  ): Promise<string> => {
    return crypto
      .createHash(normalize(algorithm))
      .update(data)
      .digest("base64");
  };
} else {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  digest = async (
    data: string,
    algorithm: Algorithm = "sha256"
  ): Promise<string> => {
    const buffer = encoder.encode(data, { stream: true });
    const hash = await crypto.subtle.digest(normalize(algorithm), buffer);
    const string = decoder.decode(hash, { stream: true });
    return btoa(string);
  };
}

function normalize(algorithm: Algorithm): string {
  if (typeof crypto === "undefined") {
    return algorithm;
  } else {
    switch (algorithm) {
      case "sha1":
        return "SHA-1";
      case "sha256":
      default:
        return "SHA-256";
      case "sha384":
        return "SHA-384";
      case "sha512":
        return "SHA-512";
    }
  }
}
