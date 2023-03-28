export class SurrealDbHttpDatabaseError extends Error {
  constructor(message: string = 'Something went wrong!') {
    super(message)
    this.name = 'SurrealDbHttpDatabaseError'
  }
}

export class SurrealDbHttpTransactionsUnsupportedError extends Error {
  constructor() {
    super('SurrealDB HTTP endpoints do not support transactions!')
    this.name = 'SurrealDbHttpTransactionsUnsupportedError'
  }
}
