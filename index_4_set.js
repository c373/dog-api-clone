// API response can contain duplicate facts
// Modify this code so that response does not return duplicate facts

import express from 'express';
import {data} from './test500k.js';


const app = express();
app.set('port', process.env.PORT || 3001);

const numFacts = data.length;
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

app.get('/api/facts', (req,res) => {
    console.log(req.query); // display parsed querystring object
    console.log("Number of facts requested: ", req.query.number);
    const number = parseInt(req.query.number, 10)

	var start = new Date().getTime();

	// create a set of indexes to use for the final response
    const indexSet = new Set();

	// respond with error if the requested amount exceeds the number of unique
	// facts that our api can provide
	if (number > numFacts) {
		respond(res, 400, null, false);
		return;
	}

	// shortcut if ALL the facts are requested
	if (number == numFacts) {
		const shuffledData = Array.from(data);
		// TODO : SHUFFLE shuffledData
		respond(res, 200, shuffledData, true);
		return;
	}

	let nRequestedIndices;
	let invertIndexSet = false;

	// if the requested number of facts exceeds 50% of the total number of facts
	// available... then generate a random number of indices to EXCLUDE from
	// the final set and return the remainder (shuffled : TODO)

	// the reason for doing it this way is that if someone requests numFacts - 1
	// then the old algorithm would just spin and spin until it generated the
	// correct sequence of random numbers to fullfill the requested amount of
	// facts, with this improvement you don't have to wait around when there is
	// a high number of requested facts
	const nHalfNumFacts = Math.floor(numFacts / 2);

	if( number > nHalfNumFacts) {
		nRequestedIndices = numFacts - number;
		invertIndexSet = true;
	}
	else {
		nRequestedIndices = number;
	}
	getRandomIndices(nRequestedIndices, indexSet);

	console.log("indexSet size: ", indexSet.size, "inverted: ", invertIndexSet);

	const factsArray = getFactsArrayFromIndexSet(indexSet, invertIndexSet, number);

	console.log("Number of unique facts: ", factsArray.length);

	respond(res, 200, factsArray, true);

	var end = new Date().getTime();
	console.log("The api took: ", end - start, " milliseconds to respond.\n");

  });

// will keep getting new random facts indices until the requestedNumber is met
function getRandomIndices(requestedNumber, set) {
	while (set.size < requestedNumber) {
		const facts_index = getRandomInt(numFacts);
		set.add(facts_index);
	}
	return set.size;
}

// converts the index set to an array of facts
function getFactsArrayFromIndexSet(indexSet, invertSet, nRequested) {
	const factsSet = [];

	// if the indexSet should be inverted...
	if (invertSet) {
		// we will start adding all the facts by index that are not included
		// in the set, starting at a random index
		let index = getRandomInt(numFacts);

		while(factsSet.length < nRequested) {
			if (!indexSet.has(index)) {
				factsSet.push(data[index]);
			}
			index = index + 1 > numFacts ? 0 : index + 1;
		}

		// the last step would be to shuffle factsSet so that it doesn't always
		// have the same order when the indexSet should be inverted

		// TODO : SHUFFLE THE ARRAY WITH FISHER-YATES ALGO

		return factsSet;
	}

	// else just add facts by index for each one in the set
	indexSet.forEach(index => {
		factsSet.push(data[index]);
	});
	return factsSet;
}

// basic respond function
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
