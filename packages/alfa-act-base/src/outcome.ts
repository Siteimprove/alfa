// import { Rule } from "@siteimprove/alfa-act";
// import { Equatable } from "@siteimprove/alfa-equatable";
//
// import * as earl from "@siteimprove/alfa-earl";
// import * as json from "@siteimprove/alfa-json";
// import * as sarif from "@siteimprove/alfa-sarif";
//
// /**
//  * @public
//  */
// export abstract class Outcome<I, T, Q = never>
//   implements
//     Equatable,
//     json.Serializable<Outcome.JSON>,
//     earl.Serializable<Outcome.EARL>,
//     sarif.Serializable<sarif.Result> {
//   protected readonly _rule: Rule<I, T, Q>;
//
//   protected constructor(rule: Rule<I, T, Q>) {
//     this._rule = rule;
//   }
//
//   public get rule(): Rule<I, T, Q> {
//     return this._rule;
//   }
//
//   public get target(): T | undefined {
//     return undefined;
//   }
//
//   public abstract equals<I, T, Q>(value: Outcome<I, T, Q>): boolean;
//
//   public abstract equals(value: unknown): value is this;
//
//   public abstract toJSON(): Outcome.JSON;
//
//   public toEARL(): Outcome.EARL {
//     return {
//       "@context": {
//         earl: "http://www.w3.org/ns/earl#",
//       },
//       "@type": "earl:Assertion",
//       "earl:test": {
//         "@id": this._rule.uri,
//       },
//     };
//   }
//
//   public abstract toSARIF(): sarif.Result;
// }
//
// /**
//  * @public
//  */
// export namespace Outcome {
//   export interface JSON {
//     [key: string]: json.JSON;
//
//     outcome: string;
//     rule: Rule.JSON;
//   }
//
//   export interface EARL extends earl.EARL {
//     "@type": "earl:Assertion";
//     "earl:test": {
//       "@id": string;
//     };
//   }
// }
