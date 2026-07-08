# Function: fromRule()

```ts
function fromRule(sheetFactory: (rules: Iterable<Rule>) => Sheet): (json: JSON) => Trampoline<Rule>;
```

Defined in: [alfa-dom/src/style/rule/index.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/index.ts)

## Parameters

### sheetFactory

(`rules`: `Iterable`\<[`Rule`](../Rule-1.md)\>) => [`Sheet`](../Sheet-1.md)

## Returns

(`json`: [`JSON`](JSON.md)) => `Trampoline`\<[`Rule`](../Rule-1.md)\>
