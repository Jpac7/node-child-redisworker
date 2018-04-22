'use strict';

const app = require('express')(),
    redis = require('redis'),
    redisConfig = require('./config').redisConfig,
    redisWorker = require('./middlewares/forkChildMiddleware');

const port = process.env.PORT || 3000,
    redisCli = redis.createClient(redisConfig.port, redisConfig.hostname);


app.get('/', function(req, res) {
    res.status(200).send('Welcome!').end();
})

app.get('/longtasks/:index/:ref', redisWorker, function(req, res) {
    const index = req.params.index,
        ref = req.params.ref;

    // O(1)
    redisCli.rpush(redisConfig.queue, `${index}/${ref}`, (err, reply) => {
        console.log(err, reply);
        if(err) {
            return res.status(500).send({status: 'error', message: 'error pushing to queue.'}).end();
        }
        res.send({status: 'success'}).end();
    })    
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})