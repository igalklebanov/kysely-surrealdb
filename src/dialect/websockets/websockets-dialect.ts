import type {DatabaseIntrospector, Dialect, DialectAdapter, Driver, Kysely, QueryCompiler} from 'kysely'

import {SurrealDbQueryCompiler} from '../../query-compiler/query-compiler.js'
import {SurrealDbAdapter} from '../adapter.js'
import {SurrealDbWebSocketsDriver} from './websockets-driver.js'
import {SurrealDbWebSocketsIntrospector} from './websockets-introspector.js'
import type {SurrealDbWebSocketsDialectConfig} from './websockets-types.js'

export class SurrealDbWebSocketsDialect implements Dialect {
  readonly #config: SurrealDbWebSocketsDialectConfig

  constructor(config: SurrealDbWebSocketsDialectConfig) {
    this.#config = config
  }

  createAdapter(): DialectAdapter {
    return new SurrealDbAdapter()
  }

  createDriver(): Driver {
    return new SurrealDbWebSocketsDriver(this.#config)
  }

  createIntrospector(db: Kysely<any>): DatabaseIntrospector {
    return new SurrealDbWebSocketsIntrospector(db)
  }

  createQueryCompiler(): QueryCompiler {
    return new SurrealDbQueryCompiler()
  }
}
