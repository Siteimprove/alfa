import { test } from '@alfa/test'
import { Element } from '../../src/types'
import { find } from '../../src/element/find'
import { matches } from '../../src/element/matches'

test('Matches an element against a tag', async t => {
  t.true(matches(<div></div>, 'div'))
})

test('Matches an element against a class', async t => {
  t.true(matches(<div class='foo'></div>, '.foo'))
})

test('Matches an element against an ID', async t => {
  t.true(matches(<div id='foo'></div>, '#foo'))
})

test('Matches an element against a list of selectors', async t => {
  t.true(matches(<div class='foo'></div>, '.foo, #bar'))
  t.true(matches(<div id='bar'></div>, '.foo, #bar'))
})

test('Matches an element against a descendant selector', async t => {
  const document: Element = (
    <div>
      <p>
        <span id='foo'></span>
      </p>
    </div>
  )

  const foo = find(document, '#foo')

  if (foo === null) {
    t.fail()
  } else {
    t.true(matches(foo, 'div #foo'))
  }
})

test('Matches an element against a direct descendant selector', async t => {
  const document: Element = (
    <div>
      <span id='foo'></span>
    </div>
  )

  const foo = find(document, '#foo')

  if (foo === null) {
    t.fail()
  } else {
    t.true(matches(foo, 'div > #foo'))
  }
})

test('Matches an element against a sibling selector', async t => {
  const document: Element = (
    <div>
      <p></p>
      <b></b>
      <span id='foo'></span>
    </div>
  )

  const foo = find(document, '#foo')

  if (foo === null) {
    t.fail()
  } else {
    t.true(matches(foo, 'p ~ #foo'))
  }
})

test('Matches an element against a direct sibling selector', async t => {
  const document: Element = (
    <div>
      <p></p>
      <span id='foo'></span>
    </div>
  )

  const foo = find(document, '#foo')

  if (foo === null) {
    t.fail()
  } else {
    t.true(matches(foo, 'p + #foo'))
  }
})
