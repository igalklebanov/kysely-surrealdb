import {expect} from 'chai'
import {sql} from 'kysely'
import {fail} from 'node:assert'

import {SurrealDbHttpTransactionsUnsupportedError} from '../../../src'
import {DIALECTS, dropTables, initTests, prepareTables, type TestContext} from './shared'

DIALECTS.forEach((dialect) => {
  describe(`${dialect}: SurrealKysely.transaction(...)`, () => {
    let ctx: TestContext

    before(async () => {
      ctx = initTests(dialect)
    })

    beforeEach(async () => {
      await prepareTables(ctx, ['person'])
    })

    afterEach(async () => {
      await dropTables(ctx, ['person'])
    })

    after(async () => {
      await ctx.db.destroy()
    })

    if (dialect === 'http') {
      it('should throw an error when trying to use transactions.', async () => {
        try {
          await ctx.db.transaction().execute(async (_) => {})

          fail('Should have thrown an error.')
        } catch (error) {
          expect(error).to.be.an.instanceOf(SurrealDbHttpTransactionsUnsupportedError)
        }
      })
    }

    if (dialect === 'websockets') {
      it('should execute a transaction and commit.', async () => {
        await ctx.db.transaction().execute(async (tx) => {
          await tx.insertInto('person').values({id: 'person:transaction0', name: 'Tobie'}).execute()
          await tx.insertInto('person').values({id: 'person:transaction1', name: 'Igal'}).execute()
        })

        await expect(
          ctx.db
            .selectFrom('person')
            .selectAll()
            .where('id', sql`inside`, sql`['person:transaction0', 'person:transaction1']`)
            .execute(),
        ).to.eventually.have.lengthOf(2)
      })

      // FIXME: This test fails because the transaction is not rolled back.
      it.skip('should execute a transaction and cancel.', async () => {
        try {
          await ctx.db.transaction().execute(async (tx) => {
            await tx.insertInto('person').values({id: 'person:transaction2', name: 'Tobie'}).execute()
            await tx.insertInto('person').values({id: 'person:transaction3', name: 'Igal'}).execute()

            throw new Error('Cancel transaction.')
          })

          fail('Should have thrown an error.')
        } catch (error) {
          expect(error.message).to.equal('Cancel transaction.')
        }

        await expect(
          ctx.db
            .selectFrom('person')
            .selectAll()
            .where('id', sql`inside`, sql`['person:transaction2', 'person:transaction3']`)
            .execute(),
        ).to.eventually.have.lengthOf(0)
      })
    }
  })
})
