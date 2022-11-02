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

// endpoint to test the shuffle function
app.get('/api/shuffle', (req, res) => {
	let array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	console.log("array not shuffled ", array);
	shuffleArray(array);
	console.log("array shuffled ", array);
	respond(res, 200, array, true);
});

let start, end, elapsed;

app.get('/api/facts', (req,res) => {
    console.log(req.query); // display parsed querystring object
    console.log("Number of facts requested: ", req.query.number);
    const number = parseInt(req.query.number, 10)

	// used to time the api response time
	start = performance.now();

	// create a set of indices to use for the final response
    const indexSet = new Set();

	// respond with error if the requested amount exceeds the number of unique
	// facts that our api can provide
	if (number > numFacts) {
		respond(res, 400, null, false);
		return;
	}

	// shortcut if ALL the facts are requested
	if (number == numFacts) {
		let shuffledData = [...data];
		shuffleArray(shuffledData); // shuffle the array

		console.log("Number of unique facts: ", shuffledData.length);
		respond(res, 200, shuffledData, true);

		return;
	}

	let nRequestedIndices;
	let invertIndexSet = false;

	// if the requested number of facts exceeds 50% of the total number of facts
	// available... then generate a random number of indices to EXCLUDE from
	// the final set and return the remainder as a shuffled array

	// the reason for doing it this way is that if someone requests numFacts - 1
	// then the old algorithm would just spin and spin until it generated the
	// correct sequence of random numbers to fullfill the requested amount of
	// facts, with this improvement you don't have to wait around when there is
	// a high number of requested facts
	const nHalfNumFacts = Math.floor(numFacts / 2);

	// determine if the indexSet will be inverted or not
	if( number > nHalfNumFacts) {
		nRequestedIndices = numFacts - number;
		invertIndexSet = true;
	}
	else {
		nRequestedIndices = number;
	}

	// generate the required indices
	getRandomIndices(nRequestedIndices, indexSet);


	// the factsArray that will store the final set of facts
	const factsArray = getFactsArrayFromIndexSet(indexSet, invertIndexSet, number);

	// shuffle the array if the indexSet was inverted
	if (invertIndexSet) {
		shuffleArray(factsArray);
	}

	console.log("indexSet size: ", indexSet.size, "inverted: ", invertIndexSet);
	console.log("Number of unique facts: ", factsArray.length);

	respond(res, 200, factsArray, true);

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

		return factsSet;
	}

	// else just add facts by index for each one in the set
	indexSet.forEach(index => {
		factsSet.push(data[index]);
	});
	return factsSet;
}

function shuffleArray(dataArray) {
	let lastIndex = dataArray.length - 1;
	let temp;
	while (lastIndex > 0) {
		let randomIndex =  getRandomInt(lastIndex);
		temp = dataArray[lastIndex];
		dataArray[lastIndex] = dataArray[randomIndex];
		dataArray[randomIndex] = temp;
		lastIndex--;
	}
}

// basic respond function
function respond(res, status, genData, success) {
	end = performance.now();
	elapsed = end - start;

	res.type('json');
	res.status(status);
	res.json({
		facts: genData,
		success: success,
		timeElapsed: elapsed
	})

	console.log("The api took: ", elapsed, " milliseconds to respond.\n");
}

app.use((req, res) => {
    res.type('text/plain');
    res.status(404);
    res.send('404 - Not found');
});


app.listen(app.get('port'), () => {
    console.log('Express started');
});
