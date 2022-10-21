import {expect} from 'chai'
import {RawBuilder, sql, type ColumnType, type Compilable, type GeneratedAlways} from 'kysely'
import nodeFetch from 'node-fetch'
import {fetch as undiciFetch} from 'undici'

import {SurrealDbHttpDialect, SurrealKysely, type SurrealDbHttpDialectConfig} from '../../../src'

export interface Database {
  person: Person
  user: User
  write: Write
  article: Article
  company: Company
  like: Like
  customer: Customer
  temperature: Temperature
  events: Event
}

export interface Person {
  id: GeneratedAlways<string>
  name: string | null
  company: string | null
  skills: string[] | null
  username: string | null
  interests: string[] | null
}

export interface User {
  id: string
  nickname: string | null
  tags: string[] | null
  age: number | null
  name: string | null
  email: string | null
}

export interface Write {
  source: string | null
  tags: string[] | null
  time: ColumnType<
    {written: string | null} | null,
    {written: string | RawBuilder<any> | null} | null,
    {written: string | RawBuilder<any> | null} | null
  >
}

export interface Article {
  id: GeneratedAlways<string>
  title: string | null
  tags: ReadonlyArray<{
    value: string
  }> | null
}

export interface Company {
  id: GeneratedAlways<string>
  users: any
}

export interface Like {
  time: {
    connected: string | null
  } | null
}

export interface Customer {
  id: GeneratedAlways<string>
  addresses: ReadonlyArray<{
    active: boolean
  }> | null
}

export interface Temperature {
  id: GeneratedAlways<string>
  celsius: number
}

export interface Event {
  id: GeneratedAlways<string>
  type: string
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

export async function dropTable(table: keyof Database): Promise<void> {
  await sql`remove table ${sql.table(table)}`.execute(getDb())
}

export async function insertPeople(): Promise<void> {
  const db = getDb()

  await db
    .insertInto('person')
    .values([
      {id: 'tobie', name: 'Tobie'},
      {id: 'jaime', name: 'Jaime'},
    ])
    .execute()

  await sql`relate person:tobie->like->person:jaime set time.connected = time::now()`.execute(db)
}

export async function insertUsers(): Promise<void> {
  await getDb()
    .insertInto('user')
    .values([
      {id: 'tobie', nickname: 'Tobie', tags: ['developer']},
      {id: 'igal', nickname: 'Igal', age: 33, email: 'igalklebanov@gmail.com', name: 'Igal'},
      {id: 'moshe', nickname: 'Moshe'},
    ])
    .execute()
}

export async function insertArticles(): Promise<void> {
  await getDb()
    .insertInto('article')
    .values([
      {id: 'surreal', title: 'Surreal', tags: [{value: 'a tag'}, {value: 'another tag'}]},
      {id: 'surrealql', title: 'SurrealQL'},
    ])
    .execute()
}

export async function insertCompanies(): Promise<void> {
  await getDb()
    .insertInto('company')
    .values([{id: 'surrealdb', users: sql`user:igal`}])
    .execute()
}

export async function insertCustomers(): Promise<void> {
  await getDb()
    .insertInto('customer')
    .values([{addresses: [{active: true}]}, {addresses: [{active: false}]}])
    .execute()
}

export async function insertTemperatures(): Promise<void> {
  await getDb()
    .insertInto('temperature')
    .values([{celsius: 30}])
    .execute()
}

export async function insertEvents(): Promise<void> {
  await getDb()
    .insertInto('events')
    .values([
      {type: 'activity'},
      {type: 'activity'},
      {type: 'activity'},
      {type: 'activity'},
      {type: 'activity'},
      {type: 'activity'},
    ])
}
