# Class: Keyframes

Defined in: [alfa-dom/src/style/rule/keyframes.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/keyframes.ts)

## Extends

- [`Grouping`](Grouping-1.md)\<`"keyframes"`\>

## Constructors

### Constructor

```ts
protected new Keyframes(name: string, rules: Rule[]): KeyframesRule;
```

Defined in: [alfa-dom/src/style/rule/keyframes.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/keyframes.ts)

#### Parameters

##### name

`string`

##### rules

[`Rule`](../Rule-1.md)[]

#### Returns

`KeyframesRule`

#### Overrides

[`Grouping`](Grouping-1.md).[`constructor`](Grouping-1.md#constructor)

## _attachOwner

### \_attachOwner()

```ts
_attachOwner(owner: Sheet): boolean;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Parameters

##### owner

[`Sheet`](../Sheet-1.md)

#### Returns

`boolean`

#### Inherited from

[`Grouping`](Grouping-1.md).[`_attachOwner`](Grouping-1.md#_attachowner)

## _attachParent

### \_attachParent()

```ts
_attachParent(parent: Rule): boolean;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Parameters

##### parent

[`Rule`](../Rule-1.md)

#### Returns

`boolean`

#### Inherited from

[`Grouping`](Grouping-1.md).[`_attachParent`](Grouping-1.md#_attachparent)

## _owner

### \_owner

```ts
protected _owner: Option<Sheet> = None;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Inherited from

[`Grouping`](Grouping-1.md).[`_owner`](Grouping-1.md#_owner)

## _parent

### \_parent

```ts
protected _parent: Option<Rule> = None;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Inherited from

[`Grouping`](Grouping-1.md).[`_parent`](Grouping-1.md#_parent)

## _rules

### \_rules

```ts
protected readonly _rules: Array<Rule>;
```

Defined in: [alfa-dom/src/style/rule/grouping.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/grouping.ts)

#### Inherited from

[`Grouping`](Grouping-1.md).[`_rules`](Grouping-1.md#_rules)

## ancestors

### ancestors()

```ts
ancestors(): Iterable<Rule>;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

[`Grouping`](Grouping-1.md).[`ancestors`](Grouping-1.md#ancestors)

## children

### children()

```ts
children(): Iterable<Rule>;
```

Defined in: [alfa-dom/src/style/rule/grouping.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/grouping.ts)

#### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

[`Grouping`](Grouping-1.md).[`children`](Grouping-1.md#children)

## descendants

### descendants()

```ts
descendants(): Iterable<Rule>;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

[`Grouping`](Grouping-1.md).[`descendants`](Grouping-1.md#descendants)

## equals

### equals()

```ts
equals(value: unknown): value is Keyframes;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Parameters

##### value

`unknown`

#### Returns

`value is Keyframes`

#### Inherited from

[`Grouping`](Grouping-1.md).[`equals`](Grouping-1.md#equals)

## name

### name

#### Get Signature

```ts
get name(): string;
```

Defined in: [alfa-dom/src/style/rule/keyframes.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/keyframes.ts)

##### Returns

`string`

## of

### of()

```ts
static of(name: string, rules: Iterable<Rule>): KeyframesRule;
```

Defined in: [alfa-dom/src/style/rule/keyframes.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/keyframes.ts)

#### Parameters

##### name

`string`

##### rules

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Returns

`KeyframesRule`

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

[`Grouping`](Grouping-1.md).[`owner`](Grouping-1.md#owner)

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

[`Grouping`](Grouping-1.md).[`parent`](Grouping-1.md#parent)

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

[`Grouping`](Grouping-1.md).[`rules`](Grouping-1.md#rules)

## toJSON

### toJSON()

```ts
toJSON(): JSON;
```

Defined in: [alfa-dom/src/style/rule/keyframes.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/keyframes.ts)

#### Returns

[`JSON`](Keyframes/JSON.md)

#### Overrides

[`Grouping`](Grouping-1.md).[`toJSON`](Grouping-1.md#tojson)

## toString

### toString()

```ts
toString(): string;
```

Defined in: [alfa-dom/src/style/rule/keyframes.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/keyframes.ts)

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

[`Grouping`](Grouping-1.md).[`type`](Grouping-1.md#type)
