import type {CompiledQuery, DatabaseConnection, QueryResult} from 'kysely'

import {SurrealDbMultipleStatementQueriesUnsupportedError} from '../errors.js'
import {SurrealDbRestDatabaseError, SurrealDbRestStreamingUnsupportedError} from './rest-errors.js'
import type {SurrealDbRestDialectConfig, SurrealDbRestRequestHeaders, SurrealDbRestResponseBody} from './rest-types.js'

export class SurrealDbRestConnection implements DatabaseConnection {
  readonly #basePath: string
  readonly #config: SurrealDbRestDialectConfig
  readonly #requestHeaders: SurrealDbRestRequestHeaders

  constructor(config: SurrealDbRestDialectConfig, basePath: string, requestHeaders: SurrealDbRestRequestHeaders) {
    this.#basePath = basePath
    this.#config = config
    this.#requestHeaders = requestHeaders
  }

  async executeQuery<O>(compiledQuery: CompiledQuery): Promise<QueryResult<O>> {
    this.#assertSingleStatementQuery(compiledQuery)

    const response = await this.#config.fetch(`${this.#basePath}/sql`, {
      body: this.#serializeQuery(compiledQuery),
      headers: this.#requestHeaders,
      method: 'POST',
    })

    if (!response.ok) {
      throw new SurrealDbRestDatabaseError(await response.text())
    }

    const responseBody = await response.json()

    const {result, status} = (responseBody as SurrealDbRestResponseBody<O[]>).pop() || {}

    if (status !== 'OK') {
      throw new SurrealDbRestDatabaseError(status)
    }

    return {
      rows: result ?? [],
    }
  }

  async *streamQuery<O>(compiledQuery: CompiledQuery, chunkSize?: number): AsyncIterableIterator<QueryResult<O>> {
    throw new SurrealDbRestStreamingUnsupportedError()
  }

  #assertSingleStatementQuery(compiledQuery: CompiledQuery): void {
    if (compiledQuery.sql.match(/.*;.+/i)) {
      throw new SurrealDbMultipleStatementQueriesUnsupportedError()
    }
  }

  #serializeQuery(compiledQuery: CompiledQuery): string {
    const {parameters, sql} = compiledQuery

    if (!parameters.length) {
      return sql
    }

    return [
      ...parameters.map((parameter, index) => `let $${index + 1} = ${this.#serializeQueryParameter(parameter)}`),
      sql,
    ].join(';')
  }

  #serializeQueryParameter(parameter: unknown): string {
    switch (typeof parameter) {
      case 'string':
        return `"${parameter}"`
      case 'object':
        return !parameter ? 'null' : JSON.stringify(parameter)
      default:
        return String(parameter)
    }
  }
}
