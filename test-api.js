import * as http from 'http';

const tests = [10, 100, 1000, 10000, 20000, 100000, 200000, 250000, 375000, 499999, 500000];

let testResults = [];

runTests();


async function runTests() {
	for( let i = 0; i < tests.length ; i++ ) {
		let cumulativeTime = 0;
		for( let j = 0; j < 5 ; j++ ) {
			const result = await getJson(tests[i]);
			cumulativeTime += result.timeElapsed;
		}
		testResults.push(cumulativeTime / 5);
	}

	console.log("\nNumber Requested:\t\tAverage Response Time:");
	console.log("------------------------------------------------------")
	testResults.forEach((value, index, array) => {
		console.log(`${tests[index]}\t\t\t\t${value}`);
		console.log("------------------------------------------------------")
	});
}

function getJson(nRequests) {
	return new Promise((resolve, reject) =>{
		http.get({
			hostname: 'localhost',
			port: 3000,
			path: '/api/facts?number=' + nRequests,
			agent: false  // Create a new agent just for this one request
			}, (res) => {
				let body = "";

				res.on("data", (chunk) => {
					body += chunk;
				});

				res.on("end", () => {
					resolve(JSON.parse(body));
				});

				res.on("error", err => {
					reject(err);
				});
		});
	});
}
