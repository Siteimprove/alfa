<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-command](./alfa-command.md) &gt; [Command](./alfa-command.command_namespace.md) &gt; [Flags](./alfa-command.command_namespace.flags_namespace.md) &gt; [Values](./alfa-command.command_namespace.flags_namespace.values_typealias.md)

## Command.Flags.Values type

<b>Signature:</b>

```typescript
type Values<F extends Flags> = {
            [N in keyof F]: F[N] extends Flag<infer T> ? T : never;
        };
```
<b>References:</b> [Flags](./alfa-command.command_namespace.flags_interface.md)<!-- -->, [Flag](./alfa-command.flag_class.md)

