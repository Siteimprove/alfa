# Function: fromShadow()

```ts
function fromShadow(
   json: JSON, 
   fromNode: (json: JSON, device?: Device) => Trampoline<Node>, 
device?: Device): Trampoline<Shadow>;
```

Defined in: [alfa-dom/src/node/shadow.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/shadow.ts)

## Parameters

### json

[`JSON`](JSON.md)

### fromNode

(`json`: [`JSON`](../Node/JSON.md), `device?`: `Device`) => `Trampoline`\<[`Node`](../Node-1.md)\>

### device?

`Device`

## Returns

`Trampoline`\<[`Shadow`](../Shadow-1.md)\>
