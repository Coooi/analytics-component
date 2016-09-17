const request   = require('request');
const URL       = require('url');
const _         = require('lodash');
const rp        = require('request-promise');
const cheerio   = require('cheerio');

let initAnalytics = (server, req, reply) => {

    let url = req.params.url,
        errorResponse = {};

    if (url.indexOf('http:') === -1) {
        url = `http://${url}`;
    }

    const parsed_url = URL.parse(url, true);
    const url_href = parsed_url.href;
    const url_hostname = parsed_url.hostname;


    request({
        uri: url_href,
        timeout: 30000,
        followRedirect: true,
        maxRedirects: 30
    }, (error, response, html) => {

        if (error) {
            if (error.code === 'ETIMEDOUT') {
                errorResponse.message = `The URL ${url_href} timed out, please try again later.`;
                errorResponse.code = 504;
            } else {
                errorResponse.message = `Invalid website URL: ${url_href}.`;
                errorResponse.code = 404;
            }
            server.log('error', errorResponse.message);
            reply(errorResponse).code(errorResponse.code);
        }

        if (!error) {
            const $ = cheerio.load(html),
                EXTERNAL_LINK_REGEX = /(https?:)?\/\/((?:[\w\d]+\.)+[\w\d]{2,})/,
                INTERNAL_LINK_REGEX = /^(\/[\w]*)*/;
            let analytics = {},
                links = {},
                linksToBeVerified = 0;

            let successResponse = () => {
                reply(analytics).code(200);
            };

            let verifyAccessibility = (href) => {
                let testUrl = url_href;
                let matches = INTERNAL_LINK_REGEX.exec(href);
                if (matches && matches[0] && matches[0].startsWith('/')) {
                    testUrl += href.substring(1, href.length);
                } else {
                    testUrl = href;
                }
                const options = {
                    uri: testUrl,
                    timeout: 20000,
                    followRedirect: true,
                    maxRedirects: 20
                };

                rp(options)
                    .then(function () {
                        linksToBeVerified--;
                        links.accessible++;
                        server.log('info', `Links left: ${linksToBeVerified}. Verifying URL: ${href}`);
                        if (linksToBeVerified === 0) {
                            analytics.links = links;
                            successResponse();
                        }
                    })
                    .catch(function () {
                        linksToBeVerified--;
                        links.inaccessible++;
                        server.log('info', `Links left: ${linksToBeVerified}. Verifying URL: ${testUrl}`);
                        if (linksToBeVerified === 0) {
                            analytics.links = links;
                            successResponse();
                        }
                    });
            };

            let isInternalLink = (href) => {
                let matches = INTERNAL_LINK_REGEX.exec(href);
                let isInternalLink = false;
                if (href.indexOf(url_hostname) > 0 || (matches && matches[0]) || href.startsWith('#')) {
                    isInternalLink = true;
                }

                return isInternalLink;
            };

            let isExternalLink = (href) => {
                let matches = EXTERNAL_LINK_REGEX.exec(href);
                let isExternalLink = false;
                if (matches && matches.length > 0) {
                    isExternalLink = true;
                }

                return isExternalLink;
            };

            let validateLinks = (hrefs) => {
                linksToBeVerified = _.size(hrefs);
                links.external = 0;
                links.internal = 0;
                links.accessible = 0;
                links.inaccessible = 0;

                _.forEach(hrefs, (href) => {
                    console.log(`HREF=${href}`);
                    if (href && isInternalLink(href) || href==='') {
                        links.internal++;
                    } else if (isExternalLink(href)) {
                        links.external++;
                    }
                    verifyAccessibility(href);
                });

                return links;
            };

            let countHeadings = (node) => {
                const headings = {};

                headings.count = node.find(':header').length;
                headings.h1 = node.find('h1').length;
                headings.h2 = node.find('h2').length;
                headings.h3 = node.find('h3').length;
                headings.h4 = node.find('h4').length;
                headings.h5 = node.find('h5').length;
                headings.h6 = node.find('h6').length;

                return headings;
            };

            $('html').filter(function () {
                let data = $(this),
                    allHREFs = data.find('a').map((i, el) => {
                        return $(el).attr('href');
                    });

                analytics.htmlVersion = 'HTML5';
                analytics.title = data.find('title').text();
                analytics.headings = countHeadings(data);
                analytics.loginForm = data.find('form input[type="password"]').length > 0;
                validateLinks(allHREFs);
            });
        }
    })
};
module.exports = {
    initAnalytics: initAnalytics
};