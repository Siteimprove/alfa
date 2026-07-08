# Function: element()

```ts
function element<N>(
   name: N, 
   attributes?: 
  | Attribute<string>[]
  | Record<string, string | boolean>, 
   children?: (string | Node)[], 
   style?: Record<string, string> | Declaration[], 
   namespace?: Namespace, 
   box?: Rectangle, 
   device?: Device, 
   externalId?: string, 
   internalId?: string, 
extraData?: any): Element<N>;
```

Defined in: [alfa-dom/src/h.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/h.ts)

## Type Parameters

### N

`N` *extends* `string` = `string`

## Parameters

### name

`N`

### attributes?

  \| [`Attribute`](../Attribute-1.md)\<`string`\>[]
  \| `Record`\<`string`, `string` \| `boolean`\>

### children?

(`string` \| [`Node`](../Node-1.md))[] = `[]`

### style?

`Record`\<`string`, `string`\> \| [`Declaration`](../Declaration-1.md)[]

### namespace?

[`Namespace`](../Namespace-1.md)

### box?

`Rectangle`

### device?

`Device`

### externalId?

`string`

### internalId?

`string`

### extraData?

`any`

## Returns

[`Element`](../Element-1.md)\<`N`\>
