import type {
  DatabaseIntrospector,
  DatabaseMetadata,
  DatabaseMetadataOptions,
  Kysely,
  SchemaMetadata,
  TableMetadata,
} from 'kysely'

import {SurrealDbSchemasUnsupportedError} from '../errors.js'

export class SurrealDbWebSocketsIntrospector implements DatabaseIntrospector {
  readonly #db: Kysely<any>

  constructor(db: Kysely<any>) {
    this.#db = db
  }

  async getSchemas(): Promise<SchemaMetadata[]> {
    throw new SurrealDbSchemasUnsupportedError()
  }

  async getTables(): Promise<TableMetadata[]> {
    throw new Error('Unimplemented!')
  }

  async getMetadata(options?: DatabaseMetadataOptions | undefined): Promise<DatabaseMetadata> {
    return {tables: await this.getTables()}
  }
}
