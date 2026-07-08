# Interface: EARL

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

## Extends

- `EARL`

## Indexable

```ts
[key: string]: JSON | undefined
```

## @context

### @context

```ts
@context: object;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### dct

##### dct

```ts
dct: "http://purl.org/dc/terms/";
```

#### earl

##### earl

```ts
earl: "http://www.w3.org/ns/earl#";
```

#### Overrides

```ts
earl.EARL.@context
```

## @id

### @id

```ts
@id: string;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

## @type

### @type

```ts
@type: ["earl:TestCriterion", "earl:TestCase"];
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

## dct:isPartOf

### dct:isPartOf

```ts
dct:isPartOf: object;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### @set

##### @set

```ts
@set: Array<EARL>;
```
