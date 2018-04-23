'use strict';

const cp = require('child_process');
let worker;
let timestamp;

module.exports = function(workerPath, idleMinsLimit, message='signal') {
    return function(req, res, next) {    
        timestamp = Date.now();

        // Turning on the extra worker
        if(!worker) {
            worker = cp.fork(workerPath);

            const intervalId = setInterval(() => {
                // Close child process after idleMinsLimit minutes of requests inactivity
                if((Date.now() - timestamp) / 1000 >= idleMinsLimit * 60) {
                    // send signal to terminate after performing clean up
                    worker.kill('SIGTERM');
                }
            }, 1 * 1000);

            worker.on('exit', (code, signal) => {
                console.log(`exit event: ${code} ${signal} at ${(Date.now() - timestamp) / 1000}`);
                if(code !== null || signal !== 'SIGTERM') {
                    // process finished by undesired reason, restarted on next request
                    console.log('Finished by undesired reason.');
                }
                clearInterval(intervalId);
                worker = null;
            });

            worker.on('disconnect', () => {
                console.log(`disconnect event`);
            })

        }

        worker.send(message);

        next();
    }
}