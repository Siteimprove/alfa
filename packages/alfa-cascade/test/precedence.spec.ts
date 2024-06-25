import { Specificity } from "@siteimprove/alfa-selector";
import { test } from "@siteimprove/alfa-test";

import { Layer, Origin, Precedence } from "../dist/precedence";

// The name and importance do not matter at this point, only the order.
const lowLayer = Layer.of("foo", false).withOrder(1);
const highLayer = Layer.of("bar", false).withOrder(2);

function precedence(input: Partial<Precedence<true>>): Precedence<true> {
  return {
    origin: Origin.NormalUserAgent,
    encapsulation: -1,
    isElementAttached: false,
    layer: Layer.empty(),
    specificity: Specificity.of(0, 0, 1),
    order: 0,
    ...input,
  };
}

function serialize(array: Array<Precedence>): Array<Precedence.JSON> {
  return array.map(Precedence.toJSON);
}

function sortAndSerialize(
  array: Array<Precedence<true>>,
): Array<Precedence.JSON> {
  return serialize(array.sort(Precedence.compare));
}

test(".compare() sorts items by origin and importance", (t) => {
  const UAImportant = precedence({ origin: Origin.ImportantUserAgent });
  const UANormal = precedence({ origin: Origin.NormalUserAgent });
  const AuthorImportant = precedence({ origin: Origin.ImportantAuthor });
  const AuthorNormal = precedence({ origin: Origin.NormalAuthor });

  t.deepEqual(
    sortAndSerialize([UAImportant, UANormal, AuthorImportant, AuthorNormal]),
    serialize([UANormal, AuthorNormal, AuthorImportant, UAImportant]),
  );
});

test(".compare() sorts items by encapsulation context", (t) => {
  const precedence1 = precedence({ encapsulation: 1 });
  const precedence2 = precedence({ encapsulation: -2 });

  t.deepEqual(
    sortAndSerialize([precedence1, precedence2]),
    serialize([precedence2, precedence1]),
  );
});

test(".compare() sorts items by presence in style attribute", (t) => {
  const precedence1 = precedence({ isElementAttached: true });
  const precedence2 = precedence({ isElementAttached: false });

  t.deepEqual(
    sortAndSerialize([precedence1, precedence2]),
    serialize([precedence2, precedence1]),
  );
});

test(".compare() sorts items by layer order", (t) => {
  const precedence1 = precedence({ layer: highLayer });
  const precedence2 = precedence({ layer: lowLayer });

  t.deepEqual(
    sortAndSerialize([precedence1, precedence2]),
    serialize([precedence2, precedence1]),
  );
});

test(".compare() sorts items by specificity", (t) => {
  const precedence1 = precedence({ specificity: Specificity.of(0, 1, 0) });
  const precedence2 = precedence({ specificity: Specificity.of(0, 0, 1) });
  const precedence3 = precedence({ specificity: Specificity.of(1, 0, 0) });

  t.deepEqual(
    sortAndSerialize([precedence1, precedence2, precedence3]),
    serialize([precedence2, precedence1, precedence3]),
  );
});

test(".compare() sorts items by order", (t) => {
  const precedence1 = precedence({ order: 42 });
  const precedence2 = precedence({ order: 17 });

  t.deepEqual(
    sortAndSerialize([precedence1, precedence2]),
    serialize([precedence2, precedence1]),
  );
});

test(".compare() prioritises origin over everthing else", (t) => {
  const highEverything = precedence({
    origin: Origin.ImportantAuthor,
    encapsulation: +Infinity,
    isElementAttached: true,
    layer: highLayer,
    specificity: Specificity.of(1000, 1000, 1000),
    order: +Infinity,
  });
  const highOrigin = precedence({
    origin: Origin.ImportantUserAgent,
    encapsulation: -Infinity,
    isElementAttached: false,
    layer: lowLayer,
    specificity: Specificity.of(0, 0, 0),
    order: -Infinity,
  });

  t.deepEqual(
    sortAndSerialize([highOrigin, highEverything]),
    serialize([highEverything, highOrigin]),
  );
});

test(".compare() prioritises encapsulation context over everthing except origin", (t) => {
  const highEverything = precedence({
    encapsulation: 1,
    isElementAttached: true,
    layer: highLayer,
    specificity: Specificity.of(1000, 1000, 1000),
    order: +Infinity,
  });
  const highEncapsulation = precedence({
    encapsulation: 2,
    isElementAttached: false,
    layer: lowLayer,
    specificity: Specificity.of(0, 0, 0),
    order: -Infinity,
  });

  t.deepEqual(
    sortAndSerialize([highEncapsulation, highEverything]),
    serialize([highEverything, highEncapsulation]),
  );
});

test(".compare() prioritises presence in style over everthing except origin and encapsulation", (t) => {
  const highEverything = precedence({
    isElementAttached: false,
    layer: highLayer,
    specificity: Specificity.of(1000, 1000, 1000),
    order: +Infinity,
  });
  const inStyleAttribute = precedence({
    isElementAttached: true,
    layer: lowLayer,
    specificity: Specificity.of(0, 0, 0),
    order: -Infinity,
  });

  t.deepEqual(
    sortAndSerialize([inStyleAttribute, highEverything]),
    serialize([highEverything, inStyleAttribute]),
  );
});

test(".compare() prioritises layer order over specificity and order", (t) => {
  const highSpecificityAndOrder = precedence({
    layer: lowLayer,
    specificity: Specificity.of(1000, 1000, 1000),
    order: +Infinity,
  });
  const highLayerOrder = precedence({
    layer: highLayer,
    specificity: Specificity.of(0, 0, 0),
    order: -Infinity,
  });

  t.deepEqual(
    sortAndSerialize([highLayerOrder, highSpecificityAndOrder]),
    serialize([highSpecificityAndOrder, highLayerOrder]),
  );
});

test(".compare() prioritises specificity over order", (t) => {
  const highOrder = precedence({
    specificity: Specificity.of(0, 0, 0),
    order: +Infinity,
  });
  const highSpecificity = precedence({
    specificity: Specificity.of(0, 0, 1),
    order: -Infinity,
  });

  t.deepEqual(
    sortAndSerialize([highSpecificity, highOrder]),
    serialize([highOrder, highSpecificity]),
  );
});
