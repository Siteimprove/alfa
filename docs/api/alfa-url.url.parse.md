<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-url](./alfa-url.md) &gt; [URL](./alfa-url.url.md) &gt; [parse](./alfa-url.url.parse.md)

## URL.parse() function

[https://url.spec.whatwg.org/\#concept-url-parser](https://url.spec.whatwg.org/#concept-url-parser)

**Signature:**

```typescript
function parse(url: string, base?: string | URL): Result<URL, string>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  url | string |  |
|  base | string \| [URL](./alfa-url.url.md) | _(Optional)_ |

**Returns:**

Result&lt;[URL](./alfa-url.url.md)<!-- -->, string&gt;

## Remarks

Parsing URLs is tricky business and so this function relies on the presence of a globally available WHATWG URL class. This API is available in both browsers, Node.js, and Deno.

