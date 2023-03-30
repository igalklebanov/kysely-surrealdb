import {CompiledQuery, type DatabaseConnection, type Driver} from 'kysely'

import {SurrealDbWebSocketsConnection} from './websockets-connection.js'
import type {SurrealDbWebSocketsDialectConfig} from './websockets-types.js'

export class SurrealDbWebSocketsDriver implements Driver {
  readonly #config: SurrealDbWebSocketsDialectConfig
  #connection: SurrealDbWebSocketsConnection | undefined

  constructor(config: SurrealDbWebSocketsDialectConfig) {
    this.#config = config
  }

  async init(): Promise<void> {
    // noop
  }

  async acquireConnection(): Promise<DatabaseConnection> {
    return (this.#connection ||= await this.#connect())
  }

  async beginTransaction(connection: SurrealDbWebSocketsConnection): Promise<void> {
    // swap existing non-transactional connection for a new one,
    // use the old one for the transaction
    this.#connection = await this.#connect()

    await connection.executeQuery(CompiledQuery.raw('begin transaction'))
  }

  async commitTransaction(connection: SurrealDbWebSocketsConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw('commit transaction'))

    connection.close()
  }

  async rollbackTransaction(connection: SurrealDbWebSocketsConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw('cancel transaction'))

    connection.close()
  }

  async releaseConnection(): Promise<void> {
    // noop
  }

  async destroy(): Promise<void> {
    this.#connection?.close()
  }

  #connect() {
    return new SurrealDbWebSocketsConnection(this.#config).connect()
  }
}
