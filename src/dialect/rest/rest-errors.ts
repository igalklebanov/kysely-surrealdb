export class SurrealDbRestDatabaseError extends Error {
  constructor(message: string = 'Something went wrong!') {
    super(message)
    this.name = 'SurrealDbRestDatabaseError'
  }
}

export class SurrealDbRestStreamingUnsupportedError extends Error {
  constructor() {
    super('Streaming is not supported!')
    this.name = 'SurrealDbRestStreamingUnsupportedError'
  }
}

export class SurrealDbRestTransactionsUnsupportedError extends Error {
  constructor() {
    super('Transactions are not supported!')
    this.name = 'SurrealDbRestTransactionsUnsupportedError'
  }
}
