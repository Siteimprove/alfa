# Function: inconclusive()

```ts
function inconclusive<DIAGNOSTIC>(diagnostic, oracleUsed?): Finding<never, DIAGNOSTIC>;
```

Defined in: [alfa-act/src/expectation/finding.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/finding.ts)

## Type Parameters

### DIAGNOSTIC

`DIAGNOSTIC` *extends* [`Diagnostic`](../Diagnostic-1.md)

## Parameters

### diagnostic

`DIAGNOSTIC`

### oracleUsed?

`boolean` = `false`

## Returns

[`Finding`](../Finding-1.md)\<`never`, `DIAGNOSTIC`\>
