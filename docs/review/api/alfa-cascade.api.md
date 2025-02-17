## API Report File for "@siteimprove/alfa-cascade"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { Array as Array_2 } from '@siteimprove/alfa-array';
import { Comparable } from '@siteimprove/alfa-comparable';
import { Comparer } from '@siteimprove/alfa-comparable';
import { Comparison } from '@siteimprove/alfa-comparable';
import { Complex } from '@siteimprove/alfa-selector';
import { Compound } from '@siteimprove/alfa-selector';
import { Context } from '@siteimprove/alfa-selector';
import type { Declaration } from '@siteimprove/alfa-dom';
import type { Device } from '@siteimprove/alfa-device';
import type { Document } from '@siteimprove/alfa-dom';
import { Element } from '@siteimprove/alfa-dom';
import { Equatable } from '@siteimprove/alfa-equatable';
import { Iterable as Iterable_2 } from '@siteimprove/alfa-iterable';
import type * as json from '@siteimprove/alfa-json';
import { Option } from '@siteimprove/alfa-option';
import type { Rule } from '@siteimprove/alfa-dom';
import type { Selector } from '@siteimprove/alfa-selector';
import { Serializable } from '@siteimprove/alfa-json';
import { Shadow } from '@siteimprove/alfa-dom';
import type { Sheet } from '@siteimprove/alfa-dom';
import { Simple } from '@siteimprove/alfa-selector';
import { Specificity } from '@siteimprove/alfa-selector';
import type { StyleRule } from '@siteimprove/alfa-dom';

// @public (undocumented)
export class Cascade implements Serializable {
    protected constructor(root: Document | Shadow, device: Device);
    // (undocumented)
    static from(node: Document | Shadow, device: Device): Cascade;
    get(element: Element, context?: Context): RuleTree.Node;
    // (undocumented)
    toJSON(): Cascade.JSON;
}

// @public (undocumented)
export namespace Cascade {
    // (undocumented)
    export interface JSON {
        // (undocumented)
        [key: string]: json.JSON;
        // (undocumented)
        device: Device.JSON;
        // (undocumented)
        root: Document.JSON | Shadow.JSON;
        // (undocumented)
        rules: RuleTree.JSON;
        // Warning: (ae-forgotten-export) The symbol "SelectorMap" needs to be exported by the entry point index.d.ts
        //
        // (undocumented)
        selectors: SelectorMap.JSON;
    }
}

// @public (undocumented)
export type Encapsulation = number;

// @public (undocumented)
export namespace Encapsulation {
    // (undocumented)
    export type JSON = Encapsulation;
    const // (undocumented)
    compare: Comparer<Encapsulation>;
}

// @public (undocumented)
export class Layer<ORDERED extends boolean = boolean> implements Serializable<Layer.JSON>, Equatable, Comparable<Layer<true>> {
    protected constructor(ordered: ORDERED, name: string, importance: boolean, order: number);
    // (undocumented)
    compare(this: Layer<true>, value: Layer<true>): Comparison;
    // (undocumented)
    static empty(): Layer<true>;
    // (undocumented)
    equals(value: Layer): boolean;
    // (undocumented)
    equals(value: unknown): value is this;
    // (undocumented)
    get importance(): boolean;
    // (undocumented)
    get isOrdered(): ORDERED;
    // (undocumented)
    get name(): string;
    // (undocumented)
    static of(name: string, importance: boolean): Layer<false>;
    // (undocumented)
    get order(): number;
    // (undocumented)
    toJSON(): Layer.JSON;
    withOrder(this: Layer<false>, order: number): Layer<true>;
}

// @public (undocumented)
export namespace Layer {
    // @internal
    export function compareUnordered(layers: ReadonlyArray<Pair<false>>): Comparer<Pair<false>>;
    const // (undocumented)
    compare: Comparer<Layer<true>>;
    // (undocumented)
    export interface JSON {
        // (undocumented)
        [key: string]: json.JSON;
        // (undocumented)
        name: string;
        // (undocumented)
        order: number;
    }
    // @internal (undocumented)
    export type Pair<ORDERED extends boolean = boolean> = {
        name: string;
        normal: Layer<ORDERED>;
        important: Layer<ORDERED>;
    };
    // Warning: (ae-incompatible-release-tags) The symbol "sortUnordered" is marked as @public, but its signature references "Layer" which is marked as @internal
    export function sortUnordered(layers: ReadonlyArray<Pair<false>>): Array_2<Pair<true>>;
}

// @public
export type Order = number;

// @public (undocumented)
export namespace Order {
    // (undocumented)
    export type JSON = Order;
    const // (undocumented)
    compare: Comparer<Order>;
}

// @public (undocumented)
export enum Origin {
    // (undocumented)
    Animation = 4,
    // (undocumented)
    ImportantAuthor = 5,
    // (undocumented)
    ImportantUser = 6,
    // (undocumented)
    ImportantUserAgent = 7,
    // (undocumented)
    NormalAuthor = 3,
    // (undocumented)
    NormalUser = 2,
    // (undocumented)
    NormalUserAgent = 1,
    // (undocumented)
    Transition = 8
}

// @public (undocumented)
export namespace Origin {
    // (undocumented)
    export function isAuthor(origin: Origin): boolean;
    // (undocumented)
    export function isImportant(origin: Origin): boolean;
    // (undocumented)
    export type JSON = Origin;
    const // (undocumented)
    compare: Comparer<Origin>;
}

// @public
export interface Precedence<LAYERED extends boolean = boolean> {
    // (undocumented)
    encapsulation: Encapsulation;
    // (undocumented)
    isElementAttached: boolean;
    // (undocumented)
    layer: Layer<LAYERED>;
    // (undocumented)
    order: Order;
    // (undocumented)
    origin: Origin;
    // (undocumented)
    specificity: Specificity;
}

// @public (undocumented)
export namespace Precedence {
    // (undocumented)
    export function equals(a: Precedence, b: Precedence): boolean;
    const // (undocumented)
    empty: Precedence<true>;
    // (undocumented)
    export function isImportant<LAYERED extends boolean>(precedence: Precedence<LAYERED>): boolean;
    // (undocumented)
    export interface JSON {
        // (undocumented)
        [key: string]: json.JSON;
        // (undocumented)
        encapsulation: Encapsulation.JSON;
        // (undocumented)
        isElementAttached: boolean;
        // (undocumented)
        layer: Layer.JSON;
        // (undocumented)
        order: Order.JSON;
        // (undocumented)
        origin: Origin.JSON;
        // (undocumented)
        specificity: Specificity.JSON;
    }
    // (undocumented)
    export function toJSON(precedence: Precedence): JSON;
    // (undocumented)
    export function toTuple<LAYERED extends boolean>(precedence: Precedence<LAYERED>): [Origin, Encapsulation, boolean, Layer<LAYERED>, Specificity, Order];
    const // (undocumented)
    compare: Comparer<Precedence<true>>;
}

// @public
export class RuleTree implements Serializable {
    protected constructor();
    // Warning: (ae-forgotten-export) The symbol "Block" needs to be exported by the entry point index.d.ts
    //
    // @internal
    add(rules: Iterable_2<Block<Element | Block.Source, true>>): RuleTree.Node;
    // (undocumented)
    static empty(): RuleTree;
    // (undocumented)
    toJSON(): RuleTree.JSON;
}

// @public (undocumented)
export namespace RuleTree {
    // (undocumented)
    export type JSON = Array<Node.JSON>;
    // (undocumented)
    export class Node implements Serializable {
        protected constructor(block: Block, children: Array<Node>, parent: Option<Node>);
        // @internal
        add(block: Block): Node;
        // (undocumented)
        ancestors(): Iterable_2<Node>;
        // (undocumented)
        get block(): Block;
        // (undocumented)
        get children(): Array<Node>;
        // (undocumented)
        inclusiveAncestors(): Iterable_2<Node>;
        // (undocumented)
        static of(block: Block, children: Array<Node>, parent: Option<Node>): Node;
        // (undocumented)
        get parent(): Option<Node>;
        // (undocumented)
        toJSON(): Node.JSON;
    }
    // (undocumented)
    export namespace Node {
        // (undocumented)
        export interface JSON {
            // (undocumented)
            [key: string]: json.JSON;
            // (undocumented)
            block: Block.JSON;
            // (undocumented)
            children: Array<Node.JSON>;
        }
    }
}

// (No @packageDocumentation comment for this package)

```
