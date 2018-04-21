'use strict';

const worker = require('cluster').fork();
worker.on('disconnect', () => {
    console.log('Worker disconnected!')
})

module.exports = function(req, res, next) {
}