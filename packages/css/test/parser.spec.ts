import { test, TestContext } from 'tap'
import { CssTree, parse } from '../src/parser'

async function css (t: TestContext, input: string, expected: CssTree) {
  t.deepEqual(parse(input), expected)
}

test('Can parse a type selector', t => css(t,
  'div',
  {
    type: 'type-selector',
    name: 'div'
  }
))

test('Can parse a class selector', t => css(t,
  '.foo',
  {
    type: 'class-selector',
    name: 'foo'
  }
))

test('Can parse an ID selector', t => css(t,
  '#foo',
  {
    type: 'id-selector',
    name: 'foo'
  }
))

test('Can parse a compound selector', t => css(t,
  '#foo.bar',
  {
    type: 'compound-selector',
    selectors: [
      {
        type: 'id-selector',
        name: 'foo'
      },
      {
        type: 'class-selector',
        name: 'bar'
      }
    ]
  }
))

test('Can parse a compound selector with a type in prefix position', t => css(t,
  'div.foo',
  {
    type: 'compound-selector',
    selectors: [
      {
        type: 'type-selector',
        name: 'div'
      },
      {
        type: 'class-selector',
        name: 'foo'
      }
    ]
  }
))

test('Can parse a single descendant selector', t => css(t,
  'div .foo',
  {
    type: 'relative-selector',
    combinator: '>>',
    selector: {
      type: 'class-selector',
      name: 'foo'
    },
    relative: {
      type: 'type-selector',
      name: 'div'
    }
  }
))

test('Can parse a single descendant selector with a right-hand type selector', t => css(t,
  'div span',
  {
    type: 'relative-selector',
    combinator: '>>',
    selector: {
      type: 'type-selector',
      name: 'span'
    },
    relative: {
      type: 'type-selector',
      name: 'div'
    }
  }
))

test('Can parse a double descendant selector', t => css(t,
  'div .foo #bar',
  {
    type: 'relative-selector',
    combinator: '>>',
    selector: {
      type: 'id-selector',
      name: 'bar'
    },
    relative: {
      type: 'relative-selector',
      combinator: '>>',
      selector: {
        type: 'class-selector',
        name: 'foo'
      },
      relative: {
        type: 'type-selector',
        name: 'div'
      }
    }
  }
))

test('Can parse a direct descendant selector', t => css(t,
  'div > .foo',
  {
    type: 'relative-selector',
    combinator: '>',
    selector: {
      type: 'class-selector',
      name: 'foo'
    },
    relative: {
      type: 'type-selector',
      name: 'div'
    }
  }
))

test('Can parse a sibling selector', t => css(t,
  'div ~ .foo',
  {
    type: 'relative-selector',
    combinator: '~',
    selector: {
      type: 'class-selector',
      name: 'foo'
    },
    relative: {
      type: 'type-selector',
      name: 'div'
    }
  }
))

test('Can parse a direct sibling selector', t => css(t,
  'div + .foo',
  {
    type: 'relative-selector',
    combinator: '+',
    selector: {
      type: 'class-selector',
      name: 'foo'
    },
    relative: {
      type: 'type-selector',
      name: 'div'
    }
  }
))

test('Can parse a list of simple selectors', t => css(t,
  '.foo, .bar, .baz',
  {
    type: 'selector-list',
    selectors: [
      {
        type: 'class-selector',
        name: 'foo'
      },
      {
        type: 'class-selector',
        name: 'bar'
      },
      {
        type: 'class-selector',
        name: 'baz'
      }
    ]
  }
))

test('Can parse a list of simple and compound selectors', t => css(t,
  '.foo, #bar.baz',
  {
    type: 'selector-list',
    selectors: [
      {
        type: 'class-selector',
        name: 'foo'
      },
      {
        type: 'compound-selector',
        selectors: [
          {
            type: 'id-selector',
            name: 'bar'
          },
          {
            type: 'class-selector',
            name: 'baz'
          }
        ]
      }
    ]
  }
))
