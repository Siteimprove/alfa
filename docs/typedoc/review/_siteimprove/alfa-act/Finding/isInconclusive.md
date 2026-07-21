# Function: isInconclusive()

```typescript
function isInconclusive<D extends Diagnostic>(finding: Finding<unknown, D>): finding is Right<[D, boolean]>;
```
