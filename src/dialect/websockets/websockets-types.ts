import type Surreal from 'surrealdb.js'

export type SurrealDbWebSocketsDialectConfig = SurrealDbWebSocketsDialectConfigBase &
  (SurrealDbWebSocketsDialectConfigCredentials | SurrealDbWebSocketsDialectConfigToken)

export interface SurrealDbWebSocketsDialectConfigBase {
  /**
   * SurrealDB database name.
   */
  database: string

  /**
   * SurrealDB JavaScript driver class.
   */
  Driver: typeof Surreal

  /**
   * SurrealDB database namespace.
   */
  namespace: string

  /**
   * SurrealDB database endpoint.
   */
  url: string
}

export interface SurrealDbWebSocketsDialectConfigCredentials {
  /**
   * SurrealDB password.
   */
  password: string

  /**
   * SurrealDB authentication scope.
   */
  scope: string

  /**
   * SurrealDB username.
   */
  username: string
}

export interface SurrealDbWebSocketsDialectConfigToken {
  /**
   * SurrealDB jwt token.
   */
  token: string
}
