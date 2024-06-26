## API Report File for "@siteimprove/alfa-trampoline"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import type { Applicative } from '@siteimprove/alfa-applicative';
import type { Callback } from '@siteimprove/alfa-callback';
import type { Foldable } from '@siteimprove/alfa-foldable';
import type { Functor } from '@siteimprove/alfa-functor';
import { Iterable as Iterable_2 } from '@siteimprove/alfa-iterable';
import type { Mapper } from '@siteimprove/alfa-mapper';
import type { Monad } from '@siteimprove/alfa-monad';
import type { Reducer } from '@siteimprove/alfa-reducer';
import type { Thunk } from '@siteimprove/alfa-thunk';

// @public (undocumented)
export abstract class Trampoline<T> implements Functor<T>, Applicative<T>, Monad<T>, Foldable<T>, Iterable_2<T> {
    // (undocumented)
    [Symbol.iterator](): Iterator<T>;
    // (undocumented)
    apply<U>(mapper: Trampoline<Mapper<T, U>>): Trampoline<U>;
    // (undocumented)
    abstract flatMap<U>(mapper: Mapper<T, Trampoline<U>>): Trampoline<U>;
    // (undocumented)
    flatten<T>(this: Trampoline<Trampoline<T>>): Trampoline<T>;
    // (undocumented)
    abstract isDone(): boolean;
    // (undocumented)
    abstract isSuspended(): boolean;
    // (undocumented)
    iterator(): Iterator<T>;
    // (undocumented)
    map<U>(mapper: Mapper<T, U>): Trampoline<U>;
    // (undocumented)
    reduce<U>(reducer: Reducer<T, U>, accumulator: U): U;
    // (undocumented)
    run(): T;
    // (undocumented)
    protected abstract step(): Trampoline<T>;
    // (undocumented)
    tee(callback: Callback<T>): Trampoline<T>;
}

// @public (undocumented)
export namespace Trampoline {
    // (undocumented)
    export function delay<T>(thunk: Thunk<T>): Trampoline<T>;
    // (undocumented)
    export function done<T>(value: T): Trampoline<T>;
    // (undocumented)
    export function empty(): Trampoline<void>;
    // (undocumented)
    export function isTrampoline<T>(value: Iterable_2<T>): value is Trampoline<T>;
    // (undocumented)
    export function isTrampoline<T>(value: unknown): value is Trampoline<T>;
    // (undocumented)
    export function sequence<T>(futures: Iterable_2<Trampoline<T>>): Trampoline<Iterable_2<T>>;
    // (undocumented)
    export function suspend<T>(thunk: Thunk<Trampoline<T>>): Trampoline<T>;
    // (undocumented)
    export function traverse<T, U>(values: Iterable_2<T>, mapper: Mapper<T, Trampoline<U>, [index: number]>): Trampoline<Iterable_2<U>>;
}

// (No @packageDocumentation comment for this package)

```
