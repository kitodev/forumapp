// TODO add tests

var fs            = require('fs');
var express       = require('express');
var bodyParser    = require('body-parser');
var project       = null;
var app           = express();
var router        = express.Router();

const port        = 8888;
const fileCharset = 'utf8';
const data        = {};
const projects    = {
    forum: './src/forum/forum.js',
    shop: './src/shop/shop.js',
    surveyBuilder: './src/survey-builder/surveyBuilder.js',
    userTable: './src/user-table/userTable.js'
};

router.get('/', handle(function() {
    console.log(router);
    return response({
        message: 'It works, yay!',
        data: data
    });
}));

function allowCORS(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
}

function buildPaths() {
    project.paths.forEach(function(path) {
        router.route(path.path)[path.method.toLowerCase()](handle(path.handle));
        console.log(path.method + ' '.repeat(10 - path.method.length) + path.path + ' - ' + path.description);
    });
}

function fileRead(path, callback) {
    fs.readFile(path, fileCharset, function(e, d) {
        if (e) { throw e; }
        callback(JSON.parse(d));
    });
}

function handle(callback) {
    return function(req, res) {
        if (req.hasOwnProperty('method') && req.hasOwnProperty('originalUrl')) {
            console.log('\nRequest:');
            console.log('[' + req.method + '] - ' + req.originalUrl);
        }
        var responseObject;
        try {
            responseObject = response(callback(data, req, res));
        } catch (ex) {
            responseObject = response({
                status: 404,
                message: ex
            });
        }
        if (responseObject.hasOwnProperty('data')) {
            console.log('\nResponse:');
            console.log(responseObject.data);
        }
        res.json(responseObject.status, responseObject);
    };
}

function init(sources) {
    Object.keys(sources).forEach(function(key) {
        fileRead(sources[key], function(json) {
            data[key] = json;
        });
    });
}

function response(obj) {
    return {
        status: obj.status || 200,
        message: obj.message || 'OK',
        data: obj.data || {}
    };
}

function welcomeMessage() {
    fileRead('./src/welcome-message.json', function(d) {
        console.log('\n');
        d.message.forEach(function(text) {
            console.log(text);
        });
    });
}

// START
(function() {
    const projectPath = projects.hasOwnProperty(process.argv[2]) ? process.argv[2] : 'forum';
    project = require(projects[projectPath]);
    welcomeMessage();
    init(project.sources);
    buildPaths();

    app.use('/api', bodyParser.urlencoded({extended: true}));
    app.use('/api', bodyParser.json());
    app.use('/api', allowCORS);
    app.use('/api', router);
    app.listen(port);
})();
