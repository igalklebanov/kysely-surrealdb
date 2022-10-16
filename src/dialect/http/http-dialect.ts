import type {DatabaseIntrospector, Dialect, DialectAdapter, Driver, Kysely, QueryCompiler} from 'kysely'

import {SurrealDbQueryCompiler} from '../../query-compiler/query-compiler.js'
import {SurrealDbHttpAdapter} from './http-adapter.js'
import {SurrealDbHttpDriver} from './http-driver.js'
import {SurrealDbHttpIntrospector} from './http-introspector.js'
import type {SurrealDbHttpDialectConfig} from './http-types.js'

export class SurrealDbHttpDialect implements Dialect {
  #config: SurrealDbHttpDialectConfig

  constructor(config: SurrealDbHttpDialectConfig) {
    this.#config = config
  }

  createAdapter(): DialectAdapter {
    return new SurrealDbHttpAdapter()
  }

  createDriver(): Driver {
    return new SurrealDbHttpDriver(this.#config)
  }

  createIntrospector(db: Kysely<any>): DatabaseIntrospector {
    return new SurrealDbHttpIntrospector(db)
  }

  createQueryCompiler(): QueryCompiler {
    return new SurrealDbQueryCompiler()
  }
}
