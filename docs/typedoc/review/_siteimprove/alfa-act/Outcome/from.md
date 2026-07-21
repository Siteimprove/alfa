# Function: from()

```typescript
function from<I, T extends Hashable, Q extends Metadata, S>(
   rule: Rule<I, T, Q, S>, 
   target: T, 
   expectations: Record<{
[key: string]: Option<Result<Diagnostic, Diagnostic>>;
}>, 
   mode: Mode
): Applicable<I, T, Q, S>;
```
