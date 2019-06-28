## [@siteimprove/alfa-css](packages/alfa-css)

### @todo

- [packages/alfa-css/src/properties/text-decoration/color/property.ts:21](packages/alfa-css/src/properties/text-decoration/color/property.ts#L21): Should be currentColor when supported in colorGrammar

## [@siteimprove/alfa-dom](packages/alfa-dom)

### @todo

- [packages/alfa-dom/src/is-rendered.ts:19](packages/alfa-dom/src/is-rendered.ts#L19): Handle `display: contents` once it gains wider support.

## [@siteimprove/alfa-aria](packages/alfa-aria)

### @todo

- [packages/alfa-aria/src/features/html/th.ts:6](packages/alfa-aria/src/features/html/th.ts#L6): Need to handle the auto state
- [packages/alfa-aria/src/features/svg/a.ts:21](packages/alfa-aria/src/features/svg/a.ts#L21): In certain rare circumstances the role will in this case be group. Investigate.
- [packages/alfa-aria/src/features/svg/circle.ts:10](packages/alfa-aria/src/features/svg/circle.ts#L10): In certain rare circumstances the role will in this case be graphics-symbol. Investigate.
- [packages/alfa-aria/src/features/svg/ellipse.ts:10](packages/alfa-aria/src/features/svg/ellipse.ts#L10): In certain rare circumstances the role will in this case be graphics-symbol. Investigate.
- [packages/alfa-aria/src/features/svg/foreign-object.ts:10](packages/alfa-aria/src/features/svg/foreign-object.ts#L10): In certain rare circumstances the role will in this case be group. Investigate.
- [packages/alfa-aria/src/features/svg/g.ts:10](packages/alfa-aria/src/features/svg/g.ts#L10): In certain rare circumstances the role will in this case be group. Investigate.
- [packages/alfa-aria/src/features/svg/image.ts:10](packages/alfa-aria/src/features/svg/image.ts#L10): In certain rare circumstances the role will in this case be group. Investigate.
- [packages/alfa-aria/src/features/svg/line.ts:10](packages/alfa-aria/src/features/svg/line.ts#L10): In certain rare circumstances the role will in this case be graphics-symbol. Investigate.
- [packages/alfa-aria/src/features/svg/mesh.ts:10](packages/alfa-aria/src/features/svg/mesh.ts#L10): In certain rare circumstances the role will in this case be img. Investigate.
- [packages/alfa-aria/src/features/svg/path.ts:10](packages/alfa-aria/src/features/svg/path.ts#L10): In certain rare circumstances the role will in this case be graphics-symbol. Investigate.
- [packages/alfa-aria/src/features/svg/polygon.ts:10](packages/alfa-aria/src/features/svg/polygon.ts#L10): In certain rare circumstances the role will in this case be graphics-symbol. Investigate.
- [packages/alfa-aria/src/features/svg/polyline.ts:10](packages/alfa-aria/src/features/svg/polyline.ts#L10): In certain rare circumstances the role will in this case be graphics-symbol. Investigate.
- [packages/alfa-aria/src/features/svg/rect.ts:10](packages/alfa-aria/src/features/svg/rect.ts#L10): In certain rare circumstances the role will in this case be graphics-symbol. Investigate.
- [packages/alfa-aria/src/features/svg/symbol.ts:10](packages/alfa-aria/src/features/svg/symbol.ts#L10): In certain rare circumstances the role will in this case be graphics-object. Investigate.
- [packages/alfa-aria/src/features/svg/text-path.ts:10](packages/alfa-aria/src/features/svg/text-path.ts#L10): In certain rare circumstances the role will in this case be group. Investigate.
- [packages/alfa-aria/src/features/svg/tspan.ts:10](packages/alfa-aria/src/features/svg/tspan.ts#L10): In certain rare circumstances the role will in this case be group. Investigate.
- [packages/alfa-aria/src/features/svg/use.ts:10](packages/alfa-aria/src/features/svg/use.ts#L10): In certain rare circumstances the role will in this case be graphics-object. Investigate.

### @bug

- [packages/alfa-aria/src/features/svg/text-path.ts:11](packages/alfa-aria/src/features/svg/text-path.ts#L11): There is an open issue regarding the role mapping for textPath
- [packages/alfa-aria/src/features/svg/tspan.ts:11](packages/alfa-aria/src/features/svg/tspan.ts#L11): There is an open issue regarding the role mapping for tspan
