import { Collection } from "@siteimprove/alfa-collection";
import { Equatable } from "@siteimprove/alfa-equatable";

import * as earl from "@siteimprove/alfa-earl";
import * as json from "@siteimprove/alfa-json";
import * as sarif from "@siteimprove/alfa-sarif";

interface Flag {
  [flag: string]: boolean;
}

/**
 * @public
 */
export abstract class Node<T extends string = string, F extends Flag = {}>
  implements
    Collection<Node<T, F>>,
    Equatable,
    earl.Serializable<Node.JSON<T, F>>,
    json.Serializable<Node.JSON<T, F>>,
    sarif.Serializable<Node.JSON<T, F>> {}
