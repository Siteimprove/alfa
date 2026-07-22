# Function: type()

```ts
function type<N extends string = string>(
   name: N, 
   publicId?: string, 
   systemId?: string, 
   externalId?: string, 
   internalId?: string, 
   extraData?: any
): Type<N>;
```
