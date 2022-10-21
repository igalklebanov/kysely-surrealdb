import {
  DefaultQueryCompiler,
  RawNode,
  SelectQueryNode,
  type OffsetNode,
  type OperationNode,
  type RootOperationNode,
} from 'kysely'

import type {CreateQueryNode} from '../operation-node/create-query-node.js'
import type {ElseIfNode} from '../operation-node/else-if-node.js'
import type {IfElseQueryNode} from '../operation-node/if-else-query-node.js'
import {
  isSurrealOperationNode,
  type SurrealOperationNode,
  type SurrealOperationNodeKind,
} from '../operation-node/operation-node.js'
import type {RelateQueryNode} from '../operation-node/relate-query-node.js'
import type {ReturnNode} from '../operation-node/return-node.js'
import {isSurrealReturnType} from '../parser/return-parser.js'
import {freeze} from '../util/object-utils.js'

export class SurrealDbQueryCompiler extends DefaultQueryCompiler {
  protected appendRootOperationNodeAsValue(node: RootOperationNode): void {
    const {parameters, sql} = new SurrealDbQueryCompiler().compileQuery(node)

    parameters.forEach((parameter) => this.appendValue(parameter))
    this.appendValue(`SURREALQL::(${sql})`)
  }

  protected override getLeftIdentifierWrapper(): string {
    return ''
  }

  protected override getRightIdentifierWrapper(): string {
    return ''
  }

  readonly #surrealVisitors: Record<SurrealOperationNodeKind, Function> = freeze({
    CreateQueryNode: this.visitCreateQuery.bind(this),
    ElseIfNode: this.visitElseIf.bind(this),
    IfElseQueryNode: this.visitIfElseQuery.bind(this),
    RelateQueryNode: this.visitRelateQuery.bind(this),
    ReturnNode: this.visitReturn.bind(this),
  })

  protected readonly superVisitNode = this.visitNode
  protected readonly visitNode = (node: OperationNode): void => {
    if (!isSurrealOperationNode(node)) {
      return this.superVisitNode(node)
    }

    this.nodeStack.push(node)
    this.#surrealVisitors[(node as SurrealOperationNode).kind](node)
    this.nodeStack.pop()
  }

  protected visitCreateQuery(node: CreateQueryNode): void {
    this.append('create ')
    this.visitNode(node.target)

    if (node.content) {
      this.append(' content ')
      this.visitNode(node.content)
    }

    if (node.set) {
      this.append(' set ')
      this.compileList(node.set)
    }

    if (node.return) {
      this.append(' ')
      this.visitNode(node.return as any)
    }
  }

  protected visitElseIf(node: ElseIfNode): void {
    this.append('else if ')
    this.visitNode(node.if)

    if (node.then) {
      this.append(' then ')
      this.visitNode(node.then as any)
    }
  }

  protected visitIfElseQuery(node: IfElseQueryNode): void {
    this.append('if ')
    this.visitNode(node.if)

    if (node.then) {
      this.append(' then ')
      this.visitNode(node.then as any)
    }

    if (node.elseIf && node.elseIf.length > 0) {
      this.append(' ')
      this.compileList(node.elseIf as any, ' ')
    }

    if (node.else) {
      this.append(' else ')
      this.visitNode(node.else as any)
    }

    this.append(' end')
  }

  protected override visitOffset(node: OffsetNode): void {
    this.append('start ')
    this.visitNode(node.offset)
  }

  protected visitRelateQuery(node: RelateQueryNode): void {
    const {content, from, set, to} = node

    this.append('relate ')

    if (from) {
      if (SelectQueryNode.is(from) || RawNode.is(from)) {
        this.appendRootOperationNodeAsValue(from)
      } else {
        this.visitNode(from as any)
      }

      this.append(' -> ')
    }

    this.visitNode(node.table)

    if (to) {
      this.append(' -> ')

      if (SelectQueryNode.is(to) || RawNode.is(to)) {
        this.appendRootOperationNodeAsValue(to)
      } else {
        this.visitNode(to as any)
      }
    }

    if (content) {
      this.append(' content ')
      this.visitNode(content)
    }

    if (set) {
      this.append(' set ')
      this.compileList(set)
    }

    if (node.return) {
      this.append(' ')
      this.visitNode(node.return as any)
    }
  }

  protected visitReturn(node: ReturnNode): void {
    this.append('return ')

    if (isSurrealReturnType(node.return)) {
      return this.append(node.return)
    }

    if (Array.isArray(node.return)) {
      return this.compileList(node.return)
    }

    this.visitNode(node.return as any)
  }
}
