'use strict';

const Hapi      = require('hapi');
const Good      = require('good');
const server    = new Hapi.Server();
const analytics = require('./server/analyticsModule');

server.connection({port: 3000});

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
