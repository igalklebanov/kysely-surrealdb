export interface SurrealDbRestDialectConfig {
  /**
   * SurrealDB database name.
   */
  database: string

  /**
   * Fetch function used to communicate with the API.
   *
   * For browsers and `node 18.x` and above, pass built-in `fetch`.
   *
   * For `node 16.x` and above, pass `undici` or `node-fetch`.
   *
   * For `node 14.x` and below, pass `node-fetch`.
   */
  fetch: (input: string, init?: FetchRequest) => Promise<FetchResponse>

  /**
   * SurrealDB cluster hostname.
   */
  hostname: string

  /**
   * SurrealDB database namespace.
   */
  namespace: string

  /**
   * SurrealDB database password.
   */
  password: string

  /**
   * SurrealDB database username.
   */
  username: string
}

export interface FetchRequest {
  method: 'POST'
  headers: Record<string, string>
  body: string
}

export interface FetchResponse {
  ok: boolean
  status: number
  statusText: string
  json: () => Promise<any>
  text: () => Promise<string>
}

/**
 * @see https://surrealdb.com/docs/integration/http#sql
 */
export interface SurrealDbRestRequestHeaders extends Record<string, string> {
  Accept: 'application/json'
  Authorization: `Basic ${string}`
  DB: string
  NS: string
}

export type SurrealDbRestResponseBody<R> = SurrealDbRestResponseBodyItem<R>[]

export interface SurrealDbRestResponseBodyItem<R> {
  result: R
  status: 'OK'
  time: string
}

export type SurrealDbRestDmlResponseBodyItem<O> = SurrealDbRestResponseBodyItem<O[]>

export type SurrealDbRestDdlResponseBodyItem = SurrealDbRestResponseBodyItem<null>

export type SurrealDbRestInfoForDbReponseBodyItem =
  SurrealDbRestResponseBodyItem<SurrealDbRestInfoForDbResponseBodyItemResult>

export interface SurrealDbRestInfoForDbResponseBodyItemResult {
  dl: Record<string, unknown>
  dt: Record<string, unknown>
  sc: Record<string, unknown>
  tb: Record<string, string>
}

export type SurrealDbRestInfoForTableResposeBodyItem =
  SurrealDbRestResponseBodyItem<SurrealDbRestInfoForTableResponseBodyItemResult>

export interface SurrealDbRestInfoForTableResponseBodyItemResult {
  ev: Record<string, unknown>
  fd: Record<string, string>
  ft: Record<string, unknown>
  ix: Record<string, unknown>
}
