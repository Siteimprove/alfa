# Interface: EARL

## Extends

- [`EARL`](../EARL.md)

## Indexable

```ts
[key: string]: JSON | undefined
```

## @context

### @context?

```ts
optional @context?: {
  cnt?: "http://www.w3.org/2011/content#";
  dct?: "http://purl.org/dc/terms/";
  doap?: "http://usefulinc.com/ns/doap#";
  earl?: "http://www.w3.org/ns/earl#";
  foaf?: "http://xmlns.com/foaf/0.1/";
  http?: "http://www.w3.org/2011/http#";
  ptr?: "http://www.w3.org/2009/pointers#";
};
```

#### cnt

##### cnt?

```ts
optional cnt?: "http://www.w3.org/2011/content#";
```

#### dct

##### dct?

```ts
optional dct?: "http://purl.org/dc/terms/";
```

#### doap

##### doap?

```ts
optional doap?: "http://usefulinc.com/ns/doap#";
```

#### earl

##### earl?

```ts
optional earl?: "http://www.w3.org/ns/earl#";
```

#### foaf

##### foaf?

```ts
optional foaf?: "http://xmlns.com/foaf/0.1/";
```

#### http

##### http?

```ts
optional http?: "http://www.w3.org/2011/http#";
```

#### ptr

##### ptr?

```ts
optional ptr?: "http://www.w3.org/2009/pointers#";
```

#### Inherited from

[`EARL`](../EARL.md).[`@context`](../EARL.md#context)

## @type

### @type

```ts
@type: "earl:Assertion";
```

#### Inherited from

[`EARL`](../EARL.md).[`@type`](../EARL.md#type)

## earl:mode

### earl:mode

```ts
earl:mode: "earl:automatic" | "earl:semiAuto" | "earl:manual";
```

#### Inherited from

[`EARL`](../EARL.md).[`earl:mode`](../EARL.md#earlmode)

## earl:result

### earl:result

```ts
earl:result: {
  @type: "earl:TestResult";
  earl:info: string;
  earl:outcome: {
     @id: "earl:failed";
  };
  earl:pointer?: EARL;
};
```

#### @type

##### @type

```ts
@type: "earl:TestResult";
```

#### earl:info

##### earl:info

```ts
earl:info: string;
```

#### earl:outcome

##### earl:outcome

```ts
earl:outcome: {
  @id: "earl:failed";
};
```

###### earl:outcome.@id

```ts
@id: "earl:failed";
```

#### earl:pointer

##### earl:pointer?

```ts
optional earl:pointer?: EARL;
```

## earl:test

### earl:test

```ts
earl:test: {
  @id: string;
};
```

#### @id

##### @id

```ts
@id: string;
```

#### Inherited from

[`EARL`](../EARL.md).[`earl:test`](../EARL.md#earltest)
