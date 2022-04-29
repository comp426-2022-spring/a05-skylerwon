const express = require("express");
const coin = require('../utils/utilities.js')
const routes = express.Router();

routes.route('/app/flips/:number').get(function(req, res,next) {
    res.statusCode = 200;
    const flips = req.body.number;
    res.json({'raw': coinFlips(flips), 'summary': countFlips(flips)});
});

routes.route('/app/flip/').get(function(req, res,next) {
    res.statusCode = 200;
    res.json({"flip": coinFlip()});
});

app.get('/app/flip/call/heads', (req, res) => {
    res.statusCode = 200;
    res.json(flipACoin("heads"));
});

app.get('/app/flip/call/tails', (req, res) => {
    res.statusCode = 200;
    res.json(flipACoin("tails"));
});