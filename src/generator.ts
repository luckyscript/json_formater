import { Ast , JSONType, AstTree} from "./type";

class Generator {
  private stack: Array<string> = [];
  private type: JSONType;
  private children: Array<AstTree>;
  private push(...tokens: Array<string>) {
    this.stack.push(...tokens);
  }
  constructor(ast: Ast, config: any) {
    this.type = ast.type;
    this.children = ast.children;
  }
  private getStartToken(type: JSONType) {
    switch(type) {
      case JSONType.Object:
        return ['{', '}'];
      case JSONType.Array:
        return ['[', ']'];
      default:
        throw new Error(`cannot generate ${type} type json`);
    }
  }
  // 从ast生成代码的过程
  public generate(): string {
    const type: JSONType = this.type;
    const [startToken, endToken] = this.getStartToken(type);
    this.push(startToken);
    
    const length = this.children.length;
    this.children.forEach((astTree: AstTree, index: number) => {
      const { key, type, value } = astTree;
      if (this.type === JSONType.Object) {
        this.push(`"${key}": `);
      }
      switch(type) {
        case JSONType.String:
          this.push(`"${value.replace(/\\\"/g, 'ﾌ').replace(/ﾌ|"/g, '\\\"')}"`);
          break;
        case JSONType.Object:
        case JSONType.Array:
          this.push(new Generator(astTree, {}).generate());
          break;
        default:
          this.push(value);
          break;
      }
      if (index !== length -1) {
        this.push(',');
      }
    });

    this.push(endToken);
    return this.stack.join("");
  }
}

export default Generator;
