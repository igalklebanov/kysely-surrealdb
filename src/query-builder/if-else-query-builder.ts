import {
  KyselyPlugin,
  NoResultError,
  type Compilable,
  type CompiledQuery,
  type Expression,
  type NoResultErrorConstructor,
  type OperationNode,
  type QueryExecutor,
} from 'kysely'

import {IfElseQueryNode} from '../operation-node/if-else-query-node.js'
import {preventAwait} from '../util/prevent-await.js'
import type {QueryId} from '../util/query-id.js'

export class IfElseQueryBuilder<O> {
  readonly #props: IfElseQueryBuilderProps

  constructor(props: IfElseQueryBuilderProps) {
    this.#props = props
  }

  /**
   * Adds an `else ...` clause to the query.
   *
   * see {@link elseIfThen} and {@link end}.
   *
   * ### Examples
   *
   * ```ts
   * db.ifThen(sql`${scope} = ${sql.literal('admin')}`, db.selectFrom('account').selectAll())
   *   .elseIfThen(sql`${scope} = ${sql.literal('user')}`, sql<Account[]>`(select * from ${auth}.account)`)
   *   .else(sql<[]>`[]`)
   *   .end()
   * ```
   *
   * The generated SQL:
   *
   * ```sql
   * if $1 = 'admin' then (select * from account)
   * else if $2 = 'user' then (select * from $3.account)
   * else []
   * end
   * ```
   */
  else<O2>(expression: Expression<O2>): IfElseQueryBuilder<O | O2> {
    return new IfElseQueryBuilder({
      ...this.#props,
      queryNode: IfElseQueryNode.cloneWithElse(this.#props.queryNode, expression.toOperationNode()),
    })
  }

  /**
   * Adds an `else if ... then ...` clause to the query.
   *
   * see {@link else} and {@link end}.
   *
   * ### Examples
   *
   * ```ts
   * db.ifThen(sql`${scope} = ${sql.literal('admin')}`, db.selectFrom('account').selectAll())
   *   .elseIfThen(sql`${scope} = ${sql.literal('user')}`, sql<Account[]>`(select * from ${auth}.account)`)
   *   .else(sql<[]>`[]`)
   *   .end()
   * ```
   *
   * The generated SQL:
   *
   * ```sql
   * if $1 = 'admin' then (select * from account)
   * else if $2 = 'user' then (select * from $3.account)
   * else []
   * end
   * ```
   */
  elseIfThen<O2>(condition: Expression<boolean>, expression: Expression<O2>): IfElseQueryBuilder<O | O2> {
    return new IfElseQueryBuilder({
      ...this.#props,
      queryNode: IfElseQueryNode.cloneWithElseIf(
        this.#props.queryNode,
        condition.toOperationNode(),
        expression.toOperationNode(),
      ),
    })
  }

  /**
   * Adds an `end` to the query.
   *
   * see {@link elseIfThen} and {@link else}.
   *
   * ### Examples
   *
   * ```ts
   * db.ifThen(sql`${scope} = ${sql.literal('admin')}`, db.selectFrom('account').selectAll())
   *   .elseIfThen(sql`${scope} = ${sql.literal('user')}`, sql<Account[]>`(select * from ${auth}.account)`)
   *   .else(sql<[]>`[]`)
   *   .end()
   * ```
   *
   * The generated SQL:
   *
   * ```sql
   * if $1 = 'admin' then (select * from account)
   * else if $2 = 'user' then (select * from $3.account)
   * else []
   * end
   * ```
   */
  end(): EndedIfElseQueryBuilder<O> {
    return new EndedIfElseQueryBuilder({
      ...this.#props,
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
   *   .$call(log)
   *   .execute()
   * ```
   */
  $call<T>(func: (qb: this) => T): T {
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
   *     .$if(returnLastName, (qb) => qb.return('last_name'))
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
  $if<O2>(condition: boolean, func: (qb: this) => IfElseQueryBuilder<O2>): IfElseQueryBuilder<O | O2> {
    if (condition) {
      return func(this) as any
    }

    return new IfElseQueryBuilder({
      ...this.#props,
    })
  }

  /**
   * Change the output type of the query.
   *
   * You should only use this method as the last resort if the types don't support
   * your use case.
   */
  $castTo<T>(): IfElseQueryBuilder<T> {
    return new IfElseQueryBuilder(this.#props)
  }

  /**
   * Returns a copy of this IfElseQueryBuilder instance with the given plugin installed.
   */
  $withPlugin(plugin: KyselyPlugin): IfElseQueryBuilder<O> {
    return new IfElseQueryBuilder({
      ...this.#props,
      executor: this.#props.executor.withPlugin(plugin),
    })
  }
}

preventAwait(
  IfElseQueryBuilder,
  "don't await IfElseQueryBuilder instances directly. To execute the query you need to call `execute` or `executeTakeFirst`.",
)

interface IfElseQueryBuilderProps {
  executor: QueryExecutor
  queryId: QueryId
  queryNode: IfElseQueryNode
}

export class EndedIfElseQueryBuilder<O> implements Expression<O>, Compilable<O> {
  readonly #props: IfElseQueryBuilderProps

  constructor(props: IfElseQueryBuilderProps) {
    this.#props = props
  }

  /**
   * @internal
   */
  get expressionType(): O | undefined {
    return undefined
  }

  toOperationNode(): OperationNode {
    return this.#props.executor.transformQuery(this.#props.queryNode as any, this.#props.queryId)
  }

  compile(): CompiledQuery<O> {
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

    const results = await this.#props.executor.executeQuery<O>(compiledQuery, this.#props.queryId)

    return results.rows
  }

  /**
   * Executes the query and returns the first result or undefined if the query
   * returned no result.
   */
  async executeTakeFirst(): Promise<O | undefined> {
    const results = await this.execute()

    return results[0]
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

    return result
  }
}

preventAwait(
  EndedIfElseQueryBuilder,
  "don't await EndedIfElseQueryBuilder instances directly. To execute the query you need to call `execute` or `executeTakeFirst`.",
)
