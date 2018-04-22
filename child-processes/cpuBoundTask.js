'use strict';

const redis = require('redis'),
    redisConfig = require('../config').redisConfig;

const redisCli = redis.createClient(redisConfig.port, redisConfig.hostname);
redisCli.on('connect', function() {
    console.log('Redis connected.')
})

let cpuBoundTasks = 0;

waitForTask();

process.on('message', (m) => {
    if(m === 'cpu-bound-signal') {
        cpuBoundTasks++;
        console.log('message');
    }
})

function waitForTask() {

    redisCli.brpop([redisConfig.queue, 0], (err, reply) => {
        console.log(err, reply);
        let result = performIntensiveTask();
        console.log(`Result ${result}`);
        cpuBoundTasks--;
        if(!cpuBoundTasks) {
            
        }
        waitForTask();
    })
}

// simulate cpu bound computation --- factorial?!
function performIntensiveTask() {
    let result = 0;
    for(let i = 0; i < 10000; i++) {
        result += factorial(100);
    }
    return result;
}

function factorial(n) {
    if(n === 0) {
        return 1;
    }

    return n * factorial(n - 1);
}

