<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-toolchain](./alfa-toolchain.md) &gt; [Validation](./alfa-toolchain.validation.md) &gt; [hasExtractorConfig](./alfa-toolchain.validation.hasextractorconfig.md)

## Validation.hasExtractorConfig() function

Checks that a directory includes an API extractor config file.

**Signature:**

```typescript
export declare function hasExtractorConfig(name: string, dir: string): Array<string>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  name | string |  |
|  dir | string |  |

**Returns:**

Array&lt;string&gt;

## Remarks

`dir` is coming from @<!-- -->manypkg/get-packages, which sets it to the OS specific syntax.

