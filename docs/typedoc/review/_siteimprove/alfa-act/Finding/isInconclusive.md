# Function: isInconclusive()

```ts
function isInconclusive<D>(finding): finding is Right<[D, boolean]>;
```

Defined in: [alfa-act/src/expectation/finding.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/finding.ts)

## Type Parameters

### D

`D` *extends* [`Diagnostic`](../Diagnostic-1.md)

## Parameters

### finding

[`Finding`](../Finding-1.md)\<`unknown`, `D`\>

## Returns

`finding is Right<[D, boolean]>`
