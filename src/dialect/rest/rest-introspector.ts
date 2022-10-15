import {
  sql,
  type DatabaseIntrospector,
  type DatabaseMetadata,
  type DatabaseMetadataOptions,
  type Kysely,
  type SchemaMetadata,
  type TableMetadata,
} from 'kysely'

import {SurrealDbSchemasUnsupportedError} from '../errors.js'
import type {
  SurrealDbRestInfoForDbResponseBodyItemResult,
  SurrealDbRestInfoForTableResponseBodyItemResult,
  SurrealDbRestResponseBodyItem,
} from './rest-types.js'

export class SurrealDbRestIntrospector implements DatabaseIntrospector {
  readonly #db: Kysely<any>

  constructor(db: Kysely<any>) {
    this.#db = db
  }

  async getSchemas(): Promise<SchemaMetadata[]> {
    throw new SurrealDbSchemasUnsupportedError()
  }

  async getTables(): Promise<TableMetadata[]> {
    const infoForDb = await this.#requestInfoFor('db')

    return await Promise.all(
      Object.keys(infoForDb.tb).map(async (tableName) => {
        const infoForTable = await this.#requestInfoFor('table', tableName)

        return {
          columns: Object.entries(infoForTable.fd).map(([name, definition]) => ({
            dataType: this.#extractDataTypeFromFieldDefinition(definition),
            hasDefaultValue: false,
            isAutoIncrementing: false,
            isNullable: true,
            name,
          })),
          name: tableName,
        }
      }),
    )
  }

  async getMetadata(options?: DatabaseMetadataOptions | undefined): Promise<DatabaseMetadata> {
    return {tables: await this.getTables()}
  }

  async #requestInfoFor<
    E extends RequestInfoForEntity,
    R = E extends 'db' ? SurrealDbRestInfoForDbResponseBodyItemResult : SurrealDbRestInfoForTableResponseBodyItemResult,
    I extends SurrealDbRestResponseBodyItem<R> = SurrealDbRestResponseBodyItem<R>,
  >(entity: E, name?: string): Promise<R> {
    try {
      const {
        rows: [{result, status}],
      } = await sql<I>`info for ${sql.raw(entity)}${sql.raw(name ? ` ${name}` : '')}`.execute(this.#db)

      if (status !== 'OK') {
        throw new SurrealDbRestIntrospectorError({entity, name, reason: status})
      }

      return result
    } catch (error: unknown) {
      const reason = error instanceof Error ? error.message : typeof error === 'string' ? error : undefined

      throw new SurrealDbRestIntrospectorError({entity, name, reason})
    }
  }

  #extractDataTypeFromFieldDefinition(definition: string): string {
    return definition.replace(/.*TYPE (\w+|`\w+`)$/, '$1')
  }
}

type RequestInfoForEntity = 'kv' | 'db' | 'ns' | 'table'

export class SurrealDbRestIntrospectorError extends Error {
  constructor(incident: {entity: RequestInfoForEntity; name?: string; reason?: string}) {
    super(
      `Failed getting info for ${incident.entity}${incident.name ? `:${incident.name}` : ''}${
        incident.reason ? ` - ${incident.reason}` : ''
      }!`,
    )
  }
}
