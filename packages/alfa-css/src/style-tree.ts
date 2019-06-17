import { Device } from "@siteimprove/alfa-device";
import { keys, set } from "@siteimprove/alfa-util";

import { CascadedPropertyValue } from "./properties";
import * as Longhands from "./properties/longhands";
import * as Shorthands from "./properties/shorthands";

import { TokenType } from "./alphabet";
import { CascadedStyle, ComputedStyle, SpecifiedStyle, Style } from "./style";
import { Declaration } from "./types";
import { Values } from "./values";

type Longhands = typeof Longhands;
type Shorthands = typeof Shorthands;

export interface StyleEntry<T> {
  readonly target: T;
  readonly declarations: ReadonlyArray<Declaration>;
  readonly children: ReadonlyArray<StyleEntry<T>>;
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
export class StyleTree<T extends object> {
  private readonly styles = new WeakMap<T, Style>();

  public constructor(root: StyleEntry<T>, device: Device) {
    visit(root, null, (entry, parentEntry) => {
      const { declarations } = entry;

      const parent =
        parentEntry === null ? null : this.styles.get(parentEntry.target)!;

      const style = {
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

  public get(target: T): Style | null {
    const style = this.styles.get(target);

    if (style === undefined) {
      return null;
    }

    return style;
  }
}

function visit<T extends object>(
  entry: StyleEntry<T>,
  parentEntry: StyleEntry<T> | null,
  visitor: (entry: StyleEntry<T>, parentEntry: StyleEntry<T> | null) => void
): void {
  visitor(entry, parentEntry);

  for (const child of entry.children) {
    visit(child, entry, visitor);
  }
}

function resolveCascadedStyle(
  declarations: ReadonlyArray<Declaration>
): CascadedStyle {
  const cascadedStyle: CascadedStyle = {};

  outer: for (const { name, value, important } of declarations) {
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
            const value = Values.keyword(token.value);

            if (isLonghandPropertyName(propertyName)) {
              setProperty(propertyName, value, important);
            } else {
              const { longhands } = Shorthands[propertyName];

              for (const propertyName of longhands) {
                setProperty(propertyName, value, important);
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
        setProperty(propertyName, result, important);
      }
    } else {
      const property = Shorthands[propertyName];

      const result = property.parse(value);

      if (result !== null) {
        for (const propertyName of keys(result)) {
          const value = result[propertyName];

          if (value !== undefined) {
            setProperty(propertyName, value, important);
          }
        }
      }
    }
  }

  return cascadedStyle;

  function setProperty(
    propertyName: keyof Longhands,
    propertyValue: CascadedPropertyValue,
    important: boolean
  ): void {
    if (propertyName in cascadedStyle === false || important) {
      set(cascadedStyle, propertyName, propertyValue);
    }
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

function resolveSpecifiedStyle(style: Style): SpecifiedStyle {
  const specifiedStyle: SpecifiedStyle = {};

  const cascadedStyle = style.cascaded;

  const parentStyle = style.parent === null ? {} : style.parent.computed;

  const propertyNames = new Set([...keys(cascadedStyle), ...keys(parentStyle)]);

  for (const propertyName of propertyNames) {
    const property = Longhands[propertyName];
    const cascadedValue = cascadedStyle[propertyName];

    if (cascadedValue !== undefined) {
      if (Values.isKeyword(cascadedValue, "initial", "inherit")) {
        if (
          Values.isKeyword(cascadedValue, "inherit") &&
          parentStyle[propertyName] !== undefined
        ) {
          set(specifiedStyle, propertyName, parentStyle[propertyName]);
        } else {
          set(specifiedStyle, propertyName, property.initial());
        }
      } else {
        set(specifiedStyle, propertyName, cascadedValue);
      }

      continue;
    }

    if (property.inherits === true && parentStyle[propertyName] !== undefined) {
      set(specifiedStyle, propertyName, parentStyle[propertyName]);
    } else {
      set(specifiedStyle, propertyName, property.initial());
    }
  }

  return specifiedStyle;
}

function resolveComputedStyle(style: Style, device: Device): ComputedStyle {
  const computedStyle: ComputedStyle = {};

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
    const property = Longhands[propertyName];

    if (computedStyle[propertyName] !== undefined) {
      return;
    }

    if (property.depends !== undefined) {
      for (const propertyName of property.depends) {
        if (propertyName in propertyNames) {
          setProperty(propertyName);
        }
      }
    }

    set(computedStyle, propertyName, property.computed(style, device));
  }
}
