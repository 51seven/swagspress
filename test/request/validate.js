var should = require('should');
var request = require('supertest');

var app = require('../app');

describe('Making requests', function() {
  describe('should fail', function() {
    describe('with mimetype', function() {
      it('global setted', function(done) {
        request(app)
          .post('/api/pets')
          .set('Content-Type', 'multipart/form-data')
          .expect(406, done);
      });
      it('specific setted', function(done) {
        request(app)
          .delete('/api/pets/5')
          .set('Content-Type', 'application/json')
          .expect(406, done);
      });
    });
    describe('with parameter', function() {
      it('which is required', function(done) {
        request(app)
          .post('/api/pets')
          .set('Content-Type', 'application/json')
          .expect(403, done);
      });
    });
  });

  describe('should succeed', function() {
    it('with correct global setted mimetype', function(done) {
      request(app)
        .post('/api/pets')
        .set('Content-Type', 'application/json')
        .expect(200, done);
    });
    it('with correct specific setted mimetype', function(done) {
      request(app)
        .delete('/api/pets/5')
        .set('Content-Type', 'multipart/form-data')
        .expect(200, done);
    });
  });
});