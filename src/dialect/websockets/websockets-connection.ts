import type {CompiledQuery, DatabaseConnection, QueryResult} from 'kysely'
import type Surreal from 'surrealdb.js'

import {assertSingleStatementQuery, SurrealDbStreamingUnsupportedError} from '../errors.js'
import type {SurrealDbWebSocketsDialectConfig} from './websockets-types.js'

export class SurrealDbWebSocketsConnection implements DatabaseConnection {
  readonly #config: SurrealDbWebSocketsDialectConfig
  #driver: Surreal | undefined

  constructor(config: SurrealDbWebSocketsDialectConfig) {
    this.#config = config
  }

  close(): this {
    this.#driver?.close()

    return this
  }

  async connect(): Promise<this> {
    if (this.#driver) {
      return this
    }

    this.#driver = new this.#config.Driver()

    await this.#driver.connect(this.#config.url)

    await ('token' in this.#config
      ? this.#driver.authenticate(this.#config.token)
      : this.#driver.signin({
          DB: this.#config.database,
          NS: this.#config.namespace,
          pass: this.#config.password,
          SC: this.#config.scope,
          user: this.#config.username,
        }))

    await this.#driver.use(this.#config.namespace, this.#config.database)

    return this
  }

  async executeQuery<R>(compiledQuery: CompiledQuery<unknown>): Promise<QueryResult<R>> {
    if (!this.#driver) {
      throw new Error('Driver not initialized!')
    }

    assertSingleStatementQuery(compiledQuery)

    const results = await this.#driver.query(compiledQuery.sql, this.#getVarsMap(compiledQuery))

    const rows = (results[0].result as R[] | undefined) || []

    return {
      numAffectedRows: BigInt(rows.length),
      rows,
    }
  }

  async *streamQuery<R>(_: CompiledQuery): AsyncIterableIterator<QueryResult<R>> {
    throw new SurrealDbStreamingUnsupportedError()
  }

  #getVarsMap(compiledQuery: CompiledQuery): Record<string, unknown> {
    return compiledQuery.parameters.reduce(
      (acc: Record<string, unknown>, parameter, index) => ({
        ...acc,
        [index + 1]: parameter,
      }),
      {},
    )
  }
}
