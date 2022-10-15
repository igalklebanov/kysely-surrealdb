import type {DatabaseConnection, Driver} from 'kysely'

import {encodeToBase64} from '../../util/encode-to-base64.js'
import {SurrealDbHttpConnection} from './http-connection.js'
import {SurrealDbHttpTransactionsUnsupportedError} from './http-errors.js'
import type {SurrealDbHttpDialectConfig, SurrealDbHttpRequestHeaders} from './http-types.js'

export class SurrealDbHttpDriver implements Driver {
  readonly #basePath: string
  readonly #config: SurrealDbHttpDialectConfig
  readonly #requestHeaders: SurrealDbHttpRequestHeaders

  constructor(config: SurrealDbHttpDialectConfig) {
    this.#config = config
    this.#basePath = this.#resolveBasePath()
    this.#requestHeaders = this.#createRequestHeaders()
  }

  async init(): Promise<void> {
    // noop
  }

  async acquireConnection(): Promise<DatabaseConnection> {
    return new SurrealDbHttpConnection(this.#config, this.#basePath, this.#requestHeaders)
  }

  async beginTransaction(): Promise<never> {
    throw this.#throwTransactionsError()
  }

  async commitTransaction(): Promise<never> {
    throw this.#throwTransactionsError()
  }

  async rollbackTransaction(): Promise<never> {
    throw this.#throwTransactionsError()
  }

  async releaseConnection(): Promise<void> {
    // noop
  }

  async destroy(): Promise<void> {
    // noop
  }

  #resolveBasePath(): string {
    const {hostname} = this.#config
    const protocol = hostname.startsWith('localhost') ? 'http' : 'https'

    return `${protocol}://${hostname}`
  }

  #createRequestHeaders(): SurrealDbHttpRequestHeaders & Record<string, string> {
    const decodedAuth = `${this.#config.username}:${this.#config.password}`

    const auth = encodeToBase64(decodedAuth)

    return {
      Accept: 'application/json',
      Authorization: `Basic ${auth}`,
      DB: this.#config.database,
      NS: this.#config.namespace,
    }
  }

  #throwTransactionsError(): never {
    throw new SurrealDbHttpTransactionsUnsupportedError()
  }
}
