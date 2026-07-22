# Function: `fromFragment()`

```ts
function fromFragment(
   json: JSON, 
   fromNode: (json: JSON, device?: Device) => Trampoline<Node>, 
   device?: Device
): Trampoline<Fragment>;
```
