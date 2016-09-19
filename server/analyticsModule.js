const Request       = require('request');
const URL           = require('url');
const _             = require('lodash');
const RP            = require('request-promise');
const Cheerio       = require('cheerio');

let getUpdatedAnalytics = (server,req,reply) => {

    let url = req.params.url,
        errorResponse = {};

    if (url.indexOf('http:') === -1) {
        url = `http://${url}`;
    }

    const db = server.app.db;
    const parsed_url = URL.parse(url, true);
    const url_href = parsed_url.href;

    db.history.findOne({
        url: url_href
    }, (err, result) => {
        if (err || !result) {
            errorResponse.message = `Invalid website URL: ${url_href}.`;
            errorResponse.code = 404;
            server.log('error', errorResponse.message);
            return reply(errorResponse).code(errorResponse.code);
        } else {
            return reply(result).code(200);
        }
    });

};

let initAnalytics = (server, req, reply) => {

    let url = req.params.url,
        errorResponse = {};

    if (url.indexOf('http:') === -1) {
        url = `http://${url}`;
    }

    const db = server.app.db;
    const parsed_url = URL.parse(url, true);
    const url_href = parsed_url.href;
    const url_hostname = parsed_url.hostname;


    db.history.findOne({
        url: url_href
    }, (err, result) => {
        if (err || !result) {
            server.log('info', `No history of ${url_href} on the database.`);
            performNewAnalysis();
        } else {
            return reply(result).code(200);
        }
    });

    function performNewAnalysis(){
            Request({
                uri: url_href,
                timeout: 20000,
                followRedirect: true,
                maxRedirects: 30
            }, (error, response, html) => {
                let poll_mode = false;

                if (error) {
                    if (error.code === 'ETIMEDOUT') {
                        errorResponse.message = `The URL ${url_href} timed out, please try again later.`;
                        errorResponse.code = 504;
                    } else {
                        errorResponse.message = `Invalid website URL: ${url_href}.`;
                        errorResponse.code = 404;
                    }
                    server.log('error', errorResponse.message);
                    return reply(errorResponse).code(errorResponse.code);
                }

                if (!error) {

                    const $ = Cheerio.load(html),
                        EXTERNAL_LINK_REGEX = /(https?:)?\/\/((?:[\w\d]+\.)+[\w\d]{2,})/,
                        INTERNAL_LINK_REGEX = /^(\/[\w]*)*/;

                    let analytics = {},
                        links = {},
                        currentLinkIndex = 0,
                        websiteLinks = [],
                        LINKS_LENGTH = 0,
                        linksToBeVerified = 0,
                        uniqueRequest = true;

                    let respond = () => {
                        return reply(analytics).code(200);
                    };

                    function updateHistory() {
                        analytics.links = links;
                        analytics.created_at = (new Date()).getTime();
                        if (currentLinkIndex === (LINKS_LENGTH-1)) {
                            analytics.status = 'complete';
                        }
                        if (db && db.history) {
                            db.history.findAndModify({
                                query: { url: analytics.url },
                                update: { $set: {
                                    links: analytics.links,
                                    status: analytics.status,
                                    created_at: analytics.created_at}
                                },
                                new: true
                            }, function (err, doc, lastErrorObject) {
                                if (!err && currentLinkIndex < (LINKS_LENGTH-1)) {
                                    verifyAccessibility();
                                } else {
                                    server.log('info', `Analytics complete for: ${analytics.url}.`);
                                }
                            });
                        }
                    }

                    function saveFirstHistory(beginPolls) {
                        analytics.links = links;
                        analytics.created_at = (new Date()).getTime();
                        analytics.status = 'pending';
                        if (db && db.history) {
                            db.history.save(analytics, (err, result) => {
                                if (err) {
                                    server.log('error', 'Something went wrong while saving analytics to the database.');
                                } else {
                                    server.log('info', `${analytics.url} has been successfully persisted to the database.`);
                                }
                                beginPolls();
                            });
                        }
                    }

                    function isInternalLink(href) {
                        let matches = INTERNAL_LINK_REGEX.exec(href);
                        let isInternalLink = false;
                        if (href.indexOf(url_hostname) > 0 || (matches && matches[0]) || href.startsWith('#')) {
                            isInternalLink = true;
                        }

                        return isInternalLink;
                    }

                    function isExternalLink(href) {
                        let matches = EXTERNAL_LINK_REGEX.exec(href);
                        let isExternalLink = false;
                        if (matches && matches.length > 0) {
                            isExternalLink = true;
                        }

                        return isExternalLink;
                    }

                    function verifyAccessibility() {
                        let testUrl = url_href;
                        let href = websiteLinks[currentLinkIndex];
                        let matches = INTERNAL_LINK_REGEX.exec(href);
                        if (matches && matches[0] && matches[0].startsWith('/')) {
                            testUrl += href.substring(1, href.length);
                        } else {
                            testUrl = href;
                        }
                        linksToBeVerified--;
                        server.log('info', `Links left: ${linksToBeVerified}. Verifying URL: ${websiteLinks[currentLinkIndex]}`);
                        const options = {
                            uri: testUrl,
                            timeout: 20000,
                            followRedirect: true,
                            maxRedirects: 15
                        };

                        if (href && isInternalLink(href) || href==='') {
                            links.internal++;
                        } else if (isExternalLink(href)) {
                            links.external++;
                        }
                        links.verified = currentLinkIndex+1;
                        RP(options)
                            .then(function () {
                                validURLCallback();
                            })
                            .catch(function () {
                                invalidURLCallback();
                            });
                    }

                    function validURLCallback() {
                        links.accessible++;
                        checkNextLink();
                    }

                    function invalidURLCallback() {
                        links.inaccessible++;
                        checkNextLink();
                    }


                    function validateLinks() {
                        linksToBeVerified = _.size(websiteLinks);
                        LINKS_LENGTH = linksToBeVerified;
                        links.external = 0;
                        links.internal = 0;
                        links.accessible = 0;
                        links.inaccessible = 0;
                        links.verified = 0;
                        links.total = LINKS_LENGTH;

                        if (linksToBeVerified > 0) {
                            verifyAccessibility();
                        } else {
                            analytics.links = links;
                            analytics.status = 'complete';
                            analytics.created_at = (new Date()).getTime();
                            return respond();
                        }
                    }

                    function countHeadings(node) {
                        const headings = {};

                        headings.count = node.find(':header').length;
                        headings.h1 = node.find('h1').length;
                        headings.h2 = node.find('h2').length;
                        headings.h3 = node.find('h3').length;
                        headings.h4 = node.find('h4').length;
                        headings.h5 = node.find('h5').length;
                        headings.h6 = node.find('h6').length;

                        return headings;
                    }

                    function checkNextLink() {
                        currentLinkIndex++;
                        if (poll_mode) {
                            updateHistory();
                        } else {
                            analytics.status = (currentLinkIndex < LINKS_LENGTH) ? 'pending': 'complete';
                            saveFirstHistory(()=>{
                                server.log('info', `First analytics recorded for: ${websiteLinks[currentLinkIndex]}`);
                                respond();
                                if (currentLinkIndex < LINKS_LENGTH) {
                                    poll_mode = true;
                                    verifyAccessibility();
                                }
                            });
                        }
                    }

                    analytics.htmlVersion = 'HTML4';
                    $('<!DOCTYPE html>').filter(function () {
                        analytics.htmlVersion = 'HTML5';
                    });
                    $('html').filter(function () {
                        if (uniqueRequest) {
                            uniqueRequest = false;
                            let data = $(this);
                            websiteLinks = data.find('a').map((i, el) => {
                                return $(el).attr('href');
                            });

                            analytics.url = url_href;
                            analytics.title = data.find('title').text();
                            analytics.headings = countHeadings(data);
                            analytics.loginForm = data.find('form input[type="password"]').length > 0;
                            validateLinks();
                        }
                    });
                }
            });
    }
};
module.exports = {
    initAnalytics: initAnalytics,
    getUpdatedAnalytics: getUpdatedAnalytics
};