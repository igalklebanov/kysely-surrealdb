import type {CompiledQuery, DatabaseConnection, QueryResult} from 'kysely'

import {assertSingleStatementQuery, SurrealDbDatabaseError, SurrealDbStreamingUnsupportedError} from '../errors.js'
import {serializeQuery} from '../shared.js'
import type {SurrealDbHttpDialectConfig, SurrealDbHttpRequestHeaders, SurrealDbHttpResponseBody} from './http-types.js'

export class SurrealDbHttpConnection implements DatabaseConnection {
  readonly #basePath: string
  readonly #config: SurrealDbHttpDialectConfig
  readonly #requestHeaders: SurrealDbHttpRequestHeaders

  constructor(config: SurrealDbHttpDialectConfig, basePath: string, requestHeaders: SurrealDbHttpRequestHeaders) {
    this.#basePath = basePath
    this.#config = config
    this.#requestHeaders = requestHeaders
  }

  async executeQuery<O>(compiledQuery: CompiledQuery): Promise<QueryResult<O>> {
    assertSingleStatementQuery(compiledQuery)

    const body = serializeQuery(compiledQuery)

    const response = await this.#config.fetch(`${this.#basePath}/sql`, {
      body,
      headers: this.#requestHeaders,
      method: 'POST',
    })

    if (!response.ok) {
      throw new SurrealDbDatabaseError(await response.text())
    }

    const responseBody = await response.json()

    const queryResult = (responseBody as SurrealDbHttpResponseBody<O[]>).pop()

    if (queryResult?.status === 'ERR') {
      throw new SurrealDbDatabaseError(queryResult.detail)
    }

    const rows = queryResult?.result || []

    return {
      numAffectedRows: BigInt(rows.length),
      rows,
    }
  }

  async *streamQuery<O>(_: CompiledQuery): AsyncIterableIterator<QueryResult<O>> {
    throw new SurrealDbStreamingUnsupportedError()
  }
}
