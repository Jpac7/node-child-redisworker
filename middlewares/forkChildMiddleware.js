'use strict';

const cp = require('child_process');
let worker;
let timestamp;

module.exports = function(req, res, next) {    
    timestamp = Date.now();

    // Turning on the extra worker
    if(!worker) {
        worker = cp.fork('./child-processes/cpuBoundWorker.js');

        const intervalId = setInterval(() => {
            if((Date.now() - timestamp) / 1000 >= 1 * 60) {
                // send signal to terminate after clean up
                worker.kill('SIGTERM');
            }
        }, 1 * 1000);

        worker.on('exit', (code, signal) => {
            console.log(`exit event: ${code} ${signal} at ${(Date.now() - timestamp) / 1000}`);
            if(code !== null || signal !== 'SIGTERM') {
                // process finished by undesired reason
                console.log('Finished by undesired reason. Restarting worker...');
                //worker = cp.fork('./child-processes/cpuBoundWorker.js');
            }
            clearInterval(intervalId);
            worker = null;
        });

        worker.on('disconnect', () => {
            console.log(`disconnect event`);
        })

    }

    worker.send('cpu-bound-signal');

    next();
}