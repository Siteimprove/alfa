# Function: fromElement()

```typescript
function fromElement<N extends string = string>(
   json: JSON<N>, 
   fromNode: (json: JSON, device?: Device) => Trampoline<Node>, 
   device?: Device
): Trampoline<Element<N>>;
```
