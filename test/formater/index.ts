import { expect } from 'chai';
import { JSONType } from '../../src/type';
import formater from '../../index';
// import 'mocha';
describe("formater", function() {
  it("should return formater  value correctly", function(done) {
    expect(formater.format(`{'a':"b"}`)).to.equal('{"a": "b"}');
    done();
  });
});