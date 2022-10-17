import {
  NoResultError,
  type Compilable,
  type CompiledQuery,
  type KyselyPlugin,
  type NoResultErrorConstructor,
  type QueryExecutor,
} from 'kysely'

import {CreateQueryNode} from '../operation-node/create-query-node.js'
import {parseContent, parseSetObject, type CreateObject} from '../parser/create-object-parser.js'
import {
  parseReturnExpression,
  type ExtractTypeFromReturnExpression,
  type ReturnExpression,
} from '../parser/return-parser.js'
import {preventAwait} from '../util/prevent-await.js'
import type {QueryId} from '../util/query-id.js'
import type {MergePartial} from '../util/type-utils.js'

export class CreateQueryBuilder<DB, TB extends keyof DB, O> implements Compilable {
  #props: CreateQueryBuilderProps

  constructor(props: CreateQueryBuilderProps) {
    this.#props = props
  }

  content<C extends CreateObject<DB, TB>>(content: C): CreateQueryBuilder<DB, TB, O & C> {
    return new CreateQueryBuilder({
      ...this.#props,
      queryNode: CreateQueryNode.cloneWithContent(this.#props.queryNode, parseContent(content)),
    })
  }

  set<V extends CreateObject<DB, TB>>(values: V): CreateQueryBuilder<DB, TB, O & V> {
    return new CreateQueryBuilder({
      ...this.#props,
      queryNode: CreateQueryNode.cloneWithSet(this.#props.queryNode, parseSetObject(values)),
    })
  }

  return<RE extends ReturnExpression<DB, TB>>(
    expression: RE,
  ): CreateQueryBuilder<DB, TB, ExtractTypeFromReturnExpression<DB, TB, RE>> {
    return new CreateQueryBuilder({
      ...this.#props,
      queryNode: CreateQueryNode.cloneWithReturn(this.#props.queryNode, parseReturnExpression(expression)),
    })
  }

  call<T>(func: (qb: this) => T): T {
    return func(this)
  }

  if<O2>(
    condition: boolean,
    func: (qb: this) => CreateQueryBuilder<DB, TB, O2>,
  ): CreateQueryBuilder<DB, TB, MergePartial<O, O2>> {
    if (condition) {
      return func(this) as any
    }

    return new CreateQueryBuilder({
      ...this.#props,
    })
  }

  /**
   * Change the output type of the query.
   *
   * You should only use this method as the last resort if the types
   * don't support your use case.
   */
  castTo<T>(): CreateQueryBuilder<DB, TB, T> {
    return new CreateQueryBuilder(this.#props)
  }

  /**
   * Returns a copy of this CreateQueryBuilder instance with the given plugin installed.
   */
  withPlugin(plugin: KyselyPlugin): CreateQueryBuilder<DB, TB, O> {
    return new CreateQueryBuilder({
      ...this.#props,
      executor: this.#props.executor.withPlugin(plugin),
    })
  }

  toOperationNode(): CreateQueryNode {
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
  CreateQueryBuilder,
  "don't await CreateQueryBuilder instances directly. To execute the query you need to call `execute` or `executeTakeFirst`.",
)

type CreateQueryBuilderProps = {
  readonly executor: QueryExecutor
  readonly queryId: QueryId
  readonly queryNode: CreateQueryNode
}
