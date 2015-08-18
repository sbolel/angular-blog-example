# Blog with Firebase

Example for LAUNCH! Annapolis meetup on 8/17/2015.

## Getting Started

This example requires [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.org/), which can both be installed by following the instructions on https://nodejs.org/. Installing Node.js also installs npm.

It also requires Bower, which can be installed by following the directions on http://bower.io/.

#### Installing from Source

`git clone https://github.com/sbolel/launch-annapolis/`

`cd launch-annapolis`

`npm install` - Install npm & bower dependencies for `blog-angular` and `blog-server`

#### Setting Environment Variables

Add the following to $PATH

```bash
export LAUNCH_FIREBASE_URL=https://launch-annapolis.firebaseio.com
export LAUNCH_FB_SECRET=<YOUR-FIREBASE-SECRET>
```

> <sup>email <sinanbolel@gmail.com> for Firebase secret</sup>

#### Serving reader single-page application

`cd ./blog-angular`

`grunt`

#### Running admin server application

`nodemon ./blog-server/bin/www` - start server using nodemon

or `DEBUG=* nodemon ./blog-server/bin/www` - using nodemon with debugging enabled

or `DEBUG=* npm start ./blog-server/bin/www` -  using npm with debugging enabled 

<br/>and open `http://localhost:4000` in your browser

## Roadmap

_in progress_

