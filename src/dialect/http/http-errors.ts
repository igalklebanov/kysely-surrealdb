export class SurrealDbHttpTransactionsUnsupportedError extends Error {
  constructor() {
    super('SurrealDB HTTP endpoints do not support transactions!')
    this.name = 'SurrealDbHttpTransactionsUnsupportedError'
  }
}
