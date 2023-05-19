import {expect, use} from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {sql, type ColumnType, type Compilable, type RawBuilder} from 'kysely'
import nodeFetch from 'node-fetch'
import Surreal from 'surrealdb.js'
import {fetch as undiciFetch} from 'undici'

import {SurrealDbHttpDialect, SurrealDbWebSocketsDialect, SurrealKysely, type SurrealEdge} from '../../../src'

use(chaiAsPromised)

export interface Database {
  person: Person
  user: User
  write: SurrealEdge<Write>
  article: Article
  company: Company
  like: SurrealEdge<Like>
  account: Account
  temperature: Temperature
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

interface Article {
  author: string | null
  time: string | null
}

interface Company {
  name: string | null
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

interface Temperature {
  celsius: number | null
  date: string | null
  location: string | null
  temperature: number | null
  time: string | null
}

export interface TestContext {
  db: SurrealKysely<Database>
}

export const DIALECTS = ['http', 'websockets'] as const

const BASE_CONFIG = {
  database: 'test',
  hostname: 'localhost:8000',
  namespace: 'test',
  password: 'root',
  username: 'root',
}

export function initTests(dialect: typeof DIALECTS[number]): TestContext {
  return {
    db: {
      http: () =>
        new SurrealKysely<Database>({
          dialect: new SurrealDbHttpDialect({
            ...BASE_CONFIG,
            fetch: getFetch(),
          }),
        }),
      websockets: () =>
        new SurrealKysely<Database>({
          dialect: new SurrealDbWebSocketsDialect({
            ...BASE_CONFIG,
            Driver: Surreal,
          }),
        }),
    }[dialect](),
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
  await dropTables(ctx, tables)

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
  await sql`remove table ${sql.table(table)}`.execute(ctx.db)
}

function insertUsers(ctx: TestContext) {
  return async () => {
    await ctx.db
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
    await ctx.db
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
    await ctx.db
      .insertInto('company')
      .values([{id: 'surrealdb', users: sql`user:igal`}])
      .execute()
  }
}

function insertPeople(ctx: TestContext) {
  return async () => {
    await ctx.db
      .insertInto('person')
      .values([{age: 10}, {age: 21}, {age: 30}, {age: 65}])
      .execute()
  }
}

function insertAccounts(ctx: TestContext) {
  return async () => {
    await ctx.db
      .insertInto('account')
      .values([
        {id: 'account:123', name: 'Account 123'},
        {id: 'account:456', name: 'Account 456'},
      ])
      .execute()
  }
}
