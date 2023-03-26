import type {CompiledQuery, DatabaseConnection, QueryResult} from 'kysely'

import {SurrealDbMultipleStatementQueriesUnsupportedError} from '../errors.js'
import {SurrealDbHttpDatabaseError, SurrealDbHttpStreamingUnsupportedError} from './http-errors.js'
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
    this.#assertSingleStatementQuery(compiledQuery)

    const body = this.#serializeQuery(compiledQuery)

    const response = await this.#config.fetch(`${this.#basePath}/sql`, {
      body,
      headers: this.#requestHeaders,
      method: 'POST',
    })

    if (!response.ok) {
      throw new SurrealDbHttpDatabaseError(await response.text())
    }

    const responseBody = await response.json()

    const queryResult = (responseBody as SurrealDbHttpResponseBody<O[]>).pop()

    if (queryResult?.status === 'ERR') {
      throw new SurrealDbHttpDatabaseError(queryResult.detail)
    }

    const rows = queryResult?.result || []

    return {
      numAffectedRows: BigInt(rows.length),
      rows,
    }
  }

  async *streamQuery<O>(compiledQuery: CompiledQuery, chunkSize?: number): AsyncIterableIterator<QueryResult<O>> {
    throw new SurrealDbHttpStreamingUnsupportedError()
  }

  #assertSingleStatementQuery(compiledQuery: CompiledQuery): void {
    if (compiledQuery.sql.match(/.*;.+/i)) {
      throw new SurrealDbMultipleStatementQueriesUnsupportedError()
    }
  }

  #serializeQuery(compiledQuery: CompiledQuery): string {
    const {parameters, sql} = compiledQuery

    if (!parameters.length) {
      return `${sql};`
    }

    return [
      ...parameters.map(
        (parameter, index) =>
          `let $${index + 1} = ${
            typeof parameter === 'string' && parameter.startsWith('SURREALQL::')
              ? parameter.replace(/^SURREALQL::(\(.+\))/, '$1')
              : JSON.stringify(parameter)
          }`,
      ),
      sql,
      '',
    ].join(';')
  }
}
