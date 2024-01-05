export * from "./property";

/**
 * @remarks
 * Supports function are not currently supported.
 *
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/@supports#function_syntax}
 * {@link https://drafts.csswg.org/css-conditional-4/#at-supports-ext}
 *
 * @remarks
 * * `selector(…)` is currently experimental.
 * * `font-tech(…)` and `font-format(…)` are somehow not documented in CSS (?!)
 *
 * We currently do not support the functional notation and will need to expand support
 * upon need.
 */
