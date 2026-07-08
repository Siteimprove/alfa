# Function: fromElement()

```ts
function fromElement<N>(
   json: JSON<N>, 
   fromNode: (json: JSON, device?: Device) => Trampoline<Node>, 
device?: Device): Trampoline<Element<N>>;
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

## Type Parameters

### N

`N` *extends* `string` = `string`

## Parameters

### json

[`JSON`](JSON.md)\<`N`\>

### fromNode

(`json`: [`JSON`](../Node/JSON.md), `device?`: `Device`) => `Trampoline`\<[`Node`](../Node-1.md)\>

### device?

`Device`

## Returns

`Trampoline`\<[`Element`](../Element-1.md)\<`N`\>\>
