const fs = require('fs')
const morgan = require('morgan')
const express = require('express');
const app = express();

const argv = require('minimist')(process.argv.slice(2))
argv['port']
const port = argv['port'] || process.env.PORT || 5000

const logdb = require('./src/services/database.js');

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
app.use(express.static('./public'))

if(argv.log == 'false') {
    console.log("nothing");
} else {
    const logdir = './log/';

    if (!fs.existsSync(logdir)){
        fs.mkdirSync(logdir);
    }
    const accesslog = fs.createWriteStream(logdir+'access.log', {flags: 'a'})
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
    res.json({"message":"Your API works! (200)"});
	res.status(200);
});

app.get('/app/flip/:number', (req, res, next) => {
    res.statusCode = 200;
    const flips = coinFlips(req.params.number);
    const count = countFlips(flips);
    res.json({'raw': flips, 'summary': count});
});

app.post('/app/flip/coins/', (req, res, next) => {
    res.statusCode = 200;
    const flips = coinFlips(req.body.number);
    const count = countFlips(flips);
    res.json({'raw':flips,'summary':count});
});

app.get('/app/flip/', (req, res) => {
    res.statusCode = 200;
    res.json({"flip": coinFlip()});
});

app.post('/app/flip/call/', (req, res, next) => {
    res.statusCode = 200;
    const game = flipACoin(req.body.guess)
    res.json(game)
})

app.get('/app/flip/call/:guess(heads|tails)', (req, res) => {
    res.statusCode = 200;
    const guess = flipACoin(req.params.guess);
    res.json(guess);
});

app.use(function (req, res) {
    res.status(404).send('404 NOT FOUND');
});

process.on('SIGINT', () => {
    server.close(() => {
		console.log('\nApp stopped.');
	});
});

function countFlips(array) {
    var heads = 0;
    var tails = 0;
    if (array.length == 1) {
        if (array[0] == "heads") {
            return "{ heads: " + 1 + " }";
        }
        if (array[0] == "tails") {
            return "{ tails: " + 1 + " }";
        }
    }
    for (let i = 0; i < array.length; i++) {
        if (array[i] == "heads") {
            heads += 1;
        } else {
            tails += 1;
        }
    }
    return {"heads": heads, "tails": tails };
}

function flipACoin(call) {
    var result = "";
    var flip = "";
    flip = coinFlip();
    if (call == flip) {
        result = "win";
    } else {
        result = "lose"
    }
    return {"call": call, "flip": flip, "result": result };
}

function coinFlips(flips) {
    if (flips == null) {
        return coinFlip();
    }
    var arr = [];
    for (let i = 0; i < flips; i++) {
        arr[i] = coinFlip()
    }
    return arr;
}
function coinFlip() {
    var coin = Math.floor(Math.random() * 2)
    if (coin == 0) {
        return "heads"
    }
    if (coin == 1) {
        return "tails"
    }
    return "oops";
}      