import type {CreateObject} from '../parser/create-object-parser.js'

export interface SetContentInterface<DB, TB extends keyof DB, O> {
  /**
   * Sets the created relation's values for a {@link SurrealKysely} query, using
   * the content clause.
   *
   * This method takes an object whose keys are column names and values are values
   * to insert. In addition to the column's type, the values can be raw {@link sql}
   * snippets or select queries.
   *
   * Nested builders in content objects are not supported yet. You can pass raw
   * SurrealQL as a workaround.
   *
   * You must provide all fields you haven't explicitly marked as nullable or optional
   * using {@link Generated} or {@link ColumnType}
   *
   * This query returns the created relation/s by default. See the {@link return}
   * method for a way to control the returned data.
   *
   * ### Examples
   *
   * ```ts
   * import {sql} from 'kysely'
   *
   * const relation = await db
   *   .relate('write')
   *   .from('user', 'tobie')
   *   .to('article', 'surreal')
   *   .content(sql`{source: 'Apple notes', tags: ['notes', 'markdown'], time: {written: time::now()}}`)
   *   .executeTakeFirst()
   * ```
   *
   * The generated SurrealQL:
   *
   * ```sql
   * relate user:tobie -> write -> article:surreal
   * content {source: 'Apple notes', tags: ['notes', 'markdown'], time: {written: time::now()}};
   * ```
   */
  content<C extends CreateObject<DB, TB>>(content: C): SetContentInterface<DB, TB, O & C>

  /**
   * Sets the created relation's values for a {@link SurrealKysely} query, using
   * the set clause.
   *
   * This method takes an object whose keys are column names (or nested object column paths) and values are values
   * to insert. In addition to the column's type, the values can be raw {@link sql}
   * snippets or select queries.
   *
   * You must provide all fields you haven't explicitly marked as nullable or optional
   * using {@link Generated} or {@link ColumnType}
   *
   * This query returns the created relation/s by default. See the {@link return} method
   * for a way to control the returned data.
   *
   * ### Examples
   *
   * ```ts
   * import {sql} from 'kysely'
   *
   * const relation = await db
   *   .relate('write')
   *   .from('user:tobie')
   *   .to('article:surreal')
   *   .set({
   *     'time.written': sql`time::now()`,
   *   })
   *   .executeTakeFirst()
   * ```
   *
   * The generated SurrealQL:
   *
   * ```sql
   * relate user:tobie -> write -> article:surreal
   * set time.written = time::now();
   * ```
   */
  set<V extends CreateObject<DB, TB>>(values: V): SetContentInterface<DB, TB, O & V>
}
