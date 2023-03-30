import {expect} from 'chai'
import {sql, UpdateResult} from 'kysely'

import {DIALECTS, dropTables, initTests, prepareTables, testSurrealQl, type Account, type TestContext} from './shared'

DIALECTS.forEach((dialect) => {
  describe(`${dialect}: SurrealKysely.ifThen(...)`, () => {
    let ctx: TestContext

    before(async () => {
      ctx = initTests(dialect)
    })

    beforeEach(async () => {
      await prepareTables(ctx, ['account', 'person'])
    })

    afterEach(async () => {
      await dropTables(ctx, ['account', 'person'])
    })

    after(async () => {
      await ctx.db.destroy()
    })

    it('should execute an if...then...elseif...then...else...end query.', async () => {
      const auth = {account: 'account:123'}

      for (const {scope, resultCount} of [
        {scope: 'admin', resultCount: 2},
        {scope: 'user', resultCount: 1},
        {scope: 'moderator', resultCount: 0},
      ]) {
        const query = ctx.db
          .ifThen(sql`${scope} = ${sql.literal('admin')}`, ctx.db.selectFrom('account').selectAll())
          .elseIfThen(sql`${scope} = ${sql.literal('user')}`, sql<Account[]>`(select * from ${auth}.account)`)
          .else(sql<[]>`[]`)
          .end()

        testSurrealQl(query, {
          sql: [
            `if $1 = 'admin' then (select * from account)`,
            `else if $2 = 'user' then (select * from $3.account)`,
            'else [] end',
          ].join(' '),
          parameters: [scope, scope, auth],
        })

        const actual = await query.execute()

        expect(actual).to.be.an('array').which.has.lengthOf(resultCount)
      }
    })

    it('should execute an update...set...if...then...elseif...else...end query.', async () => {
      const query = ctx.db.updateTable('person').set({
        railcard: ctx.db
          .ifThen(sql`${sql.ref('age')} <= 10`, sql`${sql.literal('junior')}`.$castTo<'junior'>())
          .elseIfThen(sql`${sql.ref('age')} <= 21`, sql.literal('student').$castTo<'student'>())
          .elseIfThen(sql`${sql.ref('age')} >= 65`, sql.literal('senior').$castTo<'senior'>())
          .else(sql`null`)
          .end(),
      })

      testSurrealQl(query, {
        sql: [
          'update person',
          'set railcard =',
          `if age <= 10 then 'junior'`,
          `else if age <= 21 then 'student'`,
          `else if age >= 65 then 'senior'`,
          'else null end',
        ].join(' '),
        parameters: [],
      })

      const actual = await query.executeTakeFirstOrThrow()

      expect(actual).to.be.instanceOf(UpdateResult)
      expect(actual.numUpdatedRows).to.be.equal(4n)
    })
  })
})
