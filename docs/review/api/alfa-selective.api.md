## API Report File for "@siteimprove/alfa-selective"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { Applicative } from '@siteimprove/alfa-applicative';
import { Either } from '@siteimprove/alfa-either';
import { Equatable } from '@siteimprove/alfa-equatable';
import { Functor } from '@siteimprove/alfa-functor';
import { Hash } from '@siteimprove/alfa-hash';
import { Hashable } from '@siteimprove/alfa-hash';
import { Mapper } from '@siteimprove/alfa-mapper';
import { Monad } from '@siteimprove/alfa-monad';
import { Predicate } from '@siteimprove/alfa-predicate';
import { Refinement } from '@siteimprove/alfa-refinement';
import { Serializable } from '@siteimprove/alfa-json';

// @public (undocumented)
export class Selective<S, T = never> implements Functor<T>, Applicative<T>, Monad<T>, Iterable<S | T>, Equatable, Hashable, Serializable<Selective.JSON<S, T>> {
    // (undocumented)
    [Symbol.iterator](): Iterator<S | T>;
    // (undocumented)
    apply<U>(mapper: Selective<S, Mapper<T, U>>): Selective<S, U>;
    // (undocumented)
    else<U>(mapper: Mapper<S, U>): Selective<never, T | U>;
    // (undocumented)
    equals<S, T>(value: Selective<S, T>): boolean;
    // (undocumented)
    equals(value: unknown): value is this;
    exhaust<T>(this: Selective<never, T>): T;
    // (undocumented)
    flatMap<U>(mapper: Mapper<T, Selective<S, U>>): Selective<S, U>;
    // (undocumented)
    flatten<S, T>(this: Selective<S, Selective<S, T>>): Selective<S, T>;
    // (undocumented)
    get(): S | T;
    // (undocumented)
    hash(hash: Hash): void;
    // (undocumented)
    if<P, Q extends P, U>(refinement: Refinement<P, Q>, mapper: Mapper<S & Q, U>): Selective<Exclude<S, Q>, T | U>;
    // (undocumented)
    if<U>(predicate: Predicate<S>, mapper: Mapper<S, U>): Selective<S, T | U>;
    // (undocumented)
    ifGuarded<P, Q extends P, R extends Q, U>(predicate: Refinement<P, Q>, guard: Refinement<Q, R>, ifTrue: Mapper<S & R, U>, ifFalse: Mapper<S & Q, U>): Selective<Exclude<S, Q>, T | U>;
    // (undocumented)
    ifGuarded<P, Q extends P, U>(predicate: Refinement<P, Q>, guard: Predicate<S & Q>, ifTrue: Mapper<S & Q, U>, ifFalse: Mapper<S & Q, U>): Selective<Exclude<S, Q>, T | U>;
    // (undocumented)
    ifGuarded<U>(predicate: Predicate<S>, guard: Predicate<S>, ifTrue: Mapper<S, U>, ifFalse: Mapper<S, U>): Selective<S, T | U>;
    // (undocumented)
    iterator(): Iterator<S | T>;
    // (undocumented)
    map<U>(mapper: Mapper<T, U>): Selective<S, U>;
    // (undocumented)
    static of<T>(value: T): Selective<T>;
    // (undocumented)
    toJSON(): Selective.JSON<S, T>;
    // (undocumented)
    toString(): string;
}

// @public (undocumented)
export namespace Selective {
    // (undocumented)
    export type JSON<S, T = never> = Either.JSON<S, T>;
}

// (No @packageDocumentation comment for this package)

```
