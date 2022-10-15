import {DefaultQueryCompiler, type OffsetNode} from 'kysely'

export class SurrealDbQueryCompiler extends DefaultQueryCompiler {
  protected override getLeftIdentifierWrapper(): string {
    return ''
  }

  protected override getRightIdentifierWrapper(): string {
    return ''
  }

  protected override visitOffset(node: OffsetNode): void {
    this.append('start ')
    this.visitNode(node.offset)
  }
}
