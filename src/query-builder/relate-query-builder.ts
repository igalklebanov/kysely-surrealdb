import {
  NoResultError,
  type AnySelectQueryBuilder,
  type Compilable,
  type CompiledQuery,
  type KyselyPlugin,
  type NoResultErrorConstructor,
  type QueryExecutor,
  type RawBuilder,
} from 'kysely'

import {RelateQueryNode} from '../operation-node/relate-query-node.js'
import {parseContent, parseSetObject, type CreateObject} from '../parser/create-object-parser.js'
import {
  parseReturnExpression,
  type ExtractTypeFromReturnExpression,
  type ReturnExpression,
} from '../parser/return-parser.js'
import {parseVertexExpression, type VertexExpression} from '../parser/vertex-expression-parser.js'
import {preventAwait} from '../util/prevent-await.js'
import type {QueryId} from '../util/query-id.js'
import type {AnyTable, SurrealRecordId} from '../util/surreal-types.js'
import type {MergePartial} from '../util/type-utils.js'

export class RelateQueryBuilder<DB, TB extends keyof DB, O = DB[TB]> implements Compilable {
  readonly #props: RelateQueryBuilderProps

  constructor(props: RelateQueryBuilderProps) {
    this.#props = props
  }

  from<FT extends AnyTable<DB>>(table: FT, id: string | number): RelateQueryBuilder<DB, TB, O>
  from<R extends SurrealRecordId<DB>>(record: R): RelateQueryBuilder<DB, TB, O>
  from<EX extends AnySelectQueryBuilder | RawBuilder<any>>(expression: EX): RelateQueryBuilder<DB, TB, O>

  from<T extends AnyTable<DB> | VertexExpression<DB>>(target: T, id?: string | number): RelateQueryBuilder<DB, TB, O> {
    const expression = id !== undefined ? `${String(target)}:${id}` : target

    return new RelateQueryBuilder({
      ...this.#props,
      queryNode: RelateQueryNode.cloneWithFrom(this.#props.queryNode, parseVertexExpression(expression as any)),
    })
  }

  to<FT extends AnyTable<DB>>(table: FT, id: string | number): RelateQueryBuilder<DB, TB, O>
  to<R extends SurrealRecordId<DB>>(record: R): RelateQueryBuilder<DB, TB, O>
  to<EX extends AnySelectQueryBuilder | RawBuilder<any>>(expression: EX): RelateQueryBuilder<DB, TB, O>

  to<T extends AnyTable<DB> | VertexExpression<DB>>(target: T, id?: string | number): RelateQueryBuilder<DB, TB, O> {
    const expression = id !== undefined ? `${String(target)}:${id}` : target

    return new RelateQueryBuilder({
      ...this.#props,
      queryNode: RelateQueryNode.cloneWithTo(this.#props.queryNode, parseVertexExpression(expression as any)),
    })
  }

  content<C extends CreateObject<DB, TB>>(content: C): RelateQueryBuilder<DB, TB, O & C> {
    return new RelateQueryBuilder({
      ...this.#props,
      queryNode: RelateQueryNode.cloneWithContent(this.#props.queryNode, parseContent(content)),
    })
  }

  set<V extends CreateObject<DB, TB>>(values: V): RelateQueryBuilder<DB, TB, O & V> {
    return new RelateQueryBuilder({
      ...this.#props,
      queryNode: RelateQueryNode.cloneWithSet(this.#props.queryNode, parseSetObject(values)),
    })
  }

  return<RE extends ReturnExpression<DB, TB>>(
    expression: RE,
  ): RelateQueryBuilder<DB, TB, ExtractTypeFromReturnExpression<DB, TB, RE>> {
    return new RelateQueryBuilder({
      ...this.#props,
      queryNode: RelateQueryNode.cloneWithReturn(this.#props.queryNode, parseReturnExpression(expression)),
    })
  }

  call<T>(func: (qb: this) => T): T {
    return func(this)
  }

  if<O2>(
    condition: boolean,
    func: (qb: this) => RelateQueryBuilder<DB, TB, O2>,
  ): RelateQueryBuilder<DB, TB, MergePartial<O, O2>> {
    if (condition) {
      return func(this) as any
    }

    return new RelateQueryBuilder({
      ...this.#props,
    })
  }

  /**
   * Change the output type of the query.
   *
   * You should only use this method as the last resort if the types
   * don't support your use case.
   */
  castTo<T>(): RelateQueryBuilder<DB, TB, T> {
    return new RelateQueryBuilder(this.#props)
  }

  /**
   * Returns a copy of this CreateQueryBuilder instance with the given plugin installed.
   */
  withPlugin(plugin: KyselyPlugin): RelateQueryBuilder<DB, TB, O> {
    return new RelateQueryBuilder({
      ...this.#props,
      executor: this.#props.executor.withPlugin(plugin),
    })
  }

  toOperationNode(): RelateQueryNode {
    return this.#props.executor.transformQuery(this.#props.queryNode as any, this.#props.queryId) as any
  }

  compile(): CompiledQuery {
    return this.#props.executor.compileQuery(this.toOperationNode() as any, this.#props.queryId)
  }

  /**
   * Executes the query and returns an array of rows.
   *
   * Also see the {@link executeTakeFirst} and {@link executeTakeFirstOrThrow} methods.
   */
  async execute(): Promise<O[]> {
    const compiledQuery = this.compile()

    const result = await this.#props.executor.executeQuery<O>(compiledQuery, this.#props.queryId)

    return result.rows
  }

  /**
   * Executes the query and returns the first result or undefined if
   * the query returned no result.
   */
  async executeTakeFirst(): Promise<O> {
    const [result] = await this.execute()

    return result
  }

  /**
   * Executes the query and returns the first result or throws if
   * the query returned no result.
   *
   * By default an instance of {@link NoResultError} is thrown, but you can
   * provide a custom error class as the only argument to throw a different
   * error.
   */
  async executeTakeFirstOrThrow(errorConstructor: NoResultErrorConstructor = NoResultError): Promise<O> {
    const result = await this.executeTakeFirst()

    if (result === undefined) {
      throw new errorConstructor(this.toOperationNode() as any)
    }

    return result as O
  }
}

preventAwait(
  RelateQueryBuilder,
  "don't await RelateQueryBuilder instances directly. To execute the query you need to call `execute` or `executeTakeFirst`.",
)

interface RelateQueryBuilderProps {
  executor: QueryExecutor
  queryId: QueryId
  queryNode: RelateQueryNode
}
