'use strict';

const redis = require('redis'),
    redisConfig = require('../config').redisConfig;

const redisCli = redis.createClient(redisConfig.port, redisConfig.hostname);
redisCli.on('connect', function() {
    console.log('Redis connected.')
})

let cpuBoundTasks = 0;

process.on('message', (m) => {
    if(m === 'signal') {
        cpuBoundTasks++;
        // console.log('message');
    }
});

process.on('SIGTERM', () => {
    console.log('SIGTERM');
    redisCli.llen(redisConfig.queue, (err, length) => {
        if(err) {
            return exit(1);
        }

        if(length === 0 && length === cpuBoundTasks) {
            console.log('!cpuBoundTasks && length === 0');
            exit(0);
        } else if(cpuBoundTasks > length) {
            console.log(`Something went wrong cpuBoundTasks (${cpuBoundTasks}) > length (${length})`);
        }
    })
});

waitForTask();

function waitForTask() {

    redisCli.brpop([redisConfig.queue, 0], (err, reply) => {
        console.log(err, reply);
        // synchronous task
        let result = performIntensiveTask();
        console.log(`Result ${result}`);
        cpuBoundTasks--;
        waitForTask();
    })
}

// simulate cpu bound computation --- factorials sum
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

function exit(code) {
    redis.quit();
    process.exit(code);
}

