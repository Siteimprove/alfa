# Function: fromDocument()

```ts
function fromDocument(
   json: JSON, 
   fromNode: (json: JSON, device?: Device) => Trampoline<Node>, 
device?: Device): Trampoline<Document>;
```

Defined in: [alfa-dom/src/node/document.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/document.ts)

## Parameters

### json

[`JSON`](JSON.md)

### fromNode

(`json`: [`JSON`](../Node/JSON.md), `device?`: `Device`) => `Trampoline`\<[`Node`](../Node-1.md)\>

### device?

`Device`

## Returns

`Trampoline`\<[`Document`](../Document-1.md)\>
