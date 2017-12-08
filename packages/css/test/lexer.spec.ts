import test, { TestContext } from 'ava'
import { lex } from '@alfa/lang'
import { CssToken, CssPatterns } from '../src/lexer'

function css (t: TestContext, input: string, expected: Array<CssToken>) {
  t.deepEqual([...lex(input, CssPatterns)], expected)
}

test('Can lex whitespace', t => css(t,
  '  \n',
  [
    { type: 'whitespace' }
  ]
))

test('Can lex a comment', t => css(t,
  '/*Hello world*/',
  [
    { type: 'comment', value: 'Hello world' }
  ]
))

test('Can lex an ident', t => css(t,
  'foo',
  [
    { type: 'ident', value: 'foo' }
  ]
))

test('Can lex an ident prefixed with a hyphen', t => css(t,
  '-foo',
  [
    { type: 'ident', value: '-foo' }
  ]
))

test('Can lex an ident containing an underscore', t => css(t,
  'foo_bar',
  [
    { type: 'ident', value: 'foo_bar' }
  ]
))

test('Can lex an ident containing a hyphen', t => css(t,
  'foo-bar',
  [
    { type: 'ident', value: 'foo-bar' }
  ]
))

test('Can lex a double quoted string', t => css(t,
  '"foo"',
  [
    { type: 'string', value: 'foo' }
  ]
))

test('Can lex a single quoted string', t => css(t,
  '\'foo\'',
  [
    { type: 'string', value: 'foo' }
  ]
))

test('Can lex an integer', t => css(t,
  '123',
  [
    { type: 'number', value: 123 }
  ]
))

test('Can lex a decimal', t => css(t,
  '123.456',
  [
    { type: 'number', value: 123.456 }
  ]
))

test('Can lex a number in E-notation', t => css(t,
  '123.456e2',
  [
    { type: 'number', value: 123.456e2 }
  ]
))

test('Can lex a rule declaration', t => css(t,
  '#foo{background:none}',
  [
    { type: 'delim', value: '#' },
    { type: 'ident', value: 'foo' },
    { type: '{' },
    { type: 'ident', value: 'background' },
    { type: ':' },
    { type: 'ident', value: 'none' },
    { type: '}' }
  ]
))
