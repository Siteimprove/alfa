export type {
  Artifact,
  Location,
  Log,
  ReportingDescriptor,
  Result,
} from "sarif";

import type * as sarif from "sarif";

/**
 * @public
 */
export type SARIF =
  | sarif.Artifact
  | sarif.Location
  | sarif.Log
  | sarif.ReportingDescriptor
  | sarif.Result;
