# Function: fromDocument()

```typescript
function fromDocument(
   json: JSON, 
   fromNode: (json: JSON, device?: Device) => Trampoline<Node>, 
   device?: Device
): Trampoline<Document>;
```
