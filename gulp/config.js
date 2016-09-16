module.exports = {
    serverInit: 'server/server.js',
    serverPath: 'server',
    sassPath: 'app/sass/app.scss',
    serverJsPath: 'server/**/*.js',
    htmlPath: '**/*.html',
    distFolder: 'server/public',
    indexPath: 'index.html',
    viewFolder: 'server/public/views',
    imgPath: 'app/img/*.*',
    serverTestFiles: 'test/server/**/*.js',
    apiTestFiles: 'test/apiTest/**/*.js',
    devScripts: 'app/js/**/*.js',
    vendorMapScripts: 'bower_components/angular/angular.min.js.map',
    vendorScripts: [
        'bower_components/angular/angular.min.js',
        'bower_components/angular-animate/angular-animate.min.js',
        'node_modules/lodash/lodash.min.js'
    ],
    distCSS: 'public/css/'
};
