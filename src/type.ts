export enum JSONType {
  Object = 'Object',
  Number = 'Number',
  Array = 'Array',
  Null = 'Null',
  Boolean = 'Boolean',
  String = 'String',
}
export interface Ast {
  type: JSONType;
  value: any;
  length: number;
  children?: Array<AstTree>;
}

export interface AstTree {
  key: string|number;
  value: any;
  comment?: string;
  length: number;
  children?: Array<AstTree>;
  type: JSONType;
}

// TODO: Tokens管理起来
export enum Tokens {
  LeftBrace = '{',
  RightBrace = '}',
}