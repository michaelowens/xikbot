# Xikbot

[![Build Status](https://travis-ci.org/michaelowens/xikbot.svg?branch=master)](https://travis-ci.org/michaelowens/xikbot)

> A highly configurable and extensible Twitch bot written in Node.js.

## Build Setup

``` bash
# install dependencies
npm install

# compile web assets
gulp build

# watcher (for compiling web assets while developing)
gulp watch

# run both bot & web interface
nodemon index.js both

# run bot only
nodemon index.js bot

# run web only
nodemon index.js web

# or run via pm2
pm2 start process.json
```
