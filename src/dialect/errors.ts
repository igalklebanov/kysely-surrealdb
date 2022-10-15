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
