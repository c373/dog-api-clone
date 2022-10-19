import express from 'express';
import {data} from './facts.js';


const app = express();
app.set('port', process.env.PORT || 3000);

const numFacts = data.length;
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

/*
Express simplifies the work of getting querystring data and form submissions.

You can access querystring values with the req.query object like so:
*/
app.get('/api/facts', (req,res) => {
    console.log(req.query); // display parsed querystring object
    console.log(req.query.number);
    const number = parseInt(req.query.number, 10)

    const factsArray = []
    for (let i=0; i < number; i++) {
        const facts_index = getRandomInt(numFacts);
        factsArray.push(data[facts_index]);
    }

    res.type('json');
    res.status(200);
    res.json({
        facts: factsArray,
        success: true
    });
  });

app.use((req, res) => {
    res.type('text/plain');
    res.status(404);
    res.send('404 - Not found');
});


app.listen(app.get('port'), () => {
    console.log('Express started');
});