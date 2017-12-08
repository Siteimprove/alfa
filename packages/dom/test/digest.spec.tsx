import test from 'ava'
import { Element } from '../src/types'
import { digest } from '../src/digest'

test('Returns the digest value of a DOM node', t => {
  const foo: Element = (
    <div class='foo'>
      Hello world!
    </div>
  )

  t.is(digest(foo), 'ZEFMOG4PLZ4SK7Ky0k5CdPa++++QJrK/r2YrIxIV3Ls=')
})
