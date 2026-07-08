# Function: fromImportRule()

```ts
function fromImportRule(
   json, 
   fromRule, 
sheetFactory): Trampoline<Import>;
```

Defined in: [alfa-dom/src/style/rule/import.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/import.ts)

## Parameters

### json

[`JSON`](JSON.md)

### fromRule

(`json`) => `Trampoline`\<[`Rule`](../../Rule-1.md)\>

### sheetFactory

(`rules`) => [`Sheet`](../../Sheet-1.md)

## Returns

`Trampoline`\<[`Import`](../Import-1.md)\>
