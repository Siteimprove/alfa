# Function: fromElement()

```ts
function fromElement<N>(
   json, 
   fromNode, 
device?): Trampoline<Element<N>>;
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

## Type Parameters

### N

`N` *extends* `string` = `string`

## Parameters

### json

[`JSON`](JSON.md)\<`N`\>

### fromNode

(`json`, `device?`) => `Trampoline`\<[`Node`](../Node-1.md)\>

### device?

`Device`

## Returns

`Trampoline`\<[`Element`](../Element-1.md)\<`N`\>\>
