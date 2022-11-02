# Assignment:

1. Clone https://github.com/IT122-fall-2022/dog-api-clone
2. Modify index_4.js so the dog API response does not return duplicate facts (dog API response can contain duplicate facts)

# Explanation:

The unmodified index_4.js file can return duplicate facts because the getRandomInt function can generate the same index multiple times and there isn't any data validation performed to verify if the factsArray already contains the fact corresponding to the index generated.

The easy solution would be to check whether the array already contains the value and simply generate a new random index until an unused index is generated.

## Theoretical Solution

A more involved solution that I've been thinking about would be to modify the random number generation function to accept weighted parameters that are adjusted with each number that is generated to help guide it's output to try and avoid generating duplicates as much as possible.

If I can  pull it off, I might be able to break the total range of possible random numbers into subsections that I can then use to concurrently generate the random numbers as fast as the processor can go with minimal collisions and optimal efficiency.

It's just a thought at this point.

# Modifications:

The modified **index_4.js** is the simple fix. The main changes are to the **'/api/facts'** endpoint.

1. We converted the *for* loop into a *while* loop with an external counter to ensure that the counter is only incremented upon successful creation of a unique index. 
2. Regarding the index creation there is an additional validation step on line 27, where we check if the array already includes the fact corresponding to the index that was generated.
3. If it does not we add the new fact to the array and increment the counter.

## Additional Experiments:

Upon testing I tried requesting a high amount of random facts, and found something interesting. As you approach the total number of facts available, the api becomes unresponsive.

This intuitively makes sense when you consider what happens when you request the total number of facts available, the current algorithm has to randomly generate *all* of the indices from 0 to 434.

The problem is that there is no guarantee that the random number generator won't output the same number more than once, this is by design.

So... for my own amusement, more than anything, I devised a better solution.

## Revised algorithm

The revised algorithm found in **index_4_set.js** has many more modifications than the **index_4.js** file. This is the basic overview:

### Data Structure Optimization

- This algorithm uses a **Set** instead of an **Array** to store, not the data itself but *indices* pointing to the position of the data on the source array.

	- The Set provides better performance  at scale and by design cannot hold duplicates of values.

### Early Exits for Edge Cases

- There are a few checks right away that provide early exits in edge cases:

	- when more than the total available amount of facts are requested (errors out)
	- when all the facts are requested (the entire source array is shuffled and then sent in the response)

### Optimized Logic
*If more than half the total amount of facts available are requested...*

Then the set of indices is then considered an inverted index set containing the indices of the facts to **EXCLUDE** rather than to include in the final response. This solves the issue of trying to generate the entire set of indices at random.

- Example: if someone requests total number of facts - 1, then generate the 1 index to **EXCLUDE** instead of generating the entire set of indices minus the 1 that will be excluded.

*This introduces another issue...*

- If we traverse the array of source data from the beginning, linearly and add everything, but the excluded indices... then the resulting collection of facts will always be in the same order.

#### Solution:

- Start at a random point in the source array and then shuffle the resulting array before it is sent off in the response.

### If none of the edge cases are hit or the requested number of facts is less than half of the total available...

Then it's simple, just add the facts by index into the final array.

# Conclusion and Tests

Phew! This might seem like a lot of work for essentially the same functionality... **BUT** this revised algorithm really starts to shine when you test it using **LOTS** of data.

I attribute most of the increase in efficiency to the fact that, it is much quicker to spam the set with random indices until you have satisfied the requested amount, than it is having to check every time if the array already contains the random number you generated.

Then the logical optimization of inverting the set of indices helps when there is large number of facts requested.

### To show just how much of an improvement the new algorithm provides I ran some tests.

### Results:

The additional overhead of the revised algorithm means that the original algorithm is a tiny bit faster when requesting small amounts of items. This advantage is soon lost. Once the number of requested items gets to be about a 1,000... the revised algorithm is operating on average, almost 5x faster then the original.

| # Items Requested | Average Time \*<br/>(Revised) | Average Time \*<br/>(Original)|Faster |
|:---:|:---:|:---:|:--:|
|**10**|0.04|0.03|0.33x (Original)|
|**100**|0.06|0.05|0.20x (Original)|
|**1,000**|0.19|1.11|4.84x (Revised)|
|**10,000**|1.79|122.75 (0.12 sec)|67.6x (Revised)|
|**20,000**|3.46|648.66 (0.64 sec)|186x (Revised)|
|**25,000**|5.16|1,123.77 (1.12 sec)|217x (Revised)|
|**100,000**|14.63|24,083.87 (24.08 sec)|1,645x (Revised)|
|**200,000**|28.04|133,381.18 (2 min 13 sec)|4,756x (Revised)|
|**250,000**|33.31|715,988.98 (11 min 56 sec)|21,494x (Revised)|
|**375,000**|36.71|**N/A**|**N/A**|
|**499,000**|21.05|**N/A**|**N/A**|
|**500,000**|11.09|**N/A**|**N/A**|
||* milliseconds|* milliseconds|

### Computer Specs:
    Processor - 11th Gen Intel® Core™ i7-1165G7
    RAM - 16GB @ 4267MHz
