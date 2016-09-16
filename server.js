'use strict';

const path = require('path');
const request = require('request');
const cheerio = require('cheerio');
const Hapi = require('hapi');
const Good = require('good');
const server = new Hapi.Server();

server.connection({port: 3000});

server.register(require('inert'), (err) => {

    if (err) {
        throw err;
    }

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {
            reply.file('./public/index.html');
        }
    });
});

server.route({
    method: 'GET',
    path: '/analytics/{url}',
    handler: function (req, reply) {

        var URL = req.params.url;

        if (URL.indexOf('http:') === -1 ) {
            URL = 'http://' + URL;
        }

        request(URL, function(error, response, html){

            if (error) {
                server.log(error);
                reply(`Error while fetch the url: ${URL}`).code(500);
                return;
            }

            if(!error){
                const $ = cheerio.load(html);
                let analytics = {};

                $('head').filter(function() {
                    var data = $(this);
                    analytics.title = data.find("title").text();
                    reply(analytics.title).code(200);
                });
            }
        })


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
        server.log('info', 'Server running at: ' + server.info.uri);
    });
});
