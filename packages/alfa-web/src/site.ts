import { Graph } from "@siteimprove/alfa-graph";
import * as json from "@siteimprove/alfa-json";

import { Resource } from "./resource";

/**
 * @see https://en.wikipedia.org/wiki/Web_site
 */
export class Site implements json.Serializable {
  public static of(resources: Graph<Resource>): Site {
    return new Site(resources);
  }

  private readonly _resources: Graph<Resource>;

  private constructor(resources: Graph<Resource>) {
    this._resources = resources;
  }

  public get resources(): Graph<Resource> {
    return this._resources;
  }

  public toJSON(): Site.JSON {
    return {
      resources: this._resources.toJSON(),
    };
  }
}

export namespace Site {
  export interface JSON {
    [key: string]: json.JSON;
    resources: Graph.JSON;
  }
}
