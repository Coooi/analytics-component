'use strict';

const request   = require('request');
const cheerio   = require('cheerio');
const Hapi      = require('hapi');
const Good      = require('good');
const server    = new Hapi.Server();
const URL       = require('url');
const _         = require('lodash');

server.connection({port: 3000});

server.register(require('inert'), (err) => {

    if (err) {
        throw err;
    }

    server.route({
        method: 'GET',
        path: '/',
        handler: (request, reply) => {
            reply.file('./public/index.html');
        }
    });
});

server.route({
    method: 'GET',
    path: '/analytics/{url}',
    handler: (req, reply) => {

        let url = req.params.url,
            errorResponse = {};

        url = URL.parse(url, true).href;

        if (url.indexOf('http:') === -1 ) {
            url = `http://${url}`;
        }

        request(url, (error, response, html) => {

            if (error) {
                errorResponse.message = `Invalid website URL: ${url}`;
                errorResponse.code = 500;
                server.log('info', errorResponse.message);
                reply(errorResponse).code(500);
                return;
            }

            if(!error){
                const $ = cheerio.load(html);
                const DOMAIN_REGEX = /(https?:)?\/\/((?:[\w\d]+\.)+[\w\d]{2,})/i;
                let analytics = {};


                let isExternalLink = (href) => {
                    let matches = DOMAIN_REGEX.exec(href);
                    return matches ? matches.length > 0 : false;
                };

                let countExternalLinks = (hrefs) => {
                    let links = {};

                    links.external = 0;
                    links.internal = 0;
                    links.inaccessible = 0;

                    _.forEach(hrefs, (href) => {
                        if (isExternalLink(href)) {
                            links.external++;
                        } else {
                            links.internal++;
                        }
                    });

                    return links;
                };

                $('html').filter(function() {
                    let data = $(this),
                        allHREFs = data.find('a').map((i,el) => { return $(el).attr('href'); });

                    analytics.htmlVersion = 'HTML5';
                    analytics.title = data.find('title').text();
                    analytics.headings = data.find(':header').length;
                    analytics.links = countExternalLinks(allHREFs);
                    analytics.loginForm = data.find('form input[type="password"]').length > 0;
                    reply(analytics).code(200);
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
        server.log('info', `Server running at: ${server.info.uri}`);
    });
});
