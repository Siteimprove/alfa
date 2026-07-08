# Function: fromKeyframesRule()

```ts
function fromKeyframesRule(json: JSON, fromRule: (json: JSON) => Trampoline<Rule>): Trampoline<Keyframes>;
```

Defined in: [alfa-dom/src/style/rule/keyframes.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/keyframes.ts)

## Parameters

### json

[`JSON`](JSON.md)

### fromRule

(`json`: [`JSON`](../JSON.md)) => `Trampoline`\<[`Rule`](../../Rule-1.md)\>

## Returns

`Trampoline`\<[`Keyframes`](../Keyframes-2.md)\>
