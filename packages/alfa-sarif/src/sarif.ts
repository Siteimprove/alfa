export { Artifact, Location, Log, ReportingDescriptor, Result } from "sarif";

import * as sarif from "sarif";

export type SARIF =
  | sarif.Artifact
  | sarif.Location
  | sarif.Log
  | sarif.ReportingDescriptor
  | sarif.Result;
