import { Lexer } from "@siteimprove/alfa-css";
import { Feature } from "@siteimprove/alfa-css-feature";
import type { Device } from "@siteimprove/alfa-device";
import { Option, None } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Trampoline } from "@siteimprove/alfa-trampoline";

import { Rule } from "../rule.js";
import { Sheet } from "../sheet.js";
import { ConditionRule } from "./condition.js";

const { and } = Predicate;

/**
 * @public
 */
export class ImportRule extends ConditionRule<"import"> {
  public static of(
    href: string,
    sheet: Sheet,
    mediaCondition: Option<string> = None,
    supportCondition: Option<string> = None,
    layer: Option<string> = None,
  ): ImportRule {
    return new ImportRule(href, sheet, mediaCondition, supportCondition, layer);
  }

  private readonly _href: string;
  private readonly _sheet: Sheet;
  private readonly _mediaQueries: Feature.Media.List;
  private readonly _supportCondition: Option<string>;
  // There may be no support condition, or an unparsable (i.e. non-supported) one.
  // The former is None, the later is Some(None).
  private readonly _supportQuery: Option<Option<Feature.Supports.Query>>;
  // Anonymous layers are represented with the empty string, matching the
  // CSSImportRule interface
  private _layer: Option<string>;

  protected constructor(
    href: string,
    sheet: Sheet,
    mediaCondition: Option<string>,
    supportCondition: Option<string>,
    layer: Option<string>,
  ) {
    super("import", mediaCondition.getOr("all"), []);

    this._href = href;
    this._sheet = sheet;
    this._supportCondition = supportCondition;
    this._layer = layer;

    this._mediaQueries = mediaCondition
      .flatMap((condition) =>
        Feature.parseMediaQuery(Lexer.lex(condition)).ok(),
      )
      .map(([, queries]) => queries)
      .getOr(Feature.Media.List.of([]));

    this._supportQuery = supportCondition.map((condition) =>
      Feature.parseSupportsQuery(
        // We're not sure where the condition comes from, but Alfa only parses
        // them when they are parenthesised, while CSSImportRule.supportsText
        // provides the raw text. Extra parenthesis don't block parsing.
        // In doubt, adding some to avoid potential problems.
        Lexer.lex(`(${condition})`),
      )
        .ok()
        .map(([, query]) => query),
    );
  }

  public get supportCondition(): Option<string> {
    return this._supportCondition;
  }

  public get mediaQueries(): Feature.Media.List {
    return this._mediaQueries;
  }

  public get supportQuery(): Option<Option<Feature.Supports.Query>> {
    return this._supportQuery;
  }

  public get layer(): Option<string> {
    return this._layer;
  }

  public get rules(): Iterable<Rule> {
    return this._sheet.rules;
  }

  public get href(): string {
    return this._href;
  }

  public get sheet(): Sheet {
    return this._sheet;
  }

  public toJSON(): ImportRule.JSON {
    return {
      ...super.toJSON(),
      href: this._href,
      // We match the CSSImportRule interface returning null when no support
      // text exist
      supportText: this._supportCondition.getOr(null),
      // We match the CSSImportRule interface returning null when no layer
      // is declared, and "" for an anonymous layer.
      layer: this._layer.getOr(null),
    };
  }

  public toString(): string {
    return (
      `@import url(${this._href}) ` +
      `${this._layer.map((layer) => `layer${layer === "" ? "" : `(${layer}) `}`)}` +
      `${this._supportCondition.map((condition) => `supports(${condition}) `).getOr("")}` +
      `${this._condition}`
    );
  }
}

/**
 * @public
 */
export namespace ImportRule {
  export interface JSON extends ConditionRule.JSON<"import"> {
    href: string;
    supportText: string | null;
    layer: string | null;
  }

  export function isImportRule(value: unknown): value is ImportRule {
    return value instanceof ImportRule;
  }

  function matchesMedia(device: Device): Predicate<ImportRule> {
    return (rule) => rule.mediaQueries.matches(device);
  }

  function matchesSupport(device: Device): Predicate<ImportRule> {
    // If there is no support condition (None), it is matched.
    // If there is an unparsable one (Some(None)), it is not matched.
    return (rule) =>
      rule.supportQuery.every((option) =>
        option.some((query) => query.matches(device)),
      );
  }

  export function matches(device: Device): Predicate<ImportRule> {
    return and(matchesMedia(device), matchesSupport(device));
  }

  /**
   * @internal
   */
  export function fromImportRule(json: JSON): Trampoline<ImportRule> {
    return Trampoline.traverse(json.rules, Rule.fromRule).map((rules) =>
      ImportRule.of(
        json.href,
        Sheet.of(rules),
        Option.of(json.condition),
        Option.from(json.supportText),
        Option.from(json.layer),
      ),
    );
  }
}
