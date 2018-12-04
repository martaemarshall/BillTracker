const express = require('express')
const app = express()
const port = 3000

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/bill');
var MongoClient = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))
app.set('view engine', 'pug')
app.set('views', __dirname + '/views');

var billSchema = new mongoose.Schema(
{
    type: { type: String, required: true },
    dueDate: { type: Date, required: true },
    company: { type: String, required: true },
    amtDue: { type: Number, required: true },
    paidStatus: { type: String, required: true }
});

var bill = mongoose.model('bill', billSchema);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function()
{
    app.get('/', (req, res) =>
    {
        bill.find({}, function(err, bills)
        {
          if (err)
          {
            console.log(err)
            res.render('error', {})
          }
          else
          {
            res.render('index', { bills: bills })
          }
        });
      });

      app.get('/bills/new', (req, res) =>
      {
        res.render('bill-form', { title: "New bill", bill: {} })
      });

    app.get('/bills/:id/update', (req, res) =>
    {
        let id = ObjectID.createFromHexString(req.params.id)

        bill.findById(id, function(err, bill)
        {
          if (err)
          {
            console.log(err)
            res.render('error', {})
          }
          else
          {
            if (bill === null) {
              res.render('error', { message: "Not found" })
            } else {
              res.render('bill-form', { title: "Update bill", bill: bill })
            }
          }
        });
    });

    app.post('/bills/new', function(req, res, next) {
        let newbill = new bill(req.body);
        newbill.save(function(err, savedbill)
        {
          if (err)
          {
            console.log(err)
            res.render('bill-form', { bill: newbill, error: err })
          }
          else
          {
            res.redirect('/bills/' + savedbill.id);
          }
        });
    });
    app.get('/bills/:id', (req, res) =>
    {
        let id = ObjectID.createFromHexString(req.params.id)

        bill.findById(id, function(err, bill)
        {
          if (err)
          {
            console.log(err)
            res.render('error', {})
          }
          else
          {
            if (bill === null)
            {
              res.render('error', { message: "Not found" })
            }
            else
            {
              res.render('bill-detail', { bill: bill})
            }
          }
        });
    });

    app.post('/bills/:id/update', (req, res, next) =>
    {
        let id = ObjectID.createFromHexString(req.params.id)
        bill.updateOne({"_id": id}, { $set: req.body }, function(err, details)
        {
            if(err)
            {
                console.log(err)
                res.render('error', {})
            }
            else
            {
                res.redirect('/bills/' + id)
            }
        });
    });

    app.post('/bills/:id/pay', (req, res, next) =>
    {
        let id = ObjectID.createFromHexString(req.params.id)
        bill.updateOne({"_id": id}, { $set: { "paidStatus": "paid" } }, function(err, details)
        {
            if(err)
            {
                console.log(err)
                res.render('error', {})
            }
            else
            {
                res.redirect('/bills/' + id)
            }
        });
    });

    app.post('/bills/:id/delete', (req, res) =>
    {
        let id = ObjectID.createFromHexString(req.params.id)
        bill.deleteOne({_id: id}, function(err, product)
        {
            res.redirect("/")
        });
    });

    app.post('/api/bills', (req, res) =>
    {
        let newbill = new bill(req.body)

        newbill.save(function (err, savedbill)
        {
            if (err)
            {
                console.log(err)
                res.status(500).send("There was an internal error")
            }
            else
            {
                res.send(savedbill)
            }
        });
    });

    app.post('/api/bills', (req, res) =>
    {
        bill.find({}, function(err, bills)
        {
            if(err)
            {
                console.log(err)
                res.status(500).send("Internal server error")
            }
            else
            {
                res.send(bills)
            }
        });
    });

    app.get('/api/bills', (req, res) =>
    {
        bill.find({}, function(err, bills)
        {
            if(err)
            {
                console.log(err)
                res.status(500).send("Internal server error")
            }
            else
            {
                res.send(bills)
            }
        });
    });

    app.get('/api/bills/:id', (req, res) =>
    {
        let id = ObjectID.createFromHexString(req.params.id)

        bill.findById(id, function(err, bill)
        {
            if (err)
            {
                console.log(err)
                res.status(500).send("Internal server error")
            }
            else
            {
                if (bill === null)
                {
                    res.status(404).send("Not found")
                }
                else
                {
                    res.send(bill)
                }
            }
        });
      });

    app.put('/api/bills/:id', (req, res) =>
    {
        let id = ObjectID.createFromHexString(req.params.id)

        bill.updateOne({"_id": id}, { $set: req.body }, function(err, details)
        {
            if (err)
            {
                console.log(err)
                res.status(500).send("Internal server error")
            }
            else
            {
                res.status(204).send()
            }
        });
      });

    app.delete('/api/bills/:id', (req, res) =>
    {
        let id = ObjectID.createFromHexString(req.params.id)

        Review.deleteOne({"_id": id}, function(err)
        {
          if (err)
          {
            console.log(err)
            res.status(500).send("Internal server error")
          }
          else
          {
            res.status(204).send()
          }
        });
    });
});



app.listen(port, () => console.log(`Example app listening on port ${port}!`))
module.exports.app = app;
module.exports.schema = bill;
