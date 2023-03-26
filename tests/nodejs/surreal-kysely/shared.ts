import {expect} from 'chai'
import {sql, type ColumnType, type Compilable, type RawBuilder} from 'kysely'
import nodeFetch from 'node-fetch'
import {fetch as undiciFetch} from 'undici'

import {SurrealDbHttpDialect, SurrealKysely, type SurrealDbHttpDialectConfig, type SurrealEdge} from '../../../src'

export interface Database {
  person: Person
  user: User
  write: SurrealEdge<Write>
  article: Article
  company: Company
  like: SurrealEdge<Like>
  account: Account
}

interface Person {
  name: string | null
  company: string | null
  skills: string[] | null
  username: string | null
  interests: string[] | null
  railcard: string | null
  age: number | null
}

interface User {
  id: string
  nickname: string | null
  tags: string[] | null
}

interface Write {
  source: string | null
  tags: string[] | null
  time: ColumnType<
    {written: string | null} | null,
    {written: string | RawBuilder<any> | null} | null,
    {written: string | RawBuilder<any> | null} | null
  >
}

interface Article {}

interface Company {
  users: any
}

interface Like {
  time: {
    connected: string | null
  } | null
}

export interface Account {
  name: string
}

export function getDb(config?: Partial<SurrealDbHttpDialectConfig>): SurrealKysely<Database> {
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

export function testSurrealQl(actual: Compilable, expected: {parameters: unknown[]; sql: string | string[]}): void {
  const {sql} = expected

  const compiledQuery = actual.compile()

  expect(compiledQuery.sql).to.be.equal(Array.isArray(sql) ? sql.join?.(' ') : sql)
  expect(compiledQuery.parameters).to.be.deep.equal(expected.parameters)
}

export async function prepareTables(tables: ReadonlyArray<keyof Database>): Promise<void> {
  return await tables.reduce(async (acc, table) => {
    switch (table) {
      case 'account':
        return acc.then(insertAccounts)
      case 'article':
        return acc.then(insertArticles)
      case 'company':
        return acc.then(insertCompanies)
      case 'like':
        // return acc.then(insertLikes)
        return acc
      case 'person':
        return acc.then(insertPeople)
      case 'user':
        return acc.then(insertUsers)
      case 'write':
        // return acc.then(insertWrites)
        return acc
      default:
        throw new Error(`missing insertion function for ${table}!`)
    }
  }, Promise.resolve())
}

export async function dropTables(tables: ReadonlyArray<keyof Database>): Promise<void> {
  return await tables.reduce(async (acc, table) => {
    return acc.then(() => dropTable(table))
  }, Promise.resolve())
}

async function dropTable(table: keyof Database): Promise<void> {
  await sql`remove table ${sql.table(table)}`.execute(getDb())
}

async function insertUsers(): Promise<void> {
  await getDb()
    .insertInto('user')
    .values([
      {id: 'tobie', nickname: 'Tobie', tags: ['developer']},
      {id: 'igal', nickname: 'Igal'},
      {id: 'moshe', nickname: 'Moshe'},
    ])
    .execute()
}

async function insertArticles(): Promise<void> {
  await getDb()
    .insertInto('article')
    .values([
      {id: 'surreal', title: 'Surreal'},
      {id: 'surrealql', title: 'SurrealQL'},
    ])
    .execute()
}

async function insertCompanies(): Promise<void> {
  await getDb()
    .insertInto('company')
    .values([{id: 'surrealdb', users: sql`user:igal`}])
    .execute()
}

async function insertPeople(): Promise<void> {
  await getDb()
    .insertInto('person')
    .values([{age: 10}, {age: 21}, {age: 30}, {age: 65}])
    .execute()
}

async function insertAccounts(): Promise<void> {
  await getDb()
    .insertInto('account')
    .values([
      {id: 'account:123', name: 'Account 123'},
      {id: 'account:456', name: 'Account 456'},
    ])
    .execute()
}
