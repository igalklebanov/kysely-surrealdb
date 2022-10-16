import {DialectAdapterBase, type Kysely} from 'kysely'

import {SurrealDbLocksUnsupportedError} from '../errors.js'

export class SurrealDbHttpAdapter extends DialectAdapterBase {
  get supportsReturning(): boolean {
    return false
  }

  get supportsTransactionalDdl(): boolean {
    return false
  }

  async acquireMigrationLock(db: Kysely<any>): Promise<void> {
    this.#throwLocksError()
  }

  async releaseMigrationLock(db: Kysely<any>): Promise<void> {
    this.#throwLocksError()
  }

  #throwLocksError(): never {
    throw new SurrealDbLocksUnsupportedError()
  }
}
