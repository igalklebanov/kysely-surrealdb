import {DefaultQueryCompiler, type OffsetNode, type OperationNode} from 'kysely'

import type {CreateQueryNode} from '../operation-node/create-query-node.js'
import {
  isSurrealOperationNode,
  type SurrealOperationNode,
  type SurrealOperationNodeKind,
} from '../operation-node/operation-node.js'
import type {ReturnNode} from '../operation-node/return-node.js'
import {isSurrealReturnType} from '../parser/return-parser.js'
import {freeze} from '../util/object-utils.js'

export class SurrealDbQueryCompiler extends DefaultQueryCompiler {
  protected override getLeftIdentifierWrapper(): string {
    return ''
  }

  protected override getRightIdentifierWrapper(): string {
    return ''
  }

  readonly #surrealVisitors: Record<SurrealOperationNodeKind, Function> = freeze({
    CreateQueryNode: this.visitCreateQuery.bind(this),
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

  protected override visitOffset(node: OffsetNode): void {
    this.append('start ')
    this.visitNode(node.offset)
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
