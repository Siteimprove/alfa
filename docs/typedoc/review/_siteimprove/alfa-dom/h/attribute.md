# Function: attribute()

```typescript
function attribute<N extends string = string>(
   name: N, 
   value: string, 
   externalId?: string, 
   internalId?: string, 
   extraData?: any
): Attribute<N>;
```
