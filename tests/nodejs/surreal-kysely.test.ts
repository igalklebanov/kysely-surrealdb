import {expect} from 'chai'
import {Compilable, GeneratedAlways, sql} from 'kysely'
import nodeFetch from 'node-fetch'
import {fetch as undiciFetch} from 'undici'

import {SurrealDbHttpDialect, SurrealDbHttpDialectConfig, SurrealKysely} from '../../src'

interface Database {
  person: Person
  user: User
  write: Write
  article: Article
}

interface Person {
  id: GeneratedAlways<string>
  name: string | null
  company: string | null
  skills: string[] | null
  username: string | null
  interests: string[] | null
}

interface User {
  id: string
  nickname: string | null
}

interface Write {
  source: string | null
  tags: string[] | null
  time: {
    written: string | null
  } | null
}

interface Article {
  id: GeneratedAlways<string>
}

describe('SurrealKysely', () => {
  let db: SurrealKysely<Database>

  before(async () => {
    db = getDB()
  })

  describe('create', () => {
    after(async () => {
      await dropTable('person')
    })

    it('should execute a create...set query with a random id.', async () => {
      const query = db.create('person').set({
        name: 'Tobie',
        company: 'SurrealDB',
        skills: ['Rust', 'Go', 'JavaScript'],
      })

      testSurrealQL(query, 'create person set name = $1, company = $2, skills = $3', [
        'Tobie',
        'SurrealDB',
        ['Rust', 'Go', 'JavaScript'],
      ])

      const actual = await query.execute()

      expect(actual).to.be.an('array').which.has.lengthOf(1)
    })

    it('should execute a create...set query with a specific numeric id.', async () => {
      const query = db.create('person:100').set({
        name: 'Tobie',
        company: 'SurrealDB',
        skills: ['Rust', 'Go', 'JavaScript'],
      })

      testSurrealQL(query, 'create person:100 set name = $1, company = $2, skills = $3', [
        'Tobie',
        'SurrealDB',
        ['Rust', 'Go', 'JavaScript'],
      ])

      const actual = await query.execute()

      expect(actual).to.be.an('array').which.has.lengthOf(1)
      expect(actual[0]).to.deep.equal({
        id: 'person:100',
        name: 'Tobie',
        company: 'SurrealDB',
        skills: ['Rust', 'Go', 'JavaScript'],
      })
    })

    it('should execute a create...set query with a specific string id.', async () => {
      const query = db.create('person:tobie').set({
        name: 'Tobie',
        company: 'SurrealDB',
        skills: ['Rust', 'Go', 'JavaScript'],
      })

      testSurrealQL(query, 'create person:tobie set name = $1, company = $2, skills = $3', [
        'Tobie',
        'SurrealDB',
        ['Rust', 'Go', 'JavaScript'],
      ])

      const actual = await query.execute()

      expect(actual).to.be.an('array').which.has.lengthOf(1)
      expect(actual[0]).to.deep.equal({
        id: 'person:tobie',
        name: 'Tobie',
        company: 'SurrealDB',
        skills: ['Rust', 'Go', 'JavaScript'],
      })
    })

    it('should execute a create...content query with a random id.', async () => {
      const query = db.create('person').content({
        name: 'Tobie',
        company: 'SurrealDB',
        skills: ['Rust', 'Go', 'JavaScript'],
      })

      testSurrealQL(query, 'create person content $1', [
        {name: 'Tobie', company: 'SurrealDB', skills: ['Rust', 'Go', 'JavaScript']},
      ])

      const actual = await query.execute()

      expect(actual).to.be.an('array').which.has.lengthOf(1)
    })

    it('should execute a create...content query with a specific id.', async () => {
      const query = db.create('person:tobie2').content({
        name: 'Tobie',
        company: 'SurrealDB',
        skills: ['Rust', 'Go', 'JavaScript'],
      })

      testSurrealQL(query, 'create person:tobie2 content $1', [
        {name: 'Tobie', company: 'SurrealDB', skills: ['Rust', 'Go', 'JavaScript']},
      ])

      const actual = await query.execute()

      expect(actual).to.be.an('array').which.has.lengthOf(1)
      expect(actual[0]).to.deep.equal({
        id: 'person:tobie2',
        name: 'Tobie',
        company: 'SurrealDB',
        skills: ['Rust', 'Go', 'JavaScript'],
      })
    })

    it('should execute a create...set...return none query.', async () => {
      const query = db
        .create('person')
        .set({
          age: 46,
          username: 'john-smith',
        })
        .return('none')

      testSurrealQL(query, 'create person set age = $1, username = $2 return none', [46, 'john-smith'])

      const actual = await query.execute()

      expect(actual).to.be.an('array').that.is.empty
    })

    it('should execute a create...set...return diff query.', async () => {
      const query = db
        .create('person')
        .set({
          age: 46,
          username: 'john-smith',
        })
        .return('diff')

      testSurrealQL(query, 'create person set age = $1, username = $2 return diff', [46, 'john-smith'])

      const actual = await query.execute()

      expect(actual).to.be.an('array').which.has.lengthOf(1)
    })

    it('should execute a create...set...return before query.', async () => {
      const query = db
        .create('person')
        .set({
          age: 46,
          username: 'john-smith',
        })
        .return('before')

      testSurrealQL(query, 'create person set age = $1, username = $2 return before', [46, 'john-smith'])

      const actual = await query.execute()

      expect(actual).to.be.an('array').which.has.lengthOf(1)
    })

    it('should execute a create...set...return after query.', async () => {
      const query = db
        .create('person')
        .set({
          age: 46,
          username: 'john-smith',
        })
        .return('after')

      testSurrealQL(query, 'create person set age = $1, username = $2 return after', [46, 'john-smith'])

      const actual = await query.execute()

      expect(actual).to.be.an('array').which.has.lengthOf(1)
    })

    it('should execute a create...set...return field query.', async () => {
      const query = db
        .create('person')
        .set({
          age: 46,
          username: 'john-smith',
          interests: ['skiing', 'music'],
        })
        .return('interests')

      testSurrealQL(query, 'create person set age = $1, username = $2, interests = $3 return interests', [
        46,
        'john-smith',
        ['skiing', 'music'],
      ])

      const actual = await query.execute()

      expect(actual).to.be.an('array').which.has.lengthOf(1)
      expect(actual[0]).to.deep.equal({interests: ['skiing', 'music']})
    })

    it('should execute a create...set...return multiple fields query.', async () => {
      const query = db
        .create('person')
        .set({
          age: 46,
          username: 'john-smith',
          interests: ['skiing', 'music'],
        })
        .return(['name', 'interests'])

      testSurrealQL(query, 'create person set age = $1, username = $2, interests = $3 return name, interests', [
        46,
        'john-smith',
        ['skiing', 'music'],
      ])

      const actual = await query.execute()

      expect(actual).to.be.an('array').which.has.lengthOf(1)
      expect(actual[0]).to.deep.equal({interests: ['skiing', 'music'], name: null})
    })

    it('should execute a create...set query with table and id as 2 separate arguments.', async () => {
      const query = db.create('person', 'recordid').set({
        age: 46,
        username: 'john-smith',
        interests: ['skiing', 'music'],
      })

      testSurrealQL(query, 'create person:recordid set age = $1, username = $2, interests = $3', [
        46,
        'john-smith',
        ['skiing', 'music'],
      ])

      const actual = await query.execute()

      expect(actual).to.be.an('array').which.has.lengthOf(1)
    })
  })

  describe('relate', () => {
    before(async () => {
      await insertUsers()
      await insertArticles()
    })

    after(async () => {
      await dropTable('write')
      await dropTable('user')
      await dropTable('article')
    })

    it('should execute a relate...set query between two specific records.', async () => {
      const query = db
        .relate('write')
        .from('user:tobie')
        .to('article:surreal')
        .set({
          'time.written': sql`time::now()`,
        })

      testSurrealQL(query, 'relate user:tobie->write->article:surreal set time.written = time::now()', [])

      const actual = await query.execute()

      expect(actual).to.be.an('array').which.has.lengthOf(1)
    })

    it('should execute a relate...set query between two specific records (table and id in separate arguments).', async () => {
      const query = db
        .relate('write')
        .from('user', 'tobie')
        .to('article', 'surrealql')
        .set({
          'time.written': sql`time::now()`,
        })

      testSurrealQL(query, 'relate user:tobie->write->article:surrealql set time.written = time::now()', [])

      const actual = await query.execute()

      expect(actual).to.be.an('array').which.has.lengthOf(1)
    })
  })
})

function getDB(config?: Partial<SurrealDbHttpDialectConfig>): SurrealKysely<Database> {
  return new SurrealKysely({
    dialect: new SurrealDbHttpDialect({
      database: 'test',
      fetch: getFetch(),
      hostname: 'localhost:8000',
      namespace: 'test',
      password: 'root',
      username: 'root',
      ...config,
    }),
  })
}

function getFetch() {
  const {version} = process

  if (version.startsWith('v18')) {
    return fetch
  }

  if (version.startsWith('v16')) {
    return undiciFetch
  }

  return nodeFetch
}

function testSurrealQL(query: Compilable, expected: string, parameters: unknown[]): void {
  const compiledQuery = query.compile()

  expect(compiledQuery.sql).to.be.equal(expected)
  expect(compiledQuery.parameters).to.be.deep.equal(parameters)
}

async function dropTable(table: keyof Database): Promise<void> {
  await sql`remove table ${sql.table(table)}`.execute(getDB())
}

async function insertUsers(): Promise<void> {
  await getDB()
    .insertInto('user')
    .values([{id: 'tobie', nickname: 'Tobie'}])
    .execute()
}

async function insertArticles(): Promise<void> {
  await getDB()
    .insertInto('article')
    .values([
      {id: 'surreal', title: 'Surreal'},
      {id: 'surrealql', title: 'SurrealQL'},
    ])
    .execute()
}
