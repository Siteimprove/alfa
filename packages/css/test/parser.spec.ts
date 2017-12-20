import test, { TestContext } from 'ava'
import { CssTree, parse } from '../src/parser'

function css (t: TestContext, input: string, expected: CssTree) {
  t.deepEqual(parse(input), expected)
}

test('Can parse an ID selector', t => css(t,
  '#foo',
  {
    type: 'id-selector',
    name: 'foo'
  }
))

test('Can parse a class selector', t => css(t,
  '.foo',
  {
    type: 'class-selector',
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
