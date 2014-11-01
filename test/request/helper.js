var should = require('should');

var validator = require('../../lib/validator');

describe('Validation helper function', function() {
  describe('parseArray', function() {
    var parsed;
    it('should parse csv', function() {
      parsed = validator.parseArray('a,b,c', 'csv');
      parsed.should.be.instanceOf(Array).and.have.lengthOf(3);
    });
    it('should parse ssv', function() {
      parsed = validator.parseArray('a b c', 'ssv');
      parsed.should.be.instanceOf(Array).and.have.lengthOf(3);
    });
    it('should parse tsv', function() {
      parsed = validator.parseArray('a\tb\tc', 'tsv');
      parsed.should.be.instanceOf(Array).and.have.lengthOf(3);
    });
    it('should parse pipes', function() {
      parsed = validator.parseArray('a|b|c', 'pipes');
      parsed.should.be.instanceOf(Array).and.have.lengthOf(3);
    });
    it('should parse multi', function() {
      parsed = validator.parseArray('a=1&b=2&c=3', 'multi');
      parsed.should.be.instanceOf(Object).and.eql({'a': '1', 'b': '2', 'c': '3'});
    });
  });
  describe('checkUnique', function() {
    var res;
    it('should find unique array', function() {
      res = validator.checkUnique([1,2,3]);
      res.should.be.true;
    });
    it('should find not unique array', function() {
      res = validator.checkUnique([3,4,2,4]);
      res.should.be.false;
    });
  });
});