import {
  CascadedPropertyValue,
  ComputedPropertyValue,
  SpecifiedPropertyValue
} from "./properties";
import * as Longhands from "./properties/longhands";

type Longhands = typeof Longhands;

export type CascadedStyle = {
  readonly [N in keyof Longhands]?: CascadedPropertyValue<N>;
};

export type SpecifiedStyle = {
  readonly [N in keyof Longhands]?: SpecifiedPropertyValue<N>;
};

export type ComputedStyle = {
  readonly [N in keyof Longhands]?: ComputedPropertyValue<N>;
};

export interface Style {
  readonly parent: Style | null;

  readonly cascaded: CascadedStyle;
  readonly specified: SpecifiedStyle;
  readonly computed: ComputedStyle;
}
