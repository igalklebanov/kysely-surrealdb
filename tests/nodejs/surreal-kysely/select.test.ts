import {expect} from 'chai'
import {sql} from 'kysely'

import type {SurrealKysely} from '../../../src'
import {
  dropTable,
  getDb,
  insertArticles,
  insertCompanies,
  insertCustomers,
  insertPeople,
  insertTemperatures,
  insertUsers,
  testSurrealQl,
  type Customer,
  type Database,
  type Event,
  type Person,
  type User,
} from './shared'

describe.only('SurrealKysely.select(...)', () => {
  let db: SurrealKysely<Database>

  before(async () => {
    db = getDb()

    await insertUsers()
    await insertArticles()
    await insertCompanies()
    await insertCustomers()
    await insertPeople()
    await insertTemperatures()
  })

  after(async () => {
    await dropTable('company')
    await dropTable('user')
    await dropTable('article')
    await dropTable('customer')
    await dropTable('like')
    await dropTable('person')
    await dropTable('temperature')
  })

  it('should execute a select query.', async () => {
    const query = db.selectFrom('user').select(['age', 'name', 'email'])

    testSurrealQl(query, {
      sql: 'select age, name, email from user',
      parameters: [],
    })

    const actual = await query.execute()

    expect(actual).to.be.an('array').that.is.not.empty
    actual.forEach((user) => {
      expect(user).to.be.an('object')
      expect(Object.keys(user)).to.have.lengthOf(3)
      expect(user.age).to.satisfy((value: unknown) => value === null || typeof value === 'number')
      expect(user.email).to.satisfy((value: unknown) => value === null || typeof value === 'string')
      expect(user.name).to.satisfy((value: unknown) => value === null || typeof value === 'string')
    })
  })

  it('should execute a select query while using an expression in select clause.', async () => {
    const query = db.selectFrom('user').select((eb) => sql<boolean>`${eb.ref('age')} >= ${18}`.as('adult'))

    testSurrealQl(query, {
      sql: 'select age >= $1 as adult from user',
      parameters: [18],
    })

    const actual = await query.execute()

    expect(actual).to.be.an('array').that.is.not.empty
    actual.forEach((user) => {
      expect(user).to.be.an('object')
      expect(Object.keys(user)).to.have.lengthOf(1)
      expect(user.adult).to.be.a('boolean')
    })
  })

  it('should execute a select query while selecting nested array values.', async () => {
    const query = db
      .selectFrom('article')
      .selectAll()
      .select((eb) => sql<ReadonlyArray<string> | null>`${eb.ref('tags')}.*.${sql.ref('value')}`.as('tags'))

    testSurrealQl(query, {
      sql: 'select *, tags.*.value as tags from article',
      parameters: [],
    })

    const actual = await query.execute()

    expect(actual).to.be.an('array').that.is.not.empty
    actual.forEach((article) => {
      expect(article).to.be.an('object')
      expect(article.id).to.be.a('string')
      expect(article.title).to.satisfy((value: unknown) => value === null || typeof value === 'string')
      expect(article.tags).to.satisfy(
        (value: unknown) => value === null || (Array.isArray(value) && value.every((item) => typeof item === 'string')),
      )
    })
  })

  it('should execute a select query while filtering by nested array values.', async () => {
    const query = db
      .selectFrom('customer')
      .select((eb) =>
        sql<Customer['addresses']>`${eb.ref('addresses')}[where ${sql.ref('active')} = ${true}]`.as('addresses'),
      )

    testSurrealQl(query, {
      sql: 'select addresses[where active = $1] as addresses from customer',
      parameters: [true],
    })

    const actual = await query.execute()

    expect(actual).to.be.an('array').that.is.not.empty
    actual.forEach((customer) => {
      expect(customer).to.be.an('object')
      expect(Object.keys(customer)).to.have.lengthOf(1)
      expect(customer.addresses).to.satisfy((value: unknown) => value === null || Array.isArray(value))
      if (customer.addresses) {
        customer.addresses.every((item) => {
          expect(item).to.be.an('object')
          expect(item.active).to.be.true
        })
      }
    })
  })

  it('should execute a select query while selecting a remote field from connected graph edges.', async () => {
    const query = db
      .selectFrom('person:tobie')
      .select(sql<Person['name']>`->${sql.table('like')}->${sql.ref('person.name')}`.as('friends'))

    testSurrealQl(query, {
      sql: 'select ->like->person.name as friends from person:tobie',
      parameters: [],
    })

    const actual = await query.executeTakeFirstOrThrow()

    expect(actual).to.be.an('object')
    expect(Object.keys(actual)).to.have.lengthOf(1)
    expect(actual.friends).to.deep.equal(['Jaime'])
  })

  it('should execute a select query while using mathematical calculations in select clause.', async () => {
    const query = db
      .selectFrom('temperature')
      .select((eb) => sql<number>`( ( ${eb.ref('celsius')} * 2 ) + 30 )`.as('fahrenheit'))

    testSurrealQl(query, {
      sql: 'select ( ( celsius * 2 ) + 30 ) as fahrenheit from temperature',
      parameters: [],
    })

    const actual = await query.execute()

    expect(actual).to.be.an('array').that.is.not.empty
    actual.forEach((temperature) => {
      expect(temperature).to.be.an('object')
      expect(Object.keys(temperature)).to.have.lengthOf(1)
      expect(temperature.fahrenheit).to.be.a('number')
    })
  })

  it('should execute a select query while manually selecting generated object structure.', async () => {
    const expected = {weekly: false, monthly: true} as const

    const query = db.selectFrom('user').select(sql<typeof expected>`${expected}`.as('marketing settings'))

    testSurrealQl(query, {
      sql: 'select $1 as `marketing settings` from user',
      parameters: [expected],
    })

    const actual = await query.execute()

    expect(actual).to.be.an('array').that.is.not.empty
    actual.forEach((user) => {
      expect(user).to.be.an('object')
      expect(Object.keys(user)).to.have.lengthOf(1)
      expect(user['marketing settings']).to.be.deep.equal(expected)
    })
  })

  it('should execute a select query while using the result of a subquery as a returned field.', async () => {
    const query = db
      .selectFrom('user')
      .selectAll()
      .select(db.selectFrom('events').where('type', '=', 'activity').selectAll().limit(5).as('history'))
      .castTo<User & {history: ReadonlyArray<Event>}>()

    testSurrealQl(query, {
      sql: 'select *, (select * from events where type = $1 limit $2) as history from user',
      parameters: ['activity', 5],
    })

    const actual = await query.execute()

    expect(actual).to.be.an('array').that.is.not.empty
    actual.forEach((user) => {
      expect(user).to.be.an('object')
      expect(user.history).to.be.an('array').that.is.not.empty
      user.history.forEach((event) => {
        expect(event).to.be.an('object')
        expect(event.id).to.be.a('string')
        expect(event.type).to.equal('activity')
      })
    })
  })
})
