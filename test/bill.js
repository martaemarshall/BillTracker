let assert = require('assert');
let chai = require('chai');
let chaiHttp = require('chai-http');
let serverAndSchema = require('../index');
let server = serverAndSchema.app
let Bill = serverAndSchema.schema
let should = chai.should();
chai.use(chaiHttp);

describe('Bills', function() {
  describe('/GET bill', function() {

    it('should get the specified bill', function(done) {
      let expectedBill = new Bill({
        type: "Test Type",
        dueDate: "2018-12-3",
        company: "Test Company",
        amtDue: "100",
        paidStatus: "Test Status"
      })

      expectedBill.save(function(err, savedBill) {
        chai.request(server)
          .get('/api/bills/'+savedBill.id)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('type').eql(savedBill.type)
            res.body.should.have.property('dueDate').eql(savedBill.dueDate)
            res.body.should.have.property('company').eql(savedBill.company)
            res.body.should.have.property('amtDue').eql(savedBill.amtDue)
            res.body.should.have.property('paidStatus').eql(savedBill.paidStatus)
            res.body.should.have.property('_id').eql(savedBill.id)
            done();
          })
        });
      });
   });
});