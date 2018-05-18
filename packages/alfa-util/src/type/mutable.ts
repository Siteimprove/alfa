/**
 * NB: Use this type with extreme caution! Readonly records are readonly for a
 * reason and this type will completely ignore those reasons. It is however
 * meant as an aid in constructing readonly records, which is likely the only
 * valid use case.
 */
export type Mutable<T> = { -readonly [P in keyof T]: T[P] };
