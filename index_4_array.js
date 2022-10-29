// API response can contain duplicate facts
// Modify this code so that response does not return duplicate facts

import express from 'express';
import {data} from './test500k.js';


const app = express();
app.set('port', process.env.PORT || 3000);

const numFacts = data.length;
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

app.get('/api/facts', (req,res) => {
    console.log(req.query); // display parsed querystring object
    console.log("Number of facts requested: ", req.query.number);
    const number = parseInt(req.query.number, 10)

	var start = new Date().getTime();

    const factsArray = []
	let i = 0;
	while(i < number) {
        const facts_index = getRandomInt(numFacts);
		if(!factsArray.includes(facts_index.toString())) {
			factsArray.push(data[facts_index]);
			i++;
		}
	}

	respond(res, 200, factsArray, true);

	var end = new Date().getTime();
	console.log("The api took: ", end - start, " milliseconds to respond.\n");
  });

function respond(res, status, genData, success) {
	res.type('json');
	res.status(status);
	res.json({
		facts: genData,
		success: success
	})
}

app.use((req, res) => {
    res.type('text/plain');
    res.status(404);
    res.send('404 - Not found');
});


app.listen(app.get('port'), () => {
    console.log('Express started');
});
