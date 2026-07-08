# Function: conduct()

```ts
function conduct<INPUT, TARGET, QUESTION, SUBJECT, ANSWER>(
   interview: Interview<QUESTION, SUBJECT, TARGET, ANSWER>, 
   rule: Rule<INPUT, TARGET, QUESTION, SUBJECT>, 
   oracle: Oracle<INPUT, TARGET, QUESTION, SUBJECT>, 
oracleUsed?: boolean): Promise<Finding<ANSWER>>;
```

Defined in: [alfa-act/src/expectation/interview.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/interview.ts)

## Type Parameters

### INPUT

`INPUT`

### TARGET

`TARGET` *extends* `Hashable`

### QUESTION

`QUESTION` *extends* [`Metadata`](../Question/Metadata.md)

### SUBJECT

`SUBJECT`

### ANSWER

`ANSWER`

## Parameters

### interview

[`Interview`](../Interview-1.md)\<`QUESTION`, `SUBJECT`, `TARGET`, `ANSWER`\>

### rule

[`Rule`](../Rule-1.md)\<`INPUT`, `TARGET`, `QUESTION`, `SUBJECT`\>

### oracle

[`Oracle`](../Oracle.md)\<`INPUT`, `TARGET`, `QUESTION`, `SUBJECT`\>

### oracleUsed?

`boolean` = `false`

## Returns

`Promise`\<[`Finding`](../Finding-1.md)\<`ANSWER`\>\>
