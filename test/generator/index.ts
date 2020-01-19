import { expect } from 'chai';
import { JSONType } from '../../src/type';
import Generator from '../../src/generator';
// import 'mocha';
describe("array", function() {
  it("should return array value correctly", function(done) {
    const generator = new Generator({
      value:"[{\"a\":\"b\", \"c\": \"d\"}]",
      type:JSONType.Array,
      children:[
        {
          "key":0,
          "value":"{\"a\":\"b\", \"c\": \"d\"}",
          "type":JSONType.Object,
          "children":[
            {
              "key":"a",
              "value":"b",
              "type":JSONType.String,
              "length":1
            },{
              "key":"c",
              "value":"d",
              "type":JSONType.String,
              "length":1
            }
          ],
          "length":19
        }
      ],
      "length":21
    }, {});
    done();
  });
});