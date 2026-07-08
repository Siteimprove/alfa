# Abstract Class: Grouping\<T\>

Defined in: [alfa-dom/src/style/rule/grouping.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/grouping.ts)

## Extends

- `BaseRule`\<`T`\>

## Extended by

- [`Keyframes`](Keyframes-2.md)
- [`Block`](Layer/Block-1.md)

## Type Parameters

### T

`T` *extends* `string` = `string`

## Constructors

### Constructor

```ts
protected new Grouping<T>(type, rules): GroupingRule<T>;
```

Defined in: [alfa-dom/src/style/rule/grouping.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/grouping.ts)

#### Parameters

##### type

`T`

##### rules

`Array`\<[`Rule`](../Rule-1.md)\>

#### Returns

`GroupingRule`\<`T`\>

#### Overrides

```ts
BaseRule<T>.constructor
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
BaseRule._attachOwner
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
BaseRule._attachParent
```

## _owner

### \_owner

```ts
protected _owner: Option<Sheet> = None;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Inherited from

```ts
BaseRule._owner
```

## _parent

### \_parent

```ts
protected _parent: Option<Rule> = None;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Inherited from

```ts
BaseRule._parent
```

## _rules

### \_rules

```ts
protected readonly _rules: Array<Rule>;
```

Defined in: [alfa-dom/src/style/rule/grouping.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/grouping.ts)

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
BaseRule.ancestors
```

## children

### children()

```ts
children(): Iterable<Rule>;
```

Defined in: [alfa-dom/src/style/rule/grouping.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/grouping.ts)

#### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Overrides

```ts
BaseRule.children
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
BaseRule.descendants
```

## equals

### equals()

```ts
equals(value): value is Grouping<T>;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Parameters

##### value

`unknown`

#### Returns

`value is Grouping<T>`

#### Inherited from

```ts
BaseRule.equals
```

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
BaseRule.owner
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
BaseRule.parent
```

## rules

### rules

#### Get Signature

```ts
get rules(): Iterable<Rule>;
```

Defined in: [alfa-dom/src/style/rule/grouping.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/grouping.ts)

##### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

## toJSON

### toJSON()

```ts
toJSON(): JSON<T>;
```

Defined in: [alfa-dom/src/style/rule/grouping.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/grouping.ts)

#### Returns

[`JSON`](Grouping/JSON.md)\<`T`\>

#### Overrides

```ts
BaseRule.toJSON
```

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
BaseRule.type
```
