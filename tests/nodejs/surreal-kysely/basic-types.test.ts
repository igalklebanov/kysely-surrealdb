import {expect} from 'chai'

import {FALSE, NONE, NULL, TRUE} from '../../../src/helpers'
import {DIALECTS, dropTables, initTests, testSurrealQl, type TestContext} from './shared'

DIALECTS.forEach((dialect) => {
  describe(`${dialect}: Basic types`, () => {
    let ctx: TestContext

    before(async () => {
      ctx = initTests(dialect)
    })

    afterEach(async () => {
      await dropTables(ctx, ['person'])
    })

    after(async () => {
      await ctx.db.destroy()
    })

    it('should support none values.', async () => {
      const query = ctx.db.create('person').set({children: NONE})

      testSurrealQl(query, {
        sql: 'create person set children = none',
        parameters: [],
      })

      const actual = await query.execute()

      expect(actual).to.be.an('array').which.has.lengthOf(1)
    })

    it('should support null values.', async () => {
      const query = ctx.db.create('person').set({children: NULL})

      testSurrealQl(query, {
        sql: 'create person set children = null',
        parameters: [],
      })

      const actual = await query.execute()

      expect(actual).to.be.an('array').which.has.lengthOf(1)
    })

    it('should support booleans.', async () => {
      const query = ctx.db.create('person').set({newsletter: FALSE, interested: TRUE})

      testSurrealQl(query, {
        sql: 'create person set newsletter = false, interested = true',
        parameters: [],
      })

      const actual = await query.execute()

      expect(actual).to.be.an('array').which.has.lengthOf(1)
    })
  })
})
