# README #

* Scout24 Analytics Component.
* Author: Marco Nascimento

### About ###
Responsive designs analytics component built with AngularJS.
Based on an URL typed by the user, the system will read the page an return the analytic results on the screen.
The system will track a history of each search in the mongo database.

### Result Criterias ###
1. HTML Version: If the page has HTML5 doctype tag.
2. Page Title: Text from the <title></title>. 
3. Headings: The sum of all page headings.
4. H1: The number of H1 tags that were found.
5. H2: The number of H2 tags that were found.
6. H3: The number of H3 tags that were found.
7. H4: The number of H4 tags that were found.
8. H5: The number of H5 tags that were found.
9. H6: The number of H6 tags that were found.
10. Internal Links: Links belonging to the website's domain.
11. External Links: Links to different domains.
12. Accessible Links: Working links accessed by the Node server.
13. Inaccessible Links: Unreachable or timed out links.
14. Login form: [Yes / No], depending on whether the page has a login form or not. 


### Working URL ###
https://s24-analytics.herokuapp.com

### Installation ###

* Make sure you have NodeJS and MongoDB installed.
* Go to the project's folder on the terminal.
* Run 
```
npm install
```
* Run 
```
gulp run
```
* The system will run at **localhost:3000**

* The component will be rendered from the following HTML tag:

```
<analytics-component></analytics-component>
```

### Tech stack ###

* AngularJS 1.5.8
* NodeJS ES6 / Hapi.js
* MongoDB / MongoJS
* Cheerio
* HTML
* CSS / SASS/ Bootstrap Grid
* Gulp
* Heroku

### Notes ###

* The timeout of each request is 30 seconds.
* The timeout of each link validation is 20 seconds.
* Every request to the server will happen from 3 to 3 seconds.

### Contact ###

* **Marco Nascimento**
* marco.acrn@gmail.com