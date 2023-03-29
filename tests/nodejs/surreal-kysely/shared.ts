import {expect} from 'chai'
import {sql, type ColumnType, type Compilable, type RawBuilder} from 'kysely'
import nodeFetch from 'node-fetch'
import Surreal from 'surrealdb.js'
import {fetch as undiciFetch} from 'undici'

import {SurrealDbHttpDialect, SurrealDbWebSocketsDialect, SurrealKysely, type SurrealEdge} from '../../../src'

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

export interface TestContext {
  http: SurrealKysely<Database>
  websockets: SurrealKysely<Database>
}

export const DIALECTS = ['http', 'websockets'] as const

export function initTests(): TestContext {
  return {
    http: new SurrealKysely<Database>({
      dialect: new SurrealDbHttpDialect({
        database: 'test',
        fetch: getFetch(),
        hostname: 'localhost:8000',
        namespace: 'test',
        password: 'root',
        username: 'root',
      }),
    }),
    websockets: new SurrealKysely<Database>({
      dialect: new SurrealDbWebSocketsDialect({
        database: 'test',
        Driver: Surreal,
        namespace: 'test',
        password: 'root',
        scope: 'test',
        url: 'https://localhost:8000/rpc',
        username: 'root',
      }),
    }),
  }
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

export async function prepareTables(ctx: TestContext, tables: ReadonlyArray<keyof Database>): Promise<void> {
  return await tables.reduce(async (acc, table) => {
    switch (table) {
      case 'account':
        return acc.then(insertAccounts(ctx))
      case 'article':
        return acc.then(insertArticles(ctx))
      case 'company':
        return acc.then(insertCompanies(ctx))
      case 'like':
        // return acc.then(insertLikes)
        return acc
      case 'person':
        return acc.then(insertPeople(ctx))
      case 'user':
        return acc.then(insertUsers(ctx))
      case 'write':
        // return acc.then(insertWrites)
        return acc
      default:
        throw new Error(`missing insertion function for ${table}!`)
    }
  }, Promise.resolve())
}

export async function dropTables(ctx: TestContext, tables: ReadonlyArray<keyof Database>) {
  return await tables.reduce(async (acc, table) => {
    return acc.then(() => dropTable(ctx, table))
  }, Promise.resolve())
}

async function dropTable(ctx: TestContext, table: keyof Database) {
  await sql`remove table ${sql.table(table)}`.execute(ctx.http)
}

function insertUsers(ctx: TestContext) {
  return async () => {
    await ctx.http
      .insertInto('user')
      .values([
        {id: 'tobie', nickname: 'Tobie', tags: ['developer']},
        {id: 'igal', nickname: 'Igal'},
        {id: 'moshe', nickname: 'Moshe'},
      ])
      .execute()
  }
}

function insertArticles(ctx: TestContext) {
  return async () => {
    await ctx.http
      .insertInto('article')
      .values([
        {id: 'surreal', title: 'Surreal'},
        {id: 'surrealql', title: 'SurrealQL'},
      ])
      .execute()
  }
}

function insertCompanies(ctx: TestContext) {
  return async () => {
    await ctx.http
      .insertInto('company')
      .values([{id: 'surrealdb', users: sql`user:igal`}])
      .execute()
  }
}

function insertPeople(ctx: TestContext) {
  return async () => {
    await ctx.http
      .insertInto('person')
      .values([{age: 10}, {age: 21}, {age: 30}, {age: 65}])
      .execute()
  }
}

function insertAccounts(ctx: TestContext) {
  return async () => {
    await ctx.http
      .insertInto('account')
      .values([
        {id: 'account:123', name: 'Account 123'},
        {id: 'account:456', name: 'Account 456'},
      ])
      .execute()
  }
}
