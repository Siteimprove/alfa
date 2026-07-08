# Function: fromImportRule()

```ts
function fromImportRule(
   json: JSON, 
   fromRule: (json: JSON) => Trampoline<Rule>, 
sheetFactory: (rules: Iterable<Rule>) => Sheet): Trampoline<Import>;
```

Defined in: [alfa-dom/src/style/rule/import.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/import.ts)

## Parameters

### json

[`JSON`](JSON.md)

### fromRule

(`json`: [`JSON`](../JSON.md)) => `Trampoline`\<[`Rule`](../../Rule-1.md)\>

### sheetFactory

(`rules`: `Iterable`\<[`Rule`](../../Rule-1.md)\>) => [`Sheet`](../../Sheet-1.md)

## Returns

`Trampoline`\<[`Import`](../Import-1.md)\>
