import type {CompiledQuery, DatabaseConnection, QueryResult} from 'kysely'
import type {Surreal} from 'surrealdb.js'

import {assertSingleStatementQuery, SurrealDbDatabaseError, SurrealDbStreamingUnsupportedError} from '../errors.js'
import {resolveBasePath, serializeQuery} from '../shared.js'
import type {SurrealDbJsQueryResult, SurrealDbWebSocketsDialectConfig} from './websockets-types.js'

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

    const basePath = resolveBasePath(this.#config.hostname)

    this.#driver.connect(`${basePath}/rpc`)

    await ('token' in this.#config
      ? this.#driver.authenticate(this.#config.token)
      : this.#driver.signin({
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

    const query = serializeQuery(compiledQuery)

    const results = await this.#driver.query(query)

    const rows = this.#extractRows<R>(results)

    return {
      numAffectedRows: BigInt(rows.length),
      rows,
    }
  }

  async *streamQuery<R>(_: CompiledQuery): AsyncIterableIterator<QueryResult<R>> {
    throw new SurrealDbStreamingUnsupportedError()
  }

  #extractRows<R>(results: SurrealDbJsQueryResult[]): R[] {
    const result = results[results.length - 1]

    if (!result) {
      return []
    }

    if (!('status' in result)) {
      throw new SurrealDbDatabaseError(JSON.stringify(result))
    }

    if (result.status !== 'OK') {
      throw new SurrealDbDatabaseError(result.detail)
    }

    const {result: rows} = result

    return Array.isArray(rows) ? rows : []
  }
}
