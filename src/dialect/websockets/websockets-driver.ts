import {CompiledQuery, DatabaseConnection, Driver} from 'kysely'

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
    return (this.#connection ||= await new SurrealDbWebSocketsConnection(this.#config).connect())
  }

  async beginTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw('begin transaction'))
  }

  async commitTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw('commit transaction'))
  }

  async rollbackTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw('cancel transaction'))
  }

  async releaseConnection(): Promise<void> {
    // noop
  }

  async destroy(): Promise<void> {
    this.#connection?.close()
  }
}
