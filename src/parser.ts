import { skipWhitespace, skipWhitespaceBack, isDigit1to9, isDigit } from './util';
import { JSONType, Ast, AstTree } from './type';
export default class Parser {

  private pointer: number;
  private current: string;
  private input: string;
  private length: number;
  private stack: Array<string> = [];

  constructor(input: string) {
    this.input = input;
    this.init();
  }
  private init() {
    this.pointer = skipWhitespace(this.input, 0);
    this.current = this.input[this.pointer];
    this.length = this.input.length;
  }
  private next(skip: boolean = true) {
    skip && (this.pointer = skipWhitespace(this.input, this.pointer));
    this.pointer++;
    skip && (this.pointer = skipWhitespace(this.input, this.pointer));
    if (this.pointer > this.length) {
      // 这里指针可以越界一位，因为部分类型判断需要结束标志然后做回退操作
      throw new Error(`pointer over size`);
    }
    this.current = this.input[this.pointer];
    return {
      pointer: this.pointer,
      current: this.current,
    }
  }

  private back(skip: boolean = true) {
    skip && (this.pointer = skipWhitespaceBack(this.input, this.pointer));
    this.pointer--;
    skip && (this.pointer = skipWhitespaceBack(this.input, this.pointer));
    this.current = this.input[this.pointer];
    return {
      pointer: this.pointer,
      current: this.current,
    }
  }
  
  public parse(input: string) {
    switch(this.current) {
      case '{':
        return this.parseObject();
      case '[':
        return this.parseArray();
      default:
        throw new Error(`unsupport input: ${input}`);
    }
  }
  public parseObject(): Ast {
    const type: JSONType = JSONType.Object;
    const start: number = this.pointer;
    let children: Array<AstTree> = [];
    const keymarkerSet = ['"', "'", 'ﾌ'];
    if (this.current !== '{') {
      throw new Error (`unknown objectlike type near ${this.current}`);
    }
    this.next();
    // @ts-ignore 
    if (this.current === '}') {
      return {
        value: '{}',
        type,
        children,
        length: this.pointer - start,
      }
    }
    for (;;) {
      let key;
      if (keymarkerSet.includes(this.current)) {
        key = this.parseKey(this.current);
        this.next();
      } else {
        throw new Error(`unknow objectlike type near ${this.current}`);
      }
      // @ts-ignore 
      if (this.current === ':') {
        this.next();
      } else {
        throw new Error(`unknow objectlike type near ${this.current}`);
      }
      const valueAST: Ast = this.parseValue();
      const tree = {
        key,
        ...valueAST,
      }
      children.push(tree);

      this.next();
      // @ts-ignore 
      if (this.current === ',') {
        this.next();
        continue;
      }
      // @ts-ignore 
      if (this.current === '}') {
        break;
      }
    }
    const length = this.pointer - start + 1;
    return {
      value: this.input.substr(start, length),
      type,
      children,
      length,
    }
  }
  private parseKey(keyMark: string): string {
    // parse出一个string类型的key
    const stringAst = this.parseString(keyMark);
    const { value } = stringAst;
    return value;
  }
  public parseArray(): Ast {
    if (this.current !== '[') {
      throw new Error(`current input is not a array type, near ${this.current}`);
    }
    const start = this.pointer;
    const type = JSONType.Array;
    let key = 0;
    let children: Array<AstTree> = [];
    
    this.next()
    // @ts-ignore
    if (this.current === ']') {
      return {
        value: '[]',
        type,
        length: this.pointer - start + 1,
      }
    }

    for (;;) {
      const valueAST: Ast = this.parseValue();
      const tree = {
        key,
        ...valueAST,
      }
      key++;
      children.push(tree);
      this.next();
      // @ts-ignore
      if (this.current === ',') {
        this.next()
        continue;
      }
      // @ts-ignore
      if (this.current === ']') {
        break;
      }
    }
    const length = this.pointer - start + 1;
    return {
      value: this.input.substr(start, length),
      type,
      children,
      length,
    }
    // this.next();
    // // @ts-ignore
    // if (this.current === ']') {
    //   return {
    //     value: '[]',
    //     type,
    //     length: this.pointer - start + 1,
    //   }
    // }
    // for(let depth = 1; depth != 0; this.next()) {
    //   // @ts-ignore
    //   if (this.current === ',') {
    //     continue;
    //   }
    //   if (this.current === '[') {
    //     depth++;
    //   }
    //   // @ts-ignore
    //   if (this.current === ']') {
    //     depth--;
    //   }

    //   // @ts-ignore
    //   if(this.current !== ']') {
    //     let tree: AstTree = {
    //       key: '',
    //       value: '',
    //       children: [],
    //       type: JSONType.Object
    //     };
    //     console.log(this.current, this.pointer)
    //     const valueAST: Ast = this.parseValue();
    //     console.log(valueAST, 'valueAST')
    //     if(valueAST.type === JSONType.Object) {
    //       tree.children = valueAST.children;
    //     } else {
    //       tree.value = valueAST.value;
    //       tree.children = valueAST.children || [];
    //     }
    //     tree.type = valueAST.type;
    //     tree.key = key.toString();
    //     children.push(tree);
    //     key++;
    //   }
    // }
    // const length = this.pointer - start;
    // this.back();
    // return {
    //   value: this.input.substr(start, length),
    //   children,
    //   type: JSONType.Array,
    //   length,
    // }
  }
  public parseNumber(): Ast {
    const start = this.pointer;
    const type = JSONType.Number;
    if (this.current === '-') {
      this.next();
    }
    if (this.current === '0') {
      this.next();
    } else {
      if (!isDigit1to9(this.current)) {
        throw new Error(`unsupport number type near ${this.current}`);
      }
      for(this.next();isDigit(this.current);this.next());
    }
    if (this.current === '.') {
      this.next();
      if (!isDigit(this.current)) {
        throw new Error(`unsupport number type near ${this.current}`);
      } else {
        for(this.next();isDigit(this.current);this.next());
      }
    }
    if (this.current === 'e' || this.current === 'E') {
      this.next();
      // @ts-ignore
      if (this.current === '+' || this.current === '-') {
        this.next();
      } else {
        if (!isDigit(this.current)) {
          throw new Error(`unsupport number type near ${this.current}`);
        } else {
          for(this.next();isDigit(this.current);this.next());
        }
      }
    }
    const length = this.pointer - start;
    const ast: Ast = {
      value: this.input.substr(start, length),
      type,
      length,
    }
    // 判断数字的时候，会多进一格，这里做回退操作
    this.back();
    return ast;
    
  }
  public parseString(marker: string): Ast {
    if (this.current === marker) {
      this.next();
    }
    const type = JSONType.String;
    const start = this.pointer;
    for (;;) {
      if (this.current === marker) {
        break;
      } else if (this.current !== '\\') {
        // any codepoint except marker or \ or control characters
        this.next();
        continue;
      } else if (this.current === '\\') {
        const { current } = this.next();
        switch(current) {
          case marker:
            case '\\':
            case '/':
            case 'b':
            case 'f':
            case 'n':
            case 'r':
            case 'n':
            case 'f':
            case 't':
            this.next();
            break;
          case 'u':
            default:
            throw new Error(`unknown string type near slash ${this.current}`);
        }
      } else {
        throw new Error(`unknown string type near ${this.current}`);
      }
    }
    const length = this.pointer - start;
    return({
      value: this.input.substr(start, length).replace(/ﾌ/g, ''),
      type,
      length,
    });
  }
  public parseLiteral(literalValue: string): Ast {
    for(let i = 0; i < literalValue.length; i++) {
      if (this.current !== literalValue[i]) {
        throw new Error(`unknow value near ${this.current}`);
      }
      this.next();
    }
    // 这几种类型 指针会多进一格 这里回退
    this.back();
    switch(literalValue) {
      case 'true':
        return {
          value: 'true',
          type: JSONType.Boolean,
          length: 4,
        }
      case 'false':
        return {
          value: 'false',
          type: JSONType.Boolean,
          length: 5
        };
      case 'null':
        return {
          value: 'null',
          type: JSONType.Null,
          length: 4
        };
      default:
        throw new Error(`parseLiteral can only parse boolean or null type value, current type is ${literalValue}`);
    }
  }
  private parseValue() {
    switch(this.current) {
      // true
      case 't':
        return this.parseLiteral('true');
      // false
      case 'f':
        return this.parseLiteral('false');
      case 'n':
        return this.parseLiteral('null');
      // string
      case '"':
        return this.parseString('"');
      case "'":
          return this.parseString("'");
      // array
      case '[':
        return this.parseArray();
      // object
      case '{':
        return this.parseObject();
      case '-':
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        return this.parseNumber();
      default:
        throw new Error(`unknown type near ${this.current}`)
    }
  }
}
