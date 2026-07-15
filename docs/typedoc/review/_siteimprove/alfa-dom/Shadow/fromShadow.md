# Function: fromShadow()

```typescript
function fromShadow(
   json: JSON, 
   fromNode: (json: JSON, device?: Device) => Trampoline<Node>, 
   device?: Device
): Trampoline<Shadow>;
```
