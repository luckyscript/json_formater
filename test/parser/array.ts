import { expect } from 'chai';
import Parser from '../../src/parser';
// import 'mocha';
describe("array", function() {
  it("should return array value correctly", function(done) {
    const parser = new Parser('[{"a":"b", "c": "d"}]');
    expect(parser.parseArray()).to.deep.equal(
      {"value":"[{\"a\":\"b\", \"c\": \"d\"}]","type":"Array","children":[{"key":0,"value":"{\"a\":\"b\", \"c\": \"d\"}","type":"Object","children":[{"key":"a","value":"b","type":"String","length":1},{"key":"c","value":"d","type":"String","length":1}],"length":19}],"length":21}
    )
    // console.log(JSON.stringify(parser.parseArray()));
    done();
  });
});