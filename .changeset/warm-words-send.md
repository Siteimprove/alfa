---
"@siteimprove/alfa-http": patch
---

**Fixed:** A type incompatibility between `Uint8Array` and `ArrayBuffer` introduced by the TypeScript 5.9 upgrade has been resolved by explicitly accessing the `.buffer` property in `Request#from` and `Response#from`.
