# Function: fromFinding()

```ts
function fromFinding<I, T extends Hashable, Q extends Metadata, S>(rule: Rule<I, T, Q, S>, target: T): (finding: Finding<Iterable<[string, Option<Result<Diagnostic, Diagnostic>>]>>) => Applicable<I, T, Q, S>;
```
