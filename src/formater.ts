import Parser from './parser';
import Generator from './generator';
import { Ast } from './type';
class Formatter {
  public set config(config: any) {
    this.config = config;
  }
  public parse(json: string) {
    const parserInstance = new Parser(json);
    return parserInstance.parse();
  }

  public generate(ast: Ast, config: any) {
    const generatorInstance = new Generator(ast, config);
    return generatorInstance.generate();
  }

  public format(json: string): string {
    json = json.replace(/([0-9a-zA-Z$\u4e00-\u9fa5]+)\s*:/g, function(_, $1) {
        return `ﾌ${$1}ﾌ:`
    });
    const ast: Ast = this.parse(json);
    return this.generate(ast, this.config);
  }


}

export default Formatter;
