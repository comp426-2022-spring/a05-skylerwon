const fs = require('fs')
const morgan = require('morgan')
const express = require('express');
const app = express();

const argv = require('minimist')(process.argv.slice(2))
argv['port']
const port = argv['port'] || process.env.PORT || 5000

const logdb = require('./database');

const server = app.listen(port, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%', port))
});

if (argv.help || argv.h) {
    console.log(`
    server.js [options]

    --port	Set the port number for the server to listen on. Must be an integer
            between 1 and 65535.

    --debug	If set to true, creates endlpoints /app/log/access/ which returns
            a JSON access log from the database and /app/error which throws 
            an error with the message "Error test successful." Defaults to 
            false.

    --log		If set to false, no log files are written. Defaults to true.
            Logs are always written to database.

    --help	Return this message and exit.
    `)
    process.exit(0)
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

if(argv.log == 'false') {
    console.log("nothing");
} else {
    const accesslog = fs.createWriteStream('access.log', {flags: 'a'})
    app.use(morgan('merged', { stream: accesslog }))
}

app.use((req, res, next) => {
    let logdata = {
        remoteaddr: req.ip,
        remoteuser: req.user,
        time: Date.now(),
        method: req.method,
        url: req.url,
        protocol: req.protocol,
        httpversion: req.httpVersion,
        status: res.statusCode,
        referer: req.headers['referer'],
        useragent: req.headers['user-agent']
    };
    const stmt = logdb.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referrer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    const info = stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url, logdata.protocol, logdata.httpversion, logdata.status, logdata.reff, logdata.useragent)
    next();
})

if (argv.debug || argv.d) {
    app.get('/app/log/access/', (req, res, next) => {
        const stmt = logdb.prepare("SELECT * FROM accesslog").all();
            res.status(200).json(stmt);
    })
    app.get('/app/error/', (req, res, next) => {
        throw new Error('Error')
    })
}

app.get('/app/', (req, res) => {
    res.statusCode = 200;
    res.statusMessage = 'OK';
    res.writeHead(res.statusCode, { 'Content-Type': 'text/plain' });
    res.end(res.statusCode + ' ' + res.statusMessage)
});

app.get('/app/flips/:number', (req, res) => {
    res.statusCode = 200;
    const flips = req.params.number;
    res.json({'raw': coinFlips(flips), 'summary': countFlips(flips)});
});

app.get('/app/flip/', (req, res) => {
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

app.use(function (req, res) {
    res.status(404).send('404 NOT FOUND');
});

