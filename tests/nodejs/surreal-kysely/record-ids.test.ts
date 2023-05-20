import {expect} from 'chai'
import {sql} from 'kysely'

import {DIALECTS, dropTables, initTests, testSurrealQl, type TestContext} from './shared'

DIALECTS.forEach((dialect) => {
  describe(`${dialect}: Record IDs`, () => {
    let ctx: TestContext

    before(async () => {
      ctx = initTests(dialect)
    })

    afterEach(async () => {
      await dropTables(ctx, ['article', 'company', 'temperature'])
    })

    after(async () => {
      await ctx.db.destroy()
    })

    it('should support simple text record IDs.', async () => {
      const query = ctx.db.create('company:surrealdb').set({name: 'SurrealDB'})

      testSurrealQl(query, {
        sql: 'create company:surrealdb set name = $1',
        parameters: ['SurrealDB'],
      })

      const actual = await query.execute()

      expect(actual).to.be.an('array').which.has.lengthOf(1)
    })

    it('should support text record IDs with complex characters surrounded by the ` character.', async () => {
      const query = ctx.db
        .create('article:`8424486b-85b3-4448-ac8d-5d51083391c7`')
        .set({time: sql`time::now()`, author: sql`person:tobie`})

      testSurrealQl(query, {
        sql: 'create article:`8424486b-85b3-4448-ac8d-5d51083391c7` set time = time::now(), author = person:tobie',
        parameters: [],
      })

      const actual = await query.execute()

      expect(actual).to.be.an('array').which.has.lengthOf(1)
    })

    it('should support text record IDs with complex characters surrounded by the ⟨ and ⟩ characters.', async () => {
      const query = ctx.db
        .create('article:⟨8424486b-85b3-4448-ac8d-5d51083391c7⟩')
        .set({time: sql`time::now()`, author: sql`person:tobie`})

      testSurrealQl(query, {
        sql: 'create article:⟨8424486b-85b3-4448-ac8d-5d51083391c7⟩ set time = time::now(), author = person:tobie',
        parameters: [],
      })

      const actual = await query.execute()

      expect(actual).to.be.an('array').which.has.lengthOf(1)
    })

    it('should support numeric record IDs.', async () => {
      const query = ctx.db.create('temperature:17493').set({
        time: sql`time::now()`,
        celsius: 37.5,
      })

      testSurrealQl(query, {
        sql: 'create temperature:17493 set time = time::now(), celsius = $1',
        parameters: [37.5],
      })

      const actual = await query.execute()

      expect(actual).to.be.an('array').which.has.lengthOf(1)
    })

    // FIXME: not 1:1 with docs @ https://surrealdb.com/docs/surrealql/datamodel/ids
    // no way of using $now in create method yet.
    it('should support object-based record IDs.', async () => {
      const query = ctx.db.create("temperature:{ location: 'London', date: time::now() }").set({
        location: 'London',
        date: sql`string::slice(id, 21, 31)`,
        temperature: 23.7,
      })

      testSurrealQl(query, {
        sql: "create temperature:{ location: 'London', date: time::now() } set location = $1, date = string::slice(id, 21, 31), temperature = $2",
        parameters: ['London', 23.7],
      })

      const actual = await query.execute()

      expect(actual).to.be.an('array').which.has.lengthOf(1)
    })

    // FIXME: not 1:1 with docs @ https://surrealdb.com/docs/surrealql/datamodel/ids
    // no way of using $now in create method yet.
    it('should support array-based record IDs.', async () => {
      const query = ctx.db.create("temperature:['London', time::now()]").set({
        location: 'London',
        date: sql`string::slice(id, 24, 30)`,
        temperature: 23.7,
      })

      testSurrealQl(query, {
        sql: "create temperature:['London', time::now()] set location = $1, date = string::slice(id, 24, 30), temperature = $2",
        parameters: ['London', 23.7],
      })

      const actual = await query.execute()

      expect(actual).to.be.an('array').which.has.lengthOf(1)
    })

    const idGenerationFunctions = ['rand', 'ulid', 'uuid']

    idGenerationFunctions.forEach((generator) =>
      it(`should support record IDs generated with ${generator}().`, async () => {
        const query = ctx.db.create(`temperature:${generator}()`).set({
          time: sql`time::now()`,
          celsius: 37.5,
        })

        testSurrealQl(query, {
          sql: `create temperature:${generator}() set time = time::now(), celsius = $1`,
          parameters: [37.5],
        })

        const actual = await query.execute()

        expect(actual).to.be.an('array').which.has.lengthOf(1)
      }),
    )

    // FIXME: can't support these due to kysely schema table name splitting @ `parseTable`.
    it.skip('should support simple numeric record ID ranges.', async () => {
      const query = ctx.db.selectFrom('person:1..1000').selectAll()

      testSurrealQl(query, {
        sql: 'select * from person:1..1000',
        parameters: [],
      })

      await query.execute()
    })

    // FIXME: can't support these due to kysely schema table name splitting @ `parseTable`.
    it.skip('should support array-based record ID inclusive ranges.', async () => {
      const query = ctx.db.selectFrom("temperature:['London', NONE]..=['London', time::now()]").selectAll()

      testSurrealQl(query, {
        sql: "select * from temperature:['London', NONE]..=['London', time::now()]",
        parameters: [],
      })

      await query.execute()
    })

    // FIXME: can't support these due to kysely schema table name splitting @ `parseTable`.
    it.skip('should support array-based record ID less than ranges.', async () => {
      const query = ctx.db.selectFrom("temperature:..['London', '2022-08-29T08:09:31']").selectAll()

      testSurrealQl(query, {
        sql: "select * from temperature:..['London', '2022-08-29T08:09:31']",
        parameters: [],
      })

      await query.execute()
    })

    // FIXME: can't support these due to kysely schema table name splitting @ `parseTable`.
    it.skip('should support array-based record ID greater than ranges.', async () => {
      const query = ctx.db.selectFrom("temperature:['London', '2022-08-29T08:03:39']..").selectAll()

      testSurrealQl(query, {
        sql: "select * from temperature:['London', '2022-08-29T08:03:39']..",
        parameters: [],
      })

      await query.execute()
    })

    // FIXME: can't support these due to kysely schema table name splitting @ `parseTable`.
    it.skip('should support array-based record ID ranges.', async () => {
      const query = ctx.db
        .selectFrom("temperature:['London', '2022-08-29T08:03:39']..['London', '2022-08-29T08:09:31']")
        .selectAll()

      testSurrealQl(query, {
        sql: "select * from temperature:['London', '2022-08-29T08:03:39']..['London', '2022-08-29T08:09:31']",
        parameters: [],
      })

      await query.execute()
    })
  })
})
