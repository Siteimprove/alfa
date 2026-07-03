[**Alfa API documentation**](../../README.md)

***

[Alfa API documentation](../../README.md) / [@siteimprove/alfa-act](../alfa-act.md) / Finding

# Type Alias: Finding\<ANSWER, DIAGNOSTIC\>

> **Finding**\<`ANSWER`, `DIAGNOSTIC`\> = `Either`\<\[`ANSWER`, `boolean`\], \[`DIAGNOSTIC`, `boolean`\]\>

Defined in: [alfa-act/src/expectation/finding.ts:11](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/finding.ts#L11)

The result of an Interview: either a Conclusive finding (a final answer was
reached) or an Inconclusive one (more information is needed).

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `ANSWER` | - |
| `DIAGNOSTIC` *extends* [`Diagnostic`](Diagnostic-1.md) | [`Diagnostic`](Diagnostic-1.md) |
