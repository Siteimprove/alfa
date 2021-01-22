import { Err, Ok } from "@siteimprove/alfa-result";
import { Diagnostic } from "@siteimprove/alfa-act";

export namespace RefreshDelay {
  export const HasImmediateRefresh = Ok.of(
    Diagnostic.of(`The refresh or redirect happens immediately`)
  );

  export const HasTwentyHoursDelayedRefresh = Ok.of(
    Diagnostic.of(`The refresh or redirect happens after 20 hours`)
  );

  export const HasDelayedRefresh = Err.of(
    Diagnostic.of(`The refresh or redirect is delayed less than 20 hours`)
  );
}
