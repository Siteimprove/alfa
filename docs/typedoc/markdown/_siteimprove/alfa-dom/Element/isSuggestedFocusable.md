[**Alfa API documentation**](../../../README.md)

***

[Alfa API documentation](../../../README.md) / [@siteimprove/alfa-dom](../../alfa-dom.md) / [Element](../Element.md) / isSuggestedFocusable

# Variable: isSuggestedFocusable

> **isSuggestedFocusable**: (`element`) => `boolean`

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

[https://html.spec.whatwg.org/multipage/#tabindex-value](https://html.spec.whatwg.org/multipage/#tabindex-value)

## Parameters

| Parameter | Type |
| ------ | ------ |
| `element` | [`Element`](../Element-1.md) |

## Returns

`boolean`

## Remarks

Draggable elements for which the user agent supports drag operations without
a pointer device are also suggested focusable. However, we're not aware of
any such cases and therefore don't suggest making draggable elements
focusable.
