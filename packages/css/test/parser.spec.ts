import test, { TestContext } from 'ava'
import { lex, parse } from '@alfa/lang'
import { CssToken, CssAlphabet } from '../src/lexer'
import { CssTree, CssGrammar } from '../src/parser'

function css (t: TestContext, input: string, expected: CssTree) {
  t.deepEqual(parse(lex(input, CssAlphabet), CssGrammar), expected)
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
