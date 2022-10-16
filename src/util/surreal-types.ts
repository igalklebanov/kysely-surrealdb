export type SurrealDatabase<DB> = DB & {
  [K in SurrealDbDocumentRecordID<DB>]: K extends `${infer TB}:${string}`
    ? TB extends keyof DB
      ? DB[TB]
      : never
    : never
}

export type SurrealDbDocumentRecordID<DB> = keyof DB extends string ? `${keyof DB}:${string}` : never

export type AnyTable<DB> = keyof DB extends string ? (keyof DB extends `${infer TB}:${string}` ? TB : never) : never
