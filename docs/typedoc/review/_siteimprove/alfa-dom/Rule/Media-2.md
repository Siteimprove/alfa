# Class: Media

Defined in: [alfa-dom/src/style/rule/media.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/media.ts)

## Extends

- `ConditionRule`\<`"media"`\>

## Constructors

### Constructor

```ts
protected new Media(condition, rules): MediaRule;
```

Defined in: [alfa-dom/src/style/rule/media.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/media.ts)

#### Parameters

##### condition

`string`

##### rules

[`Rule`](../Rule-1.md)[]

#### Returns

`MediaRule`

#### Overrides

```ts
ConditionRule<"media">.constructor
```

## _attachOwner

### \_attachOwner()

```ts
_attachOwner(owner): boolean;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Parameters

##### owner

[`Sheet`](../Sheet-1.md)

#### Returns

`boolean`

#### Inherited from

```ts
ConditionRule._attachOwner
```

## _attachParent

### \_attachParent()

```ts
_attachParent(parent): boolean;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Parameters

##### parent

[`Rule`](../Rule-1.md)

#### Returns

`boolean`

#### Inherited from

```ts
ConditionRule._attachParent
```

## _condition

### \_condition

```ts
protected readonly _condition: string;
```

Defined in: [alfa-dom/src/style/rule/condition.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/condition.ts)

#### Inherited from

```ts
ConditionRule._condition
```

## _owner

### \_owner

```ts
protected _owner: Option<Sheet> = None;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Inherited from

```ts
ConditionRule._owner
```

## _parent

### \_parent

```ts
protected _parent: Option<Rule> = None;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Inherited from

```ts
ConditionRule._parent
```

## _rules

### \_rules

```ts
protected readonly _rules: Array<Rule>;
```

Defined in: [alfa-dom/src/style/rule/grouping.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/grouping.ts)

#### Inherited from

```ts
ConditionRule._rules
```

## ancestors

### ancestors()

```ts
ancestors(): Iterable<Rule>;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

```ts
ConditionRule.ancestors
```

## children

### children()

```ts
children(): Iterable<Rule>;
```

Defined in: [alfa-dom/src/style/rule/grouping.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/grouping.ts)

#### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

```ts
ConditionRule.children
```

## condition

### condition

#### Get Signature

```ts
get condition(): string;
```

Defined in: [alfa-dom/src/style/rule/condition.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/condition.ts)

##### Returns

`string`

#### Inherited from

```ts
ConditionRule.condition
```

## descendants

### descendants()

```ts
descendants(): Iterable<Rule>;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

```ts
ConditionRule.descendants
```

## equals

### equals()

```ts
equals(value): value is Media;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Parameters

##### value

`unknown`

#### Returns

`value is Media`

#### Inherited from

```ts
ConditionRule.equals
```

## of

### of()

```ts
static of(condition, rules): MediaRule;
```

Defined in: [alfa-dom/src/style/rule/media.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/media.ts)

#### Parameters

##### condition

`string`

##### rules

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Returns

`MediaRule`

## owner

### owner

#### Get Signature

```ts
get owner(): Option<Sheet>;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

##### Returns

`Option`\<[`Sheet`](../Sheet-1.md)\>

#### Inherited from

```ts
ConditionRule.owner
```

## parent

### parent

#### Get Signature

```ts
get parent(): Option<Rule>;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

##### Returns

`Option`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

```ts
ConditionRule.parent
```

## queries

### queries

#### Get Signature

```ts
get queries(): List;
```

Defined in: [alfa-dom/src/style/rule/media.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/media.ts)

##### Returns

`List`

## rules

### rules

#### Get Signature

```ts
get rules(): Iterable<Rule>;
```

Defined in: [alfa-dom/src/style/rule/grouping.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/grouping.ts)

##### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

```ts
ConditionRule.rules
```

## toJSON

### toJSON()

```ts
toJSON(): JSON;
```

Defined in: [alfa-dom/src/style/rule/media.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/media.ts)

#### Returns

[`JSON`](Media/JSON.md)

#### Overrides

```ts
ConditionRule.toJSON
```

## toString

### toString()

```ts
toString(): string;
```

Defined in: [alfa-dom/src/style/rule/media.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/media.ts)

#### Returns

`string`

## type

### type

#### Get Signature

```ts
get type(): T;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

##### Returns

`T`

#### Inherited from

```ts
ConditionRule.type
```
