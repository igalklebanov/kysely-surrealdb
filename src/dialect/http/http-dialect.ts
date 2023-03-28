import type {DatabaseIntrospector, Dialect, DialectAdapter, Driver, Kysely, QueryCompiler} from 'kysely'

import {SurrealDbQueryCompiler} from '../../query-compiler/query-compiler.js'
import {SurrealDbAdapter} from '../adapter.js'
import {SurrealDbHttpDriver} from './http-driver.js'
import {SurrealDbHttpIntrospector} from './http-introspector.js'
import type {SurrealDbHttpDialectConfig} from './http-types.js'

export class SurrealDbHttpDialect implements Dialect {
  readonly #config: SurrealDbHttpDialectConfig

  constructor(config: SurrealDbHttpDialectConfig) {
    this.#config = config
  }

  createAdapter(): DialectAdapter {
    return new SurrealDbAdapter()
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
