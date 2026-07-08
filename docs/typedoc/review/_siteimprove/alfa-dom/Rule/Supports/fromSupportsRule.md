# Function: fromSupportsRule()

```ts
function fromSupportsRule(json: JSON, fromRule: (json: JSON) => Trampoline<Rule>): Trampoline<Supports>;
```

Defined in: [alfa-dom/src/style/rule/supports.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/supports.ts)

## Parameters

### json

[`JSON`](JSON.md)

### fromRule

(`json`: [`JSON`](../JSON.md)) => `Trampoline`\<[`Rule`](../../Rule-1.md)\>

## Returns

`Trampoline`\<[`Supports`](../Supports-2.md)\>
