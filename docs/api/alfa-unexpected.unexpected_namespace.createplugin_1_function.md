<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-unexpected](./alfa-unexpected.md) &gt; [Unexpected](./alfa-unexpected.unexpected_namespace.md) &gt; [createPlugin](./alfa-unexpected.unexpected_namespace.createplugin_1_function.md)

## Unexpected.createPlugin() function

<b>Signature:</b>

```typescript
function createPlugin<I, J, T = unknown, Q = never>(transform: Mapper<I, Future.Maybe<J>>, rules: Iterable<Rule<J, T, Q>>, handlers?: Iterable<Handler<J, T, Q>>, options?: Asserter.Options): unexpected.PluginDefinition;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  transform | [Mapper](./alfa-mapper.mapper_typealias.md)<!-- -->&lt;I, [Future.Maybe](./alfa-future.future_namespace.maybe_typealias.md)<!-- -->&lt;J&gt;&gt; |  |
|  rules | Iterable&lt;[Rule](./alfa-act.rule_class.md)<!-- -->&lt;J, T, Q&gt;&gt; |  |
|  handlers | Iterable&lt;[Handler](./alfa-assert.handler_interface.md)<!-- -->&lt;J, T, Q&gt;&gt; |  |
|  options | [Asserter.Options](./alfa-assert.asserter_namespace.options_interface.md) |  |

<b>Returns:</b>

unexpected.PluginDefinition

