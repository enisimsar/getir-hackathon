'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
mongoose.connect('mongodb://dbUser:dbPassword@ds155428.mlab.com:55428/getir-bitaksi-hackathon');

const Record = mongoose.model('records', {
    key: String,
    value: String,
    createdAt: Date,
    counts: [Number]
});

const app = express();
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded

app.get('/', function (req, res) {
    res.send("Hello World");
});

app.post('/searchRecord', function (req, res) {
    Record.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: new Date(req.body.startDate),
                    $lte: new Date(req.body.endDate)
                }
            }
        },
        {
            $project: {
                key: "$key",
                createdAt: "$createdAt",
                totalCount: {$sum: "$counts"},
                _id: 0
            }
        },
        {
            $match: {
                totalCount: {
                    $gte: req.body.minCount,
                    $lte: req.body.maxCount
                }
            }
        }
    ],function(err,data){
        if(err)
            res.json({
                code: -1,
                msg: err
            });
        res.json({
            code: 0,
            msg: "Success",
            records: data
        });
    });
});

app.listen(3000);