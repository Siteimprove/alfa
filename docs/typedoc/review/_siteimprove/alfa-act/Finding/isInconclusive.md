# Function: isInconclusive()

```ts
function isInconclusive<D extends Diagnostic>(finding: Finding<unknown, D>): finding is Right<[D, boolean]>;
```
