# Type Alias: Oracle\<INPUT, TARGET, QUESTION, SUBJECT\>

```ts
type Oracle<INPUT, TARGET, QUESTION, SUBJECT> = (rule: Rule<INPUT, TARGET, QUESTION, SUBJECT>, question: { [URI in keyof QUESTION]: Question<QUESTION[URI][0], SUBJECT, TARGET, QUESTION[URI][1], unknown, URI extends string ? URI : never> }[keyof QUESTION]) => Promise<Option<QUESTION[keyof QUESTION][1]>>;
```

Defined in: [alfa-act/src/expectation/oracle.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/oracle.ts)

## Type Parameters

### INPUT

`INPUT`

### TARGET

`TARGET` *extends* `Hashable`

### QUESTION

`QUESTION` *extends* [`Metadata`](Question/Metadata.md)

### SUBJECT

`SUBJECT`

## Parameters

### rule

[`Rule`](Rule-1.md)\<`INPUT`, `TARGET`, `QUESTION`, `SUBJECT`\>

### question

`{ [URI in keyof QUESTION]: Question<QUESTION[URI][0], SUBJECT, TARGET, QUESTION[URI][1], unknown, URI extends string ? URI : never> }`\[keyof `QUESTION`\]

## Returns

`Promise`\<`Option`\<`QUESTION`\[keyof `QUESTION`\]\[`1`\]\>\>
