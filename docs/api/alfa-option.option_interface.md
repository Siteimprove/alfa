<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-option](./alfa-option.md) &gt; [Option](./alfa-option.option_interface.md)

## Option interface


<b>Signature:</b>

```typescript
export interface Option<T> extends Functor<T>, Monad<T>, Foldable<T>, Applicative<T>, Iterable<T>, Equatable, Hashable, Serializable<Option.JSON<T>> 
```
<b>Extends:</b> [Functor](./alfa-functor.functor_interface.md)<!-- -->&lt;T&gt;, [Monad](./alfa-monad.monad_interface.md)<!-- -->&lt;T&gt;, [Foldable](./alfa-foldable.foldable_interface.md)<!-- -->&lt;T&gt;, [Applicative](./alfa-applicative.applicative_interface.md)<!-- -->&lt;T&gt;, Iterable&lt;T&gt;, [Equatable](./alfa-equatable.equatable_interface.md)<!-- -->, [Hashable](./alfa-hash.hashable_interface.md)<!-- -->, [Serializable](./alfa-json.serializable_interface.md)<!-- -->&lt;[Option.JSON](./alfa-option.option_namespace.json_typealias.md)<!-- -->&lt;T&gt;&gt;

## Methods

|  Method | Description |
|  --- | --- |
|  [and(option)](./alfa-option.option_interface.and_1_methodsignature.md) |  |
|  [andThen(option)](./alfa-option.option_interface.andthen_1_methodsignature.md) |  |
|  [apply(mapper)](./alfa-option.option_interface.apply_1_methodsignature.md) |  |
|  [compareWith(option, comparer)](./alfa-option.option_interface.comparewith_1_methodsignature.md) |  |
|  [every(predicate)](./alfa-option.option_interface.every_1_methodsignature.md) |  |
|  [filter(refinement)](./alfa-option.option_interface.filter_1_methodsignature.md) |  |
|  [filter(predicate)](./alfa-option.option_interface.filter_2_methodsignature.md) |  |
|  [flatMap(mapper)](./alfa-option.option_interface.flatmap_1_methodsignature.md) |  |
|  [get()](./alfa-option.option_interface.get_1_methodsignature.md) |  |
|  [getOr(value)](./alfa-option.option_interface.getor_1_methodsignature.md) |  |
|  [getOrElse(value)](./alfa-option.option_interface.getorelse_1_methodsignature.md) |  |
|  [includes(value)](./alfa-option.option_interface.includes_1_methodsignature.md) |  |
|  [isNone()](./alfa-option.option_interface.isnone_1_methodsignature.md) |  |
|  [isSome()](./alfa-option.option_interface.issome_1_methodsignature.md) |  |
|  [map(mapper)](./alfa-option.option_interface.map_1_methodsignature.md) |  |
|  [none(predicate)](./alfa-option.option_interface.none_1_methodsignature.md) |  |
|  [or(option)](./alfa-option.option_interface.or_1_methodsignature.md) |  |
|  [orElse(option)](./alfa-option.option_interface.orelse_1_methodsignature.md) |  |
|  [reduce(reducer, accumulator)](./alfa-option.option_interface.reduce_1_methodsignature.md) |  |
|  [reject(refinement)](./alfa-option.option_interface.reject_1_methodsignature.md) |  |
|  [reject(predicate)](./alfa-option.option_interface.reject_2_methodsignature.md) |  |
|  [some(predicate)](./alfa-option.option_interface.some_1_methodsignature.md) |  |
|  [toArray()](./alfa-option.option_interface.toarray_1_methodsignature.md) |  |
|  [toJSON()](./alfa-option.option_interface.tojson_1_methodsignature.md) |  |

