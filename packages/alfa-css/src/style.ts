import { Option } from "@siteimprove/alfa-util";
import {
  CascadedPropertyValue,
  ComputedPropertyValue,
  PropertyName,
  SpecifiedPropertyValue
} from "./properties";

export interface Style<S> {
  readonly parent: Option<Style<S>>;

  readonly cascaded: CascadedStyle<S>;
  readonly specified: SpecifiedStyle<S>;
  readonly computed: ComputedStyle<S>;
}

export interface StyleValue<V, S> {
  readonly value: V;
  readonly source: Option<S>;
}

export type CascadedStyle<S> = {
  readonly [N in PropertyName]?: StyleValue<CascadedPropertyValue<N>, S>;
};

export type SpecifiedStyle<S> = {
  readonly [N in PropertyName]?: StyleValue<SpecifiedPropertyValue<N>, S>;
};

export type ComputedStyle<S> = {
  readonly [N in PropertyName]?: StyleValue<ComputedPropertyValue<N>, S>;
};
