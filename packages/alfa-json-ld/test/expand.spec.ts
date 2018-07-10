import { test } from "@siteimprove/alfa-test";
import { expand } from "../src/expand";
import { Document } from "../src/types";
import { Person } from "./helpers/person";

export const person: Document = {
  "@context": Person,
  name: "Manu Sporny",
  image: {
    "@id": "http://manu.sporny.org/images/manu.png"
  },
  homepage: {
    "@id": "http://manu.sporny.org/"
  }
};

test("Expands the terms of a JSON-LD document", t => {
  t.deepEqual(expand(person), [
    {
      "http://schema.org/url": [
        {
          "@id": "http://manu.sporny.org/"
        }
      ],
      "http://schema.org/image": [
        {
          "@id": "http://manu.sporny.org/images/manu.png"
        }
      ],
      "http://schema.org/name": [
        {
          "@value": "Manu Sporny"
        }
      ]
    }
  ]);
});
