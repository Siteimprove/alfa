# Function: fromImportRule()

```typescript
function fromImportRule(
   json: JSON, 
   fromRule: (json: JSON) => Trampoline<Rule>, 
   sheetFactory: (rules: Iterable<Rule>) => Sheet
): Trampoline<Import>;
```
