import type { Graph } from "@siteimprove/alfa-graph";

import type * as json from "@siteimprove/alfa-json";

import type { Resource } from "./resource.js";

/**
 * {@link https://en.wikipedia.org/wiki/Web_site}
 *
 * @public
 */
export class Site<R extends Resource = Resource>
  implements json.Serializable<Site.JSON<R>>
{
  public static of<R extends Resource>(resources: Graph<R>): Site<R> {
    return new Site(resources);
  }

  private readonly _resources: Graph<R>;

  protected constructor(resources: Graph<R>) {
    this._resources = resources;
  }

  public get resources(): Graph<R> {
    return this._resources;
  }

  public toJSON(): Site.JSON<R> {
    return {
      resources: this._resources.toJSON(),
    };
  }
}

/**
 * @public
 */
export namespace Site {
  export interface JSON<R extends Resource = Resource> {
    [key: string]: json.JSON;
    resources: Graph.JSON<R>;
  }
}
