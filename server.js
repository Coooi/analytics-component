'use strict';

const Hapi      = require('hapi');
const Good      = require('good');
const server    = new Hapi.Server();
const analytics = require('./server/analyticsModule');
const mongojs   = require('mongojs');

const PORT = process.env.PORT || 3000;

server.connection({port: PORT});

//DB Connection
const DB_URI =
    process.env.MONGODB_URI ||
    process.env.MONGOHQ_URL ||
    'mongodb://localhost/analyticsdb';

server.app.db = mongojs(DB_URI, ['history']);

server.app.db.on('error', function() {
    server.log('error', 'Connection to the database has failed. Please make sure you have mongo running.');
});
server.app.db.on('timeout', function (err) {
    server.log('error', 'Database connection has timed out.');
});

server.register(require('inert'), (err) => {

    if (err) {
        throw err;
    }

    server.route({
        method: 'GET',
        path: '/',
        handler: (req, reply) => {
            reply.file('./public/index.html');
        }
    });
});

//analyticsRoute
server.route({
    method: 'GET',
    path: '/analytics/{url}',
    handler: (req, reply) => {
        analytics.initAnalytics(server, req, reply);
    }
});

//analyticsRoute
server.route({
    method: 'GET',
    path: '/analytics/poll/{url}',
    handler: (req, reply) => {
        analytics.getUpdatedAnalytics(server, req, reply);
    }
});

//Static Content
server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: './public'
        }
    }
});

server.register({
    register: Good,
    options: {
        reporters: {
            console: [{
                module: 'good-squeeze',
                name: 'Squeeze',
                args: [{
                    response: '*',
                    log: '*'
                }]
            }, {
                module: 'good-console'
            }, 'stdout']
        }
    }
}, (err) => {

    if (err) {
        throw err;
    }

    server.start((err) => {
        if (err) {
            throw err;
        }
        server.log('info', `Server running at: ${server.info.uri}`);
    });
});
