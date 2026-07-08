# Function: fromLayerBlockRule()

```ts
function fromLayerBlockRule(json: JSON, fromRule: (json: JSON) => Trampoline<Rule>): Trampoline<Block>;
```

Defined in: [alfa-dom/src/style/rule/layer.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/layer.ts)

## Parameters

### json

[`JSON`](JSON.md)

### fromRule

(`json`: [`JSON`](../../JSON.md)) => `Trampoline`\<[`Rule`](../../../Rule-1.md)\>

## Returns

`Trampoline`\<[`Block`](../Block-1.md)\>
