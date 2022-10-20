import type {ReturnExpression} from '../parser/return-parser.js'

export interface ReturnInterface<DB, TB extends keyof DB, O> {
  /**
   * Allows controlling the returned value for a {@link SurrealKysely} query, using
   * the return clause.
   *
   * SurrealDB returns the created record/s by default. This can be changed by selecting
   * specific columns, or using a reserved keyword such as `'none'`, `'diff'`, `'before'`
   *  & `'after'`.
   *
   * ### Examples
   *
   * ```ts
   * await db
   *   .create('person')
   *   .set({
   *     age: 46,
   *     username: 'john-smith',
   *   })
   *   .return('none')
   *   .execute()
   * ```
   *
   * The generated SurrealQL:
   *
   * ```sql
   * let $1 = 46;
   * let $2 = 'john-smith';
   * create person set age = $1, username = $2 return none;
   * ```
   *
   * ...
   *
   * ```ts
   * const person = await db
   *   .create('person')
   *   .set({
   *     age: 46,
   *     username: 'john-smith',
   *     interests: ['skiing', 'music'],
   *   })
   *   .return(['username', 'interests'])
   *   .executeTakeFirst()
   * ```
   *
   * The generated SurrealQL:
   *
   * ```sql
   * let $1 = 46;
   * let $2 = 'john-smith';
   * let $3 = [\"skiing\",\"music\"];
   * create person
   * set age = $1, username = $2, interests = $3
   * return username, interests;
   * ```
   */
  return<RE extends ReturnExpression<DB, TB>>(expression: RE): ReturnInterface<DB, TB, O>
}
