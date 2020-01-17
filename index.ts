/**
* format irregular json
*/
import JsonFormatter from './src/jsonFormatter';
import Parser from './src/Parser';
const jsonFormatter = new JsonFormatter();
const parser = new Parser('1');
parser.parseNumber();
export default jsonFormatter;
