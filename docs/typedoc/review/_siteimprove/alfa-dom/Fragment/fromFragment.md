# Function: fromFragment()

```ts
function fromFragment(
   json: JSON, 
   fromNode: (json: JSON, device?: Device) => Trampoline<Node>, 
device?: Device): Trampoline<Fragment>;
```

Defined in: [alfa-dom/src/node/fragment.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/fragment.ts)

## Parameters

### json

[`JSON`](JSON.md)

### fromNode

(`json`: [`JSON`](../Node/JSON.md), `device?`: `Device`) => `Trampoline`\<[`Node`](../Node-1.md)\>

### device?

`Device`

## Returns

`Trampoline`\<[`Fragment`](../Fragment-1.md)\>
