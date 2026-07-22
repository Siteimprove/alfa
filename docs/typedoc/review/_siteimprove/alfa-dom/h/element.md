# Function: `element()`

```ts
function element<N extends string = string>(
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
   extraData?: any
): Element<N>;
```
