# Function: `conduct()`

```ts
function conduct<INPUT, TARGET extends Hashable, QUESTION extends Metadata, SUBJECT, ANSWER>(
   interview: Interview<QUESTION, SUBJECT, TARGET, ANSWER>, 
   rule: Rule<INPUT, TARGET, QUESTION, SUBJECT>, 
   oracle: Oracle<INPUT, TARGET, QUESTION, SUBJECT>, 
   oracleUsed?: boolean
): Promise<Finding<ANSWER>>;
```
