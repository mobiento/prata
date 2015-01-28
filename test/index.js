var request = require('supertest')
var assert  = require('assert')
var server  = require('../src/server.js')
var db 		= server.db


describe('Server', function() {

  describe('GET /db', function() {
    it('should respond with json and full database', function(done) {
      request(server)
        .get('/db')
        .expect('Content-Type', /json/)
        .expect(db)
        .expect(200, done)
    })
  })

  describe('GET /:resource', function() {
    it('should respond with json and corresponding resources', function(done) {
      request(server)
        .get('/posts')
        .set('Origin', 'http://example.com')
        .expect('Content-Type', /json/)
        .expect('Access-Control-Allow-Credentials', 'true')
        .expect('Access-Control-Allow-Origin', 'http://example.com')
        .expect(db.posts)
        .expect(200, done)
    })
  })

  describe('GET /:resource?attr=&attr=', function() {
    it('should respond with json and filter resources', function(done) {
      request(server)
        .get('/posts?peoplId=1')
        .expect('Content-Type', /json/)
        .expect([db.posts[0]])
        .expect(200, done)
    })
  })

  describe('GET /:resource?q=', function() {
    it('should respond with json and make a full-text search', function(done) {
      request(server)
        .get('/pets?q=29')
        .expect('Content-Type', /json/)
        .expect([db.pets[0], db.pets[3]])
        .expect(200, done)
    })

    it('should return an empty array when nothing is matched', function(done) {
        request(server)
          .get('/pets?q=nope')
          .expect('Content-Type', /json/)
          .expect([])
          .expect(200, done)
    })
  })

  describe('GET /:resource?_end=', function() {
    it('should respond with a sliced array', function(done) {
      request(server)
        .get('/posts?_end=2')
        .expect('Content-Type', /json/)
        .expect('x-total-count', db.posts.length.toString())
        .expect('Access-Control-Expose-Headers', 'X-Total-Count')
        .expect(db.posts.slice(0, 2))
        .expect(200, done)
    })
  })

  describe('GET /:resource?sort=', function() {
      it('should respond with json and sort on a field', function(done) {
          request(server)
              .get('/pets?_sort=dog')
              .expect('Content-Type', /json/)
              .expect([db.pets[0], db.pets[3]])
              .expect(200, done)
      })

      it('should reverse sorting with _order=DESC', function(done) {
          request(server)
              .get('/pets?_sort=dog&_order=DESC')
              .expect('Content-Type', /json/)
              .expect([db.pets[3], db.pets[0]])
              .expect(200, done)
      })

      it('should sort on numerical field', function(done) {
          request(server)
              .get('/pets?_sort=id&_order=DESC')
              .expect('Content-Type', /json/)
              .expect(db.pets.reverse())
              .expect(200, done)
      })
  })

  describe('GET /:resource?_start=&_end=', function() {
    it('should respond with a sliced array', function(done) {
      request(server)
        .get('/posts?_start=1&_end=2')
        .expect('Content-Type', /json/)
        .expect('x-total-count', db.posts.length.toString())
        .expect('Access-Control-Expose-Headers', 'X-Total-Count')
        .expect(db.posts.slice(1, 2))
        .expect(200, done)
    })
  })

  describe('GET /:parent/:parentId/:resource', function() {
    it('should respond with json and corresponding nested resources', function(done) {
      request(server)
        .get('/people/1/posts')
        .expect('Content-Type', /json/)
        .expect([
          db.posts[0],
          db.posts[3]
        ])
        .expect(200, done)
    })
  })

  describe('GET /:resource/:id', function() {
    it('should respond with json and corresponding resource', function(done) {
      request(server)
        .get('/people/1')
        .expect('Content-Type', /json/)
        .expect(db.people[0])
        .expect(200, done)
    })

    it('should respond with 404 if resource is not found', function(done) {
      request(server)
        .get('/posts/9001')
        .expect('Content-Type', /json/)
        .expect({})
        .expect(404, done)
    })
  })


  describe('POST /:resource', function() {
    it('should respond with json and create a resource', function(done) {
      request(server)
        .post('/posts')
        .send({title: 'foo', booleanValue: 'true', integerValue: '1'})
        .expect('Content-Type', /json/)
        .expect({id: 11, title: 'foo', booleanValue: true, integerValue: 1})
        .expect(200)
        .end(function(err, res){
          if (err) return done(err)
          assert.equal(db.posts.length, 11)
          done()
        })
    })
  })

  describe('PUT /:resource/:id', function() {
    it('should respond with json and update resource', function(done) {
      request(server)
        .put('/posts/1')
        .send({id: 1, body: 'bar', booleanValue: 'true', integerValue: '1'})
        .expect('Content-Type', /json/)
        .expect({id: 1, body: 'bar', booleanValue: true, integerValue: 1})
        .expect(200)
        .end(function(err, res){
          if (err) return done(err)
          // assert it was created in database too
          assert.deepEqual(db.posts[0], {id: 1, body: 'bar', booleanValue: true, integerValue: 1})
          done()
        })
    })

    it('should respond with 404 if resource is not found', function(done) {
      request(server)
        .put('/posts/9001')
        .send({id: 1, body: 'bar', booleanValue: 'true', integerValue: '1'})
        .expect('Content-Type', /json/)
        .expect({})
        .expect(404, done)
    })
  })

  describe('PATCH /:resource/:id', function() {
    it('should respond with json and update resource', function(done) {
      request(server)
        .patch('/posts/1')
        .send({body: 'bar'})
        .expect('Content-Type', /json/)
        .expect({id: 1, body: 'bar'})
        .expect(200)
        .end(function(err, res){
          if (err) return done(err)
          // assert it was created in database too
          assert.deepEqual(db.posts[0], {id: 1, body: 'bar'})
          done()
        })
    })

    it('should respond with 404 if resource is not found', function(done) {
      request(server)
        .patch('/posts/9001')
        .send({body: 'bar'})
        .expect('Content-Type', /json/)
        .expect({})
        .expect(404, done)
    })
  })

  describe('DELETE /:resource/:id', function() {
    it('should respond with empty data, destroy resource and dependent resources', function(done) {
      request(server)
        .del('/posts/1')
        .expect(204)
        .end(function(err, res){
          if (err) return done(err)
          assert.equal(db.posts.length, 1)
          assert.equal(db.comments.length, 3)
          done()
        })
    })
  })

  describe('Static routes', function() {

    describe('GET /', function() {
      it('should respond with html', function(done) {
        request(server)
          .get('/')
          .expect(/You're successfully running JSON Server/)
          .expect(200, done);
      });
    });

    describe('GET /stylesheets/style.css', function() {
      it('should respond with css', function(done) {
        request(server)
          .get('/stylesheets/style.css')
          .expect('Content-Type', /css/)
          .expect(200, done);
      });
    });

  })
})
