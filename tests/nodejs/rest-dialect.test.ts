import {expect} from 'chai'
import {Kysely, type ColumnType, type GeneratedAlways} from 'kysely'
import nodeFetch from 'node-fetch'
import {fetch as undiciFetch} from 'undici'

import {SurrealDbRestDialect, SurrealDbRestDialectConfig} from '../../src'

interface Database {
  person: Person
  pet: Pet
  toy: Toy
}

interface Person {
  id: GeneratedAlways<number>
  first_name: string | null
  middle_name: string | null
  last_name: string | null
  age: number
  gender: 'male' | 'female' | 'other'
}

interface Pet {
  id: GeneratedAlways<number>
  name: string
  owner_id: number
  species: 'cat' | 'dog' | 'hamster'
}

interface Toy {
  id: ColumnType<number, number | undefined, never>
  name: string
  price: ColumnType<string, number, number>
  pet_id: number
}

describe('SurrealDbRestDialect', () => {
  let db: Kysely<Database>

  before(async () => {
    db = getDB()
  })

  it('should execute a query with parameters.', async () => {
    const actual = await db
      .selectFrom('person')
      .selectAll()
      .where('age', '>=', 15)
      .where('first_name', '=', 'Jennifer')
      .execute()

    expect(actual).to.be.an('array')
  })
})

function getDB(config?: Partial<SurrealDbRestDialectConfig>): Kysely<Database> {
  return new Kysely({
    dialect: new SurrealDbRestDialect({
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
