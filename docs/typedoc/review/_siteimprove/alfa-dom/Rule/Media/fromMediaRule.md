# Function: fromMediaRule()

```ts
function fromMediaRule(json: JSON, fromRule: (json: JSON) => Trampoline<Rule>): Trampoline<Media>;
```

Defined in: [alfa-dom/src/style/rule/media.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/media.ts)

## Parameters

### json

[`JSON`](JSON.md)

### fromRule

(`json`: [`JSON`](../JSON.md)) => `Trampoline`\<[`Rule`](../../Rule-1.md)\>

## Returns

`Trampoline`\<[`Media`](../Media-2.md)\>
