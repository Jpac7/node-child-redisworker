'use strict';

const cp = require('child_process');
let worker;

module.exports = function(req, res, next) {    
    // Turning on the extra worker
    if(!worker) {
        worker = cp.fork('./child-processes/cpuBoundTask.js');
        worker.on('exit', (code, signal) => {
            console.log(`exit event: ${code} ${signal}`);
            worker = null;
        });
        worker.on('disconnect', () => {
            console.log(`diconnect event`);
        })
    }

    worker.send('cpu-bound-signal');

    next();
}