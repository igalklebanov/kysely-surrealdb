import type {CompiledQuery} from 'kysely'

export class SurrealDbLocksUnsupportedError extends Error {
  constructor() {
    super('Locks are not supported!')
    this.name = 'SurrealDbLocksUnsupportedError'
  }
}

export class SurrealDbMultipleStatementQueriesUnsupportedError extends Error {
  constructor() {
    super('Multiple statement queries are not supported!')
    this.name = 'SurrealDbMultipleStatementsUnsupportedError'
  }
}

export class SurrealDbSchemasUnsupportedError extends Error {
  constructor() {
    super('Schemas are not supported!')
    this.name = 'SurrealDbSchemasUnsupportedError'
  }
}

export class SurrealDbStreamingUnsupportedError extends Error {
  constructor() {
    super('SurrealDB does not support streaming!')
    this.name = 'SurrealDbStreamingUnsupportedError'
  }
}

export class SurrealDbDatabaseError extends Error {
  constructor(message: string = 'Something went wrong!') {
    super(message)
    this.name = 'SurrealDbDatabaseError'
  }
}

export function assertSingleStatementQuery(compiledQuery: CompiledQuery): void {
  if (compiledQuery.sql.match(/.*;.+/i)) {
    throw new SurrealDbMultipleStatementQueriesUnsupportedError()
  }
}
