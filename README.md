# Assignment:

1. Clone https://github.com/IT122-fall-2022/dog-api-clone
2. Modify index_4.js so the dog API response does not return duplicate facts (dog API response can contain duplicate facts)

# Explanation:

The unmodified index_4.js file can return duplicate facts because the getRandomInt function can generate the same index multiple times and there isn't any data validation performed to verify if the factsArray already contains the fact corresponding to the index generated. The easy solution would be to check whether the array already contains the value and simply generate a new random index until an unused index is generated.

A more involved solution that I've been thinking about would be to modify the random number generation function to accept weighted parameters that are adjusted with each number that is generated to help guide it's output to try and avoid generating duplicates as much as possible. If I can  pull it off I might be able to break the total range of possible random numbers into subsections that I can then use concurrently to generate as many random numbers as I want as fast as the processor can go with minimal collisions and optimal efficiency. It's a work in progress.

# Modifications:

The modified index_4.js is the simple fix. The main changes are to the '/api/facts' endpoint. We converted the for loop into a while loop to with an external counter to ensure that the counter is only incremented upon successful creation of a unique index. Regarding the index creation there is an additional validation step on line 27, where we check if the array already includes the fact corresponding to the index that was generated. If it does not we add the new fact to the array and increment the counter.

## Additional Experiments:

Upon testing I tried requesting a high amount of random facts, and found something interesting. As you approach the total number of facts available, the api becomes unresponsive. This intuitively makes sense when you consider what happens when you request the total number of facts available, the current algorithm has to randomly generate each of the indices from 0 to 434. The problem is that there is no guarantee that the random number generator won't output the same number more than once, this is by design. So essentially what you have is a monkey at a typewriter smashing the keys at random, expecting it to write out a shakespearean play. So..... for my own amusement, more than anything, and personal development I devised a better solution.

## Revised algorithm

The revised algorithm found in index_4_set.js has many more modifications than I can go over here, so I will give a high level overview of how it works.

* First and foremost this algo uses a Set instead of an Array to store, not the data itself but indices pointing to the position of the data on the array of source data supplied. The Set provides better performance  at scale and by design cannot hold duplicates of values.

* There are a few checks right away that provide early exits in edge cases, ex: when more than the total available amount of facts are requested (errors out), and when all the facts are requested (the entire source array is shuffled and then sent in the response).

* Then comes the first logical optimization. If more than half the total amount of facts available are requested, the Set of indices is then considered an inverted index set containing the indices of the facts to EXCLUDE rather than to include in the final reponse. This solves the issue of trying to generate close to the entire set of indices at random. Ex: if someone requests total number of facts - 1, generate the 1 index to EXCLUDE instead of generating the entire set of indices minus the 1 that will be excluded.

* Now another issue arises when the index set is inverted, if we traverse the array of source data from the beginning, linearly and add everything but, the excluded indices... then the resulting collection of facts would always be in the same order. A decent solution is to start at a random point in the source array and then shuffle the resulting array before it is sent off in the response.

* Now if none of the edge cases are hit or the requested number of facts is less than half of the total available then just add the facts by index into the final array.

Phew! This seems like a lot of work for essentially the same functionality... BUT the improvements of this revised algorithm really start to shine when you test it against the old implementation using LOTS of data. I attribute most of the increase in efficiency to the fact that it is much quicker populate the Set of indices with random values until you have satisfied the requested amount than having to check everytime if the Array already contains a specific value. Then the logical optimization of inverting the Set of indices helps when there is large number of facts requested. To show just how much of an improvement the new algorithm provides I ran some tests.

Both algorithms respond similarly up until 1,000 facts requested. By 10,000 the implementation with the Array is taking an average of 75 milliseconds to respond. Not bad on it's own but when you consider that the  implementation with the Set is responding with an average of 5 milliseconds you start to see the difference... by 100,000 facts requested the Array algo is taking about 1min 40secs to respond, the Set algo? 28 milliseconds. I stopped testing the Array implementation at 375,000 requests where it took a full 10mins+ to respond in comparison to the Set implementation which responded within 77 milliseconds. Actually the Set algo never seemed to ever take longer than ~88 milliseconds to respond. When requesting the full set of data, because of the optimizations, it was responding within an average of ~39 milliseconds.

### Computer Specs:
    Processor - 12th Gen Intel(R) Core(TM) i7-12800H   2.40 GHz \
    RAM - 16GB @ 4800MHz \
    Running all kinds of programs in the background lol