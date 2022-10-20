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
import type {ReturnInterface} from './return-interface.js'
import type {SetContentInterface} from './set-content-interface.js'

export class RelateQueryBuilder<DB, TB extends keyof DB, O = DB[TB]>
  implements Compilable, ReturnInterface<DB, TB, O>, SetContentInterface<DB, TB, O>
{
  readonly #props: RelateQueryBuilderProps

  constructor(props: RelateQueryBuilderProps) {
    this.#props = props
  }

  /**
   *
   */
  from(table: AnyTable<DB>, id: string | number): RelateQueryBuilder<DB, TB, O>

  from(record: SurrealRecordId<DB>): RelateQueryBuilder<DB, TB, O>

  from(expression: AnySelectQueryBuilder | RawBuilder<any>): RelateQueryBuilder<DB, TB, O>

  from(target: AnyTable<DB> | VertexExpression<DB>, id?: string | number): any {
    const expression = id !== undefined ? `${String(target)}:${id}` : target

    return new RelateQueryBuilder({
      ...this.#props,
      queryNode: RelateQueryNode.cloneWithFrom(this.#props.queryNode, parseVertexExpression(expression as any)),
    })
  }

  /**
   *
   */
  to(table: AnyTable<DB>, id: string | number): RelateQueryBuilder<DB, TB, O>

  to(record: SurrealRecordId<DB>): RelateQueryBuilder<DB, TB, O>

  to(expression: AnySelectQueryBuilder | RawBuilder<any>): RelateQueryBuilder<DB, TB, O>

  to(target: AnyTable<DB> | VertexExpression<DB>, id?: string | number): any {
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

  /**
   * Simply calls the given function passing `this` as the only argument.
   *
   * If you want to conditionally call a method on `this`, see the {@link if} method.
   *
   * ### Examples
   *
   * The next example uses a helper funtion `log` to log a query:
   *
   * ```ts
   * function log<T extends Compilable>(qb: T): T {
   *   console.log(qb.compile())
   *   return qb
   * }
   *
   * db.updateTable('person')
   *   .set(values)
   *   .call(log)
   *   .execute()
   * ```
   */
  call<T>(func: (qb: this) => T): T {
    return func(this)
  }

  /**
   * Call `func(this)` if `condition` is true.
   *
   * This method is especially handy with optional selects. Any `return` method
   * calls add columns as optional fields to the output type when called inside
   * the `func` callback. This is because we can't know if those selections were
   * actually made before running the code.
   *
   * You can also call any other methods inside the callback.
   *
   * ### Examples
   *
   * ```ts
   * async function createPerson(values: Insertable<Person>, returnLastName: boolean) {
   *   return await db
   *     .create('person')
   *     .set(values)
   *     .return(['id', 'first_name'])
   *     .if(returnLastName, (qb) => qb.return('last_name'))
   *     .executeTakeFirstOrThrow()
   * }
   * ```
   *
   * Any selections added inside the `if` callback will be added as optional fields to the
   * output type since we can't know if the selections were actually made before running
   * the code. In the example above the return type of the `createPerson` function is:
   *
   * ```ts
   * {
   *   id: number
   *   first_name: string
   *   last_name?: string
   * }
   * ```
   */
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
   * You should only use this method as the last resort if the types don't support
   * your use case.
   */
  castTo<T>(): RelateQueryBuilder<DB, TB, T> {
    return new RelateQueryBuilder(this.#props)
  }

  /**
   * Returns a copy of this RelateQueryBuilder instance with the given plugin installed.
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
   * Also see the {@link executeTakeFirst} and {@link executeTakeFirstOrThrow}
   * methods.
   */
  async execute(): Promise<O[]> {
    const compiledQuery = this.compile()

    const result = await this.#props.executor.executeQuery<O>(compiledQuery, this.#props.queryId)

    return result.rows
  }

  /**
   * Executes the query and returns the first result or undefined if the query
   * returned no result.
   */
  async executeTakeFirst(): Promise<O> {
    const [result] = await this.execute()

    return result
  }

  /**
   * Executes the query and returns the first result or throws if the query returned
   * no result.
   *
   * By default an instance of {@link NoResultError} is thrown, but you can provide
   * a custom error class as the only argument to throw a different error.
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
