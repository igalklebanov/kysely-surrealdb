import type {DatabaseIntrospector, Dialect, DialectAdapter, Driver, Kysely, QueryCompiler} from 'kysely'

import {SurrealDbQueryCompiler} from '../query-compiler.js'
import {SurrealDbRestAdapter} from './rest-adapter.js'
import {SurrealDbRestDriver} from './rest-driver.js'
import {SurrealDbRestIntrospector} from './rest-introspector.js'
import type {SurrealDbRestDialectConfig} from './rest-types.js'

export class SurrealDbRestDialect implements Dialect {
  #config: SurrealDbRestDialectConfig

  constructor(config: SurrealDbRestDialectConfig) {
    this.#config = config
  }

  createAdapter(): DialectAdapter {
    return new SurrealDbRestAdapter()
  }

  createDriver(): Driver {
    return new SurrealDbRestDriver(this.#config)
  }

  createIntrospector(db: Kysely<any>): DatabaseIntrospector {
    return new SurrealDbRestIntrospector(db)
  }

  createQueryCompiler(): QueryCompiler {
    return new SurrealDbQueryCompiler()
  }
}
