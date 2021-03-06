## API Report File for "@siteimprove/alfa-cascade"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { Context } from '@siteimprove/alfa-selector';
import { Declaration } from '@siteimprove/alfa-dom';
import { Device } from '@siteimprove/alfa-device';
import { Document } from '@siteimprove/alfa-dom';
import { Element } from '@siteimprove/alfa-dom';
import { Iterable as Iterable_2 } from '@siteimprove/alfa-iterable';
import * as json from '@siteimprove/alfa-json';
import { Option } from '@siteimprove/alfa-option';
import { Rule } from '@siteimprove/alfa-dom';
import { Selector } from '@siteimprove/alfa-selector';
import { Serializable } from '@siteimprove/alfa-json';
import { Shadow } from '@siteimprove/alfa-dom';
import { Sheet } from '@siteimprove/alfa-dom';

// @public (undocumented)
export class Cascade implements Serializable {
    // Warning: (ae-forgotten-export) The symbol "AncestorFilter" needs to be exported by the entry point index.d.ts
    // Warning: (ae-forgotten-export) The symbol "RuleTree" needs to be exported by the entry point index.d.ts
    //
    // (undocumented)
    get(element: Element, context?: Context, filter?: Option<AncestorFilter>): Option<RuleTree.Node>;
    // (undocumented)
    static of(node: Document | Shadow, device: Device): Cascade;
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


// (No @packageDocumentation comment for this package)

```
