## API Report File for "@siteimprove/alfa-continuation"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import type { Callback } from '@siteimprove/alfa-callback';
import type { Mapper } from '@siteimprove/alfa-mapper';

// @public (undocumented)
export type Continuation<T, R = void, A extends Array<unknown> = []> = Callback<Callback<T, R>, R, A>;

// @public (undocumented)
export namespace Continuation {
    // (undocumented)
    export function flatMap<T, U, R = void, A extends Array<unknown> = []>(continuation: Continuation<T, R, A>, mapper: Mapper<T, Continuation<U, R, A>>): Continuation<U, R, A>;
    // (undocumented)
    export function map<T, U, R = void, A extends Array<unknown> = []>(continuation: Continuation<T, R, A>, mapper: Mapper<T, U>): Continuation<U, R, A>;
    // (undocumented)
    export function of<T, R = void, A extends Array<unknown> = []>(value: T): Continuation<T, R, A>;
}

// (No @packageDocumentation comment for this package)

```
