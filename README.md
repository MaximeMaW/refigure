[NodeJS]: https://nodejs.org/

Refigure
============

 ReFigure is a <a href="https://chrome.google.com/webstore/detail/refigure/plbplbglohkmicpcelhkendkdfaipome">Chrome extension</a> that allows users to click on open access figures (images) in scientific pages and create a curated collection published on <a href="https://refigure.org">ReFigure.org</a>. The extension also collects metadata associated with the figure such author, DOI to enhance the curated collection. 




Project Tree Structure
============

    build/
    bower_components/
    node_modules/
    back/
    ----index.js
    front/
    ----index.html
    tasks/
    ----gulptask.js
    test/
    ----e2e/
    ----unit/
    gulpfile.js
    package.json
    README.md

Installation
============

Install [NodeJS]

Install [Bower]

    npm install -g bower

Install [Gulp]

    npm install -g gulp

Install [JSHint]

    npm install -g jshint

Running
============

Build Project

    gulp build

Running

    gulp
