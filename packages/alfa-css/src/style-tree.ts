import { Device } from "@siteimprove/alfa-device";
import { None, Option } from "@siteimprove/alfa-option";

import {
  CascadedPropertyValue,
  Longhand,
  SpecifiedPropertyValue
} from "./properties";
import * as Longhands from "./properties/longhands";
import * as Shorthands from "./properties/shorthands";

import { TokenType } from "./alphabet";
import { CascadedStyle, ComputedStyle, SpecifiedStyle, Style } from "./style";
import { Declaration } from "./types";
import { Values } from "./values";

const { keys } = Object;
const { keyword, isKeyword } = Values;

type Longhands = typeof Longhands;
type Shorthands = typeof Shorthands;

export interface StyleEntry<T, S> {
  readonly target: T;
  readonly declarations: Iterable<[Declaration, Option<S>]>;
  readonly children: Iterable<StyleEntry<T, S>>;
}

/**
 * The style tree is data structure used for associating style information with
 * generic tree structures, an example of which is DOM. However, the style tree
 * does not really care about the exact nature of the underlying tree structure
 * that styles are associated with; all it cares about are the relations between
 * the nodes of such a tree.
 *
 * Style trees are created from so-called style entries, which are objects that
 * associate style declarations with each node of a generic tree structure and
 * also contain such associations for every child of a given node. As such,
 * style entries effectively mirror the underlying tree structure that styles
 * are associated with. Given a tree of style entries, the style tree then
 * proceeds to resolve style information and builds a map from nodes to their
 * associated styles.
 */
export class StyleTree<T extends object, S> {
  private readonly styles = new WeakMap<T, Style<S>>();

  public constructor(root: StyleEntry<T, S>, device: Device) {
    visit(root, null, (entry, parentEntry) => {
      const { declarations } = entry;

      const parent =
        parentEntry === null ? null : this.styles.get(parentEntry.target)!;

      const style: Style<S> = {
        parent,
        cascaded: {},
        specified: {},
        computed: {}
      };

      style.cascaded = resolveCascadedStyle(declarations);

      style.specified = resolveSpecifiedStyle(style);

      style.computed = resolveComputedStyle(style, device);

      this.styles.set(entry.target, style);
    });
  }

  public get(target: T): Option<Style<S>> {
    return Option.from(this.styles.get(target));
  }
}

function visit<T, S>(
  entry: StyleEntry<T, S>,
  parentEntry: StyleEntry<T, S> | null,
  visitor: (
    entry: StyleEntry<T, S>,
    parentEntry: StyleEntry<T, S> | null
  ) => void
): void {
  visitor(entry, parentEntry);

  for (const child of entry.children) {
    visit(child, entry, visitor);
  }
}

type PropertyName = keyof Longhands | keyof Shorthands;

const propertyNames = new Map<string, PropertyName>();

const addPropertyName = (propertyName: PropertyName) => {
  propertyNames.set(
    propertyName.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`),
    propertyName
  );
};

for (const propertyName of keys(Longhands)) {
  addPropertyName(propertyName);
}

for (const propertyName of keys(Shorthands)) {
  addPropertyName(propertyName);
}

function getPropertyName(input: string): PropertyName | null {
  const propertyName = propertyNames.get(input);

  if (propertyName === undefined) {
    return null;
  }

  return propertyName;
}

function isLonghandPropertyName(
  propertyName: PropertyName
): propertyName is keyof Longhands {
  return propertyName in Longhands;
}

function resolveCascadedStyle<S>(
  declarations: Iterable<[Declaration, Option<S>]>
): CascadedStyle<S> {
  const cascadedStyle: CascadedStyle<S> = {};

  outer: for (const [{ name, value, important }, source] of declarations) {
    const propertyName = getPropertyName(name);

    if (propertyName === null) {
      continue;
    }

    for (let i = 0, n = value.length; i < n; i++) {
      const token = value[i];

      if (token.type === TokenType.Whitespace) {
        continue;
      }

      if (token.type === TokenType.Ident) {
        switch (token.value) {
          case "initial":
          case "inherit":
            const value = keyword(token.value);

            if (isLonghandPropertyName(propertyName)) {
              setProperty(propertyName, value, source, important);
            } else {
              const { longhands } = Shorthands[propertyName];

              for (const propertyName of longhands) {
                setProperty(propertyName, value, source, important);
              }
            }

            continue outer;
        }
      }

      break;
    }

    if (isLonghandPropertyName(propertyName)) {
      const property = Longhands[propertyName];

      const result = property.parse(value);

      if (result !== null) {
        setProperty(propertyName, result, source, important);
      }
    } else {
      const property = Shorthands[propertyName];

      const result = property.parse(value);

      if (result !== null) {
        for (const propertyName of keys(result)) {
          const value = result[propertyName];

          if (value !== undefined) {
            setProperty(propertyName, value, source, important);
          }
        }
      }
    }
  }

  return cascadedStyle;

  function setProperty<N extends keyof Longhands>(
    propertyName: N,
    propertyValue: CascadedPropertyValue<N>,
    source: Option<S>,
    important: boolean
  ): void {
    if (propertyName in cascadedStyle === false || important) {
      cascadedStyle[propertyName] = {
        value: propertyValue,
        source
      };
    }
  }
}

function resolveSpecifiedStyle<S>(style: Style<S>): SpecifiedStyle<S> {
  const specifiedStyle: SpecifiedStyle<S> = {};

  const cascadedStyle = style.cascaded;

  const parentStyle = style.parent === null ? {} : style.parent.computed;

  const propertyNames = new Set([...keys(cascadedStyle), ...keys(parentStyle)]);

  for (const propertyName of propertyNames) {
    const { initial, inherits } = Longhands[propertyName];

    const cascadedValue = cascadedStyle[propertyName];

    if (cascadedValue !== undefined) {
      const { value, source } = cascadedValue;

      if (!isKeyword(value, "initial", "inherit")) {
        setProperty(propertyName, value, source);
      } else if (isKeyword(value, "initial")) {
        setProperty(propertyName, initial(), source);
      } else if (isKeyword(value, "inherit")) {
        const parentValue = parentStyle[propertyName];

        if (parentValue === undefined) {
          setProperty(propertyName, initial(), source);
        } else {
          const { value, source } = parentValue;
          setProperty(propertyName, value, source);
        }
      }
    } else {
      const parentValue = parentStyle[propertyName];

      if (parentValue === undefined || inherits !== true) {
        setProperty(propertyName, initial(), None);
      } else {
        const { value, source } = parentValue;
        setProperty(propertyName, value, source);
      }
    }
  }

  return specifiedStyle;

  function setProperty(
    propertyName: keyof Longhands,
    propertyValue: SpecifiedPropertyValue,
    source: Option<S>
  ): void {
    specifiedStyle[propertyName] = {
      value: propertyValue,
      source
    };
  }
}

function resolveComputedStyle<S>(
  style: Style<S>,
  device: Device
): ComputedStyle<S> {
  const computedStyle: ComputedStyle<S> = {};

  const specifiedStyle = style.specified;

  const parentStyle = style.parent === null ? {} : style.parent.computed;

  const propertyNames = new Set([
    ...keys(specifiedStyle),
    ...keys(parentStyle)
  ]);

  for (const propertyName of propertyNames) {
    setProperty(propertyName);
  }

  return computedStyle;

  function setProperty(propertyName: keyof Longhands): void {
    if (computedStyle[propertyName] !== undefined) {
      return;
    }

    // tslint:disable:no-any
    const { depends = [], computed } = Longhands[propertyName] as Longhand<
      any,
      any
    >;

    for (const propertyName of depends) {
      if (propertyName in propertyNames) {
        setProperty(propertyName);
      }
    }

    computedStyle[propertyName] = computed(style, device);
  }
}
