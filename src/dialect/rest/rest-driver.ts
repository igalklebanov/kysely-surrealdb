import type {DatabaseConnection, Driver} from 'kysely'

import {encodeToBase64} from '../../util/encode-to-base64.js'
import {SurrealDbRestConnection} from './rest-connection.js'
import {SurrealDbRestTransactionsUnsupportedError} from './rest-errors.js'
import type {SurrealDbRestDialectConfig, SurrealDbRestRequestHeaders} from './rest-types.js'

export class SurrealDbRestDriver implements Driver {
  readonly #basePath: string
  readonly #config: SurrealDbRestDialectConfig
  readonly #requestHeaders: SurrealDbRestRequestHeaders

  constructor(config: SurrealDbRestDialectConfig) {
    this.#config = config
    this.#basePath = this.#resolveBasePath()
    this.#requestHeaders = this.#createRequestHeaders()
  }

  async init(): Promise<void> {
    // noop
  }

  async acquireConnection(): Promise<DatabaseConnection> {
    return new SurrealDbRestConnection(this.#config, this.#basePath, this.#requestHeaders)
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

  #createRequestHeaders(): SurrealDbRestRequestHeaders & Record<string, string> {
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
    throw new SurrealDbRestTransactionsUnsupportedError()
  }
}
