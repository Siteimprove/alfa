## API Report File for "@siteimprove/alfa-iterable"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import type { Callback } from '@siteimprove/alfa-callback';
import { Comparable } from '@siteimprove/alfa-comparable';
import { Comparer } from '@siteimprove/alfa-comparable';
import { Comparison } from '@siteimprove/alfa-comparable';
import type { Hash } from '@siteimprove/alfa-hash';
import type { Mapper } from '@siteimprove/alfa-mapper';
import { Option } from '@siteimprove/alfa-option';
import { Predicate } from '@siteimprove/alfa-predicate';
import type { Reducer } from '@siteimprove/alfa-reducer';
import { Refinement } from '@siteimprove/alfa-refinement';
import { Serializable } from '@siteimprove/alfa-json';

// @public (undocumented)
type Iterable_2<T> = globalThis.Iterable<T>;

// @public (undocumented)
namespace Iterable_2 {
    // (undocumented)
    function append<T>(iterable: Iterable_2<T>, value: T): Iterable_2<T>;
    // (undocumented)
    function apply<T, U>(iterable: Iterable_2<T>, mapper: Iterable_2<Mapper<T, U>>): Iterable_2<U>;
    // (undocumented)
    function collect<T, U>(iterable: Iterable_2<T>, mapper: Mapper<T, Option<U>, [index: number]>): Iterable_2<U>;
    // (undocumented)
    function collectFirst<T, U>(iterable: Iterable_2<T>, mapper: Mapper<T, Option<U>, [index: number]>): Option<U>;
    // (undocumented)
    function compare<T extends Comparable<U>, U = T>(a: Iterable_2<T>, b: Iterable_2<U>): Comparison;
    // (undocumented)
    function compareWith<T, U = T>(a: Iterable_2<T>, b: Iterable_2<U>, comparer: Comparer<T, U, [index: number]>): Comparison;
    // (undocumented)
    function concat<T>(iterable: Iterable_2<T>, ...iterables: Array<Iterable_2<T>>): Iterable_2<T>;
    // (undocumented)
    function count<T>(iterable: Iterable_2<T>, predicate: Predicate<T, [index: number]>): number;
    // (undocumented)
    function distinct<T>(iterable: Iterable_2<T>): Iterable_2<T>;
    // (undocumented)
    function empty<T>(): Iterable_2<T>;
    // (undocumented)
    function equals<T>(a: Iterable_2<T>, b: Iterable_2<T>): boolean;
    // (undocumented)
    function every<T>(iterable: Iterable_2<T>, predicate: Predicate<T, [index: number]>): boolean;
    // (undocumented)
    function filter<T, U extends T>(iterable: Iterable_2<T>, refinement: Refinement<T, U, [index: number]>): Iterable_2<U>;
    // (undocumented)
    function filter<T>(iterable: Iterable_2<T>, predicate: Predicate<T, [index: number]>): Iterable_2<T>;
    // (undocumented)
    function find<T, U extends T>(iterable: Iterable_2<T>, refinement: Refinement<T, U, [index: number]>): Option<U>;
    // (undocumented)
    function find<T>(iterable: Iterable_2<T>, predicate: Predicate<T, [index: number]>): Option<T>;
    // (undocumented)
    function findLast<T, U extends T>(iterable: Iterable_2<T>, refinement: Refinement<T, U, [index: number]>): Option<U>;
    // (undocumented)
    function findLast<T>(iterable: Iterable_2<T>, predicate: Predicate<T, [index: number]>): Option<T>;
    // (undocumented)
    function first<T>(iterable: Iterable_2<T>): Option<T>;
    // (undocumented)
    function flatMap<T, U = T>(iterable: Iterable_2<T>, mapper: Mapper<T, Iterable_2<U>, [index: number]>): Iterable_2<U>;
    // (undocumented)
    function flatten<T>(iterable: Iterable_2<Iterable_2<T>>): Iterable_2<T>;
    // (undocumented)
    function forEach<T>(iterable: Iterable_2<T>, callback: Callback<T, void, [index: number]>): void;
    // (undocumented)
    function from<T>(arrayLike: ArrayLike<T>): Iterable_2<T>;
    // (undocumented)
    function get<T>(iterable: Iterable_2<T>, index: number): Option<T>;
    // (undocumented)
    function groupBy<T, K>(iterable: Iterable_2<T>, grouper: Mapper<T, K, [index: number]>): Iterable_2<[K, Iterable_2<T>]>;
    // (undocumented)
    function has<T>(iterable: Iterable_2<T>, index: number): boolean;
    // (undocumented)
    function hash<T>(iterable: Iterable_2<T>, hash: Hash): void;
    // (undocumented)
    function includes<T>(iterable: Iterable_2<T>, value: T): boolean;
    // (undocumented)
    function insert<T>(iterable: Iterable_2<T>, index: number, value: T): Iterable_2<T>;
    // (undocumented)
    function intersect<T>(iterable: Iterable_2<T>, ...iterables: Array<Iterable_2<T>>): Iterable_2<T>;
    // (undocumented)
    function isEmpty<T>(iterable: Iterable_2<T>): iterable is Iterable_2<never>;
    // (undocumented)
    function isIterable<T>(value: unknown): value is Iterable_2<T>;
    // (undocumented)
    function iterator<T>(iterable: Iterable_2<T>): Iterator<T>;
    // (undocumented)
    function join<T>(iterable: Iterable_2<T>, separator: string): string;
    // (undocumented)
    function last<T>(iterable: Iterable_2<T>): Option<T>;
    // (undocumented)
    function map<T, U = T>(iterable: Iterable_2<T>, mapper: Mapper<T, U, [index: number]>): Iterable_2<U>;
    // (undocumented)
    function none<T>(iterable: Iterable_2<T>, predicate: Predicate<T, [index: number]>): boolean;
    // (undocumented)
    function prepend<T>(iterable: Iterable_2<T>, value: T): Iterable_2<T>;
    // (undocumented)
    function reduce<T, U = T>(iterable: Iterable_2<T>, reducer: Reducer<T, U, [index: number]>, accumulator: U): U;
    // (undocumented)
    function reduceUntil<T, U = T>(iterable: Iterable_2<T>, predicate: Predicate<T, [index: number]>, reducer: Reducer<T, U, [index: number]>, accumulator: U): U;
    // (undocumented)
    function reduceWhile<T, U = T>(iterable: Iterable_2<T>, predicate: Predicate<T, [index: number]>, reducer: Reducer<T, U, [index: number]>, accumulator: U): U;
    // (undocumented)
    function reject<T, U extends T>(iterable: Iterable_2<T>, refinement: Refinement<T, U, [index: number]>): Iterable_2<Exclude<T, U>>;
    // (undocumented)
    function reject<T>(iterable: Iterable_2<T>, predicate: Predicate<T, [index: number]>): Iterable_2<T>;
    // (undocumented)
    function rest<T>(iterable: Iterable_2<T>): Iterable_2<T>;
    // (undocumented)
    function reverse<T>(iterable: Iterable_2<T>): Iterable_2<T>;
    // (undocumented)
    function set<T>(iterable: Iterable_2<T>, index: number, value: T): Iterable_2<T>;
    // (undocumented)
    function size<T>(iterable: Iterable_2<T>): number;
    // (undocumented)
    function skip<T>(iterable: Iterable_2<T>, count: number): Iterable_2<T>;
    // (undocumented)
    function skipLast<T>(iterable: Iterable_2<T>, count?: number): Iterable_2<T>;
    // (undocumented)
    function skipLastUntil<T>(iterable: Iterable_2<T>, predicate: Predicate<T, [index: number]>): Iterable_2<T>;
    // (undocumented)
    function skipLastWhile<T>(iterable: Iterable_2<T>, predicate: Predicate<T, [index: number]>): Iterable_2<T>;
    // (undocumented)
    function skipUntil<T>(iterable: Iterable_2<T>, predicate: Predicate<T, [index: number]>): Iterable_2<T>;
    // (undocumented)
    function skipWhile<T>(iterable: Iterable_2<T>, predicate: Predicate<T, [index: number]>): Iterable_2<T>;
    // (undocumented)
    function slice<T>(iterable: Iterable_2<T>, start: number, end?: number): Iterable_2<T>;
    // (undocumented)
    function some<T>(iterable: Iterable_2<T>, predicate: Predicate<T, [index: number]>): boolean;
    // (undocumented)
    function sort<T extends Comparable<T>>(iterable: Iterable_2<T>): Iterable_2<T>;
    // (undocumented)
    function sortWith<T>(iterable: Iterable_2<T>, comparer: Comparer<T>): Iterable_2<T>;
    // (undocumented)
    function sortWith<T, U extends T = T>(iterable: Iterable_2<U>, comparer: Comparer<T>): Iterable_2<U>;
    // (undocumented)
    function subtract<T>(iterable: Iterable_2<T>, ...iterables: Array<Iterable_2<T>>): Iterable_2<T>;
    // (undocumented)
    function take<T>(iterable: Iterable_2<T>, count: number): Iterable_2<T>;
    // (undocumented)
    function takeLast<T>(iterable: Iterable_2<T>, count?: number): Iterable_2<T>;
    // (undocumented)
    function takeLastUntil<T>(iterable: Iterable_2<T>, predicate: Predicate<T, [index: number]>): Iterable_2<T>;
    // (undocumented)
    function takeLastWhile<T, U extends T>(iterable: Iterable_2<T>, refinement: Refinement<T, U, [index: number]>): Iterable_2<U>;
    // (undocumented)
    function takeLastWhile<T>(iterable: Iterable_2<T>, predicate: Predicate<T, [index: number]>): Iterable_2<T>;
    // (undocumented)
    function takeUntil<T>(iterable: Iterable_2<T>, predicate: Predicate<T, [index: number]>): Iterable_2<T>;
    // (undocumented)
    function takeWhile<T, U extends T>(iterable: Iterable_2<T>, refinement: Refinement<T, U, [index: number]>): Iterable_2<U>;
    // (undocumented)
    function takeWhile<T>(iterable: Iterable_2<T>, predicate: Predicate<T, [index: number]>): Iterable_2<T>;
    // (undocumented)
    function toJSON<T>(iterable: Iterable_2<T>, options?: Serializable.Options): Array<Serializable.ToJSON<T>>;
    // (undocumented)
    function trim<T>(iterable: Iterable_2<T>, predicate: Predicate<T, [index: number]>): Iterable_2<T>;
    // (undocumented)
    function trimLeading<T>(iterable: Iterable_2<T>, predicate: Predicate<T, [index: number]>): Iterable_2<T>;
    // (undocumented)
    function trimTrailing<T>(iterable: Iterable_2<T>, predicate: Predicate<T, [index: number]>): Iterable_2<T>;
    // (undocumented)
    function zip<T, U = T>(a: Iterable_2<T>, b: Iterable_2<U>): Iterable_2<[T, U]>;
}
export { Iterable_2 as Iterable }

// (No @packageDocumentation comment for this package)

```
