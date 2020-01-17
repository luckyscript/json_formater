export function skipWhitespace(json: string, pointer: number) {
  let current = json[pointer];
  while(
    current === ' ' ||
    current === '\t'||
    current === '\n'||
    current === '\r'
  ) {
    pointer++;
    current = json[pointer];
  }
  return pointer;
}
export function skipWhitespaceBack(json: string, pointer: number) {
  let current = json[pointer];
  while(
    current === ' ' ||
    current === '\t'||
    current === '\n'||
    current === '\r'
  ) {
    pointer--;
    current = json[pointer];
  }
  return pointer;
}

export function isNumberHead(char: string) {
  return isDigit(char) || char === '-';
}

export function isDigit(v: string) {
  return v <= '9' && v >= '0';
};
export function isDigit1to9(v: string) {
  return v <= '9' && v >= '1';
};