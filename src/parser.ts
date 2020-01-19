import { skipWhitespace, skipWhitespaceBack, isDigit1to9, isDigit } from './util';
import { JSONType, Ast, AstTree } from './type';
export default class Parser {

  private pointer: number;
  private current: string;
  private input: string;
  private length: number;

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

  private token() {
    return this.input[this.pointer];
  }
  
  public parse() {
    switch(this.token()) {
      case '{':
        return this.parseObject();
      case '[':
        return this.parseArray();
      default:
        throw new Error(`unsupport input: ${this.input}`);
    }
  }
  public parseObject(): Ast {
    const type: JSONType = JSONType.Object;
    const start: number = this.pointer;
    let children: Array<AstTree> = [];
    const keymarkerSet = ['"', "'", 'ﾌ'];
    if (this.token() !== '{') {
      throw new Error (`unknown objectlike type near ${this.token()}`);
    }
    this.next();
    // @ts-ignore 
    if (this.token() === '}') {
      return {
        value: '{}',
        type,
        children,
        length: this.pointer - start,
      }
    }
    for (;;) {
      let key;
      if (keymarkerSet.includes(this.token())) {
        key = this.parseKey(this.token());
        this.next();
      } else {
        throw new Error(`unknow objectlike type near ${this.token()}`);
      } 
      if (this.token() === ':') {
        this.next();
      } else {
        throw new Error(`unknow objectlike type near ${this.token()}`);
      }
      const valueAST: Ast = this.parseValue();
      const tree = {
        key,
        ...valueAST,
      }
      children.push(tree);

      this.next(); 
      if (this.token() === ',') {
        this.next();
        continue;
      } 
      if (this.token() === '}') {
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
    if (this.token() !== '[') {
      throw new Error(`current input is not a array type, near ${this.token()}`);
    }
    const start = this.pointer;
    const type = JSONType.Array;
    let key = 0;
    let children: Array<AstTree> = [];
    
    this.next()
    // @ts-ignore
    if (this.token() === ']') {
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
      if (this.token() === ',') {
        this.next()
        continue;
      }
      if (this.token() === ']') {
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
  public parseNumber(): Ast {
    const start = this.pointer;
    const type = JSONType.Number;
    if (this.token() === '-') {
      this.next();
    }
    if (this.token() === '0') {
      this.next();
    } else {
      if (!isDigit1to9(this.token())) {
        throw new Error(`unsupport number type near ${this.token()}`);
      }
      for(this.next();isDigit(this.token());this.next());
    }
    if (this.token() === '.') {
      this.next();
      if (!isDigit(this.token())) {
        throw new Error(`unsupport number type near ${this.token()}`);
      } else {
        for(this.next();isDigit(this.token());this.next());
      }
    }
    if (this.token() === 'e' || this.token() === 'E') {
      this.next();
      if (this.token() === '+' || this.token() === '-') {
        this.next();
      } else {
        if (!isDigit(this.token())) {
          throw new Error(`unsupport number type near ${this.token()}`);
        } else {
          for(this.next();isDigit(this.token());this.next());
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
    if (this.token() === marker) {
      this.next();
    }
    const type = JSONType.String;
    const start = this.pointer;
    for (;;) {
      if (this.token() === marker) {
        break;
      } else if (this.token() !== '\\') {
        // any codepoint except marker or \ or control characters
        this.next();
        continue;
      } else if (this.token() === '\\') {
        this.next();
        switch(this.token()) {
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
            throw new Error(`unknown string type near slash ${this.token()}`);
        }
      } else {
        throw new Error(`unknown string type near ${this.token()}`);
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
      if (this.token() !== literalValue[i]) {
        throw new Error(`unknow value near ${this.token()}`);
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
    switch(this.token()) {
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
        throw new Error(`unknown type near ${this.token()}`)
    }
  }
}
