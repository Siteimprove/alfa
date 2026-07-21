# Interface: EARL

## Extends

- `EARL`

## Indexable

```ts
[key: string]: JSON | undefined
```

## @context

### @context

```ts
@context: {
  dct: "http://purl.org/dc/terms/";
  earl: "http://www.w3.org/ns/earl#";
};
```

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

## @type

### @type

```ts
@type: ["earl:TestCriterion", "earl:TestCase"];
```

## dct:isPartOf

### dct:isPartOf

```ts
dct:isPartOf: {
  @set: Array<EARL>;
};
```

#### @set

##### @set

```ts
@set: Array<EARL>;
```
