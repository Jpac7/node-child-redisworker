'use strict';

const app = require('express')();

const port = process.env.PORT || 3000;

app.get('/', function(req, res) {
    res.status(200).send('Welcome!').end();
})

app.get('/tasks', function(req, res) {
    
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})