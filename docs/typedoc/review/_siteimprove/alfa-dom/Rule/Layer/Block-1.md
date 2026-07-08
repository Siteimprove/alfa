# Class: Block

Defined in: [alfa-dom/src/style/rule/layer.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/layer.ts)

## Extends

- [`Grouping`](../Grouping-1.md)\<`"layer-block"`\>

## Constructors

### Constructor

```ts
protected new Block(layer: Option<string>, rules: Array<Rule>): BlockRule;
```

Defined in: [alfa-dom/src/style/rule/layer.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/layer.ts)

#### Parameters

##### layer

`Option`\<`string`\>

##### rules

`Array`\<[`Rule`](../../Rule-1.md)\>

#### Returns

`BlockRule`

#### Overrides

[`Grouping`](../Grouping-1.md).[`constructor`](../Grouping-1.md#constructor)

## _attachOwner

### \_attachOwner()

```ts
_attachOwner(owner: Sheet): boolean;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Parameters

##### owner

[`Sheet`](../../Sheet-1.md)

#### Returns

`boolean`

#### Inherited from

[`Grouping`](../Grouping-1.md).[`_attachOwner`](../Grouping-1.md#_attachowner)

## _attachParent

### \_attachParent()

```ts
_attachParent(parent: Rule): boolean;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Parameters

##### parent

[`Rule`](../../Rule-1.md)

#### Returns

`boolean`

#### Inherited from

[`Grouping`](../Grouping-1.md).[`_attachParent`](../Grouping-1.md#_attachparent)

## _owner

### \_owner

```ts
protected _owner: Option<Sheet> = None;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Inherited from

[`Grouping`](../Grouping-1.md).[`_owner`](../Grouping-1.md#_owner)

## _parent

### \_parent

```ts
protected _parent: Option<Rule> = None;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Inherited from

[`Grouping`](../Grouping-1.md).[`_parent`](../Grouping-1.md#_parent)

## _rules

### \_rules

```ts
protected readonly _rules: Array<Rule>;
```

Defined in: [alfa-dom/src/style/rule/grouping.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/grouping.ts)

#### Inherited from

[`Grouping`](../Grouping-1.md).[`_rules`](../Grouping-1.md#_rules)

## ancestors

### ancestors()

```ts
ancestors(): Iterable<Rule>;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Returns

`Iterable`\<[`Rule`](../../Rule-1.md)\>

#### Inherited from

[`Grouping`](../Grouping-1.md).[`ancestors`](../Grouping-1.md#ancestors)

## children

### children()

```ts
children(): Iterable<Rule>;
```

Defined in: [alfa-dom/src/style/rule/grouping.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/grouping.ts)

#### Returns

`Iterable`\<[`Rule`](../../Rule-1.md)\>

#### Inherited from

[`Grouping`](../Grouping-1.md).[`children`](../Grouping-1.md#children)

## descendants

### descendants()

```ts
descendants(): Iterable<Rule>;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Returns

`Iterable`\<[`Rule`](../../Rule-1.md)\>

#### Inherited from

[`Grouping`](../Grouping-1.md).[`descendants`](../Grouping-1.md#descendants)

## equals

### equals()

```ts
equals(value: unknown): value is Block;
```

Defined in: [alfa-dom/src/style/rule/layer.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/layer.ts)

#### Parameters

##### value

`unknown`

#### Returns

`value is Block`

#### Overrides

[`Grouping`](../Grouping-1.md).[`equals`](../Grouping-1.md#equals)

## layer

### layer

#### Get Signature

```ts
get layer(): Option<string>;
```

Defined in: [alfa-dom/src/style/rule/layer.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/layer.ts)

##### Returns

`Option`\<`string`\>

## of

### of()

```ts
static of(rules: Iterable<Rule>, layer?: string | null): BlockRule;
```

Defined in: [alfa-dom/src/style/rule/layer.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/layer.ts)

#### Parameters

##### rules

`Iterable`\<[`Rule`](../../Rule-1.md)\>

##### layer?

`string` \| `null`

#### Returns

`BlockRule`

## owner

### owner

#### Get Signature

```ts
get owner(): Option<Sheet>;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

##### Returns

`Option`\<[`Sheet`](../../Sheet-1.md)\>

#### Inherited from

[`Grouping`](../Grouping-1.md).[`owner`](../Grouping-1.md#owner)

## parent

### parent

#### Get Signature

```ts
get parent(): Option<Rule>;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

##### Returns

`Option`\<[`Rule`](../../Rule-1.md)\>

#### Inherited from

[`Grouping`](../Grouping-1.md).[`parent`](../Grouping-1.md#parent)

## rules

### rules

#### Get Signature

```ts
get rules(): Iterable<Rule>;
```

Defined in: [alfa-dom/src/style/rule/grouping.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/grouping.ts)

##### Returns

`Iterable`\<[`Rule`](../../Rule-1.md)\>

#### Inherited from

[`Grouping`](../Grouping-1.md).[`rules`](../Grouping-1.md#rules)

## toJSON

### toJSON()

```ts
toJSON(): JSON;
```

Defined in: [alfa-dom/src/style/rule/layer.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/layer.ts)

#### Returns

[`JSON`](Block/JSON.md)

#### Overrides

[`Grouping`](../Grouping-1.md).[`toJSON`](../Grouping-1.md#tojson)

## toString

### toString()

```ts
toString(): string;
```

Defined in: [alfa-dom/src/style/rule/layer.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/layer.ts)

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

[`Grouping`](../Grouping-1.md).[`type`](../Grouping-1.md#type)
