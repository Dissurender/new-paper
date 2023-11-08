---
title: hn-go
author: Rhyn Ogg
pubDatetime: 2023-11-02T00:00:00Z
postSlug: hn-go
featured: true
draft: true
ogImage: "https://github.com/Dissurender/new-paper/blob/main/src/assets/images/hngo.png"
tags:
  - Go
  - Caching
  - Concurrency
  - Gin
description: Go unnecessarily fast.
---

## Exploring local cache implementation with Go

 In the planning phase of this project, ingesting the data from [HackerNews](https://news.ycombinator.com) created by [ycombinator](https://www.ycombinator.com) and providing a local copy via a caching structure was a simple blanket goal. This would also give me reason to experiment with some aspects of Go such as the concurrency model.

## Table of Contents

## Write-up

I will start off by quoting my post [Slightly Roasted](https://new-paper.vercel.app/posts/slightly-roasted) where I cover more of the issues I encountered and the way I solved them.

```
..., that the documentation for said API linked in the footer of HackerNews is not entirely straight foward.. I actually found another version of documentation that was more useful <Hackernews.api-docs.io> that had more information on what to expect from fetching data.
```

So moving forward I want to focus on my Go version of the code base and have a few comparisons thrown in to highlight the differences between the two.

Go's Standard Libraries and tooling makes it a blast and I always enjoy when I can make the excuse to use it. I did opt to use the [Gin Web Framework](https://gin-gonic.com) for the ease of use but I will likely refactor to the basic http package offered by Go. Using Gin's default router and tossing on a helper package [gin-cors](https://github.com/itsjamie/gin-cors) to handle cors effortlessly I was able to roll out a couple endpoints that I would need to get the ball rolling on the actual heart of the project. 

## Code Showcase

```go
var c *cache.Cache

func InitializeCache() {
	// Initialize the cache with a 5 minute default expiration time and a 10 minute cleanup interval
	c = cache.New(5*time.Minute, 10*time.Minute)
}

func GetFromCache(key string) (interface{}, bool) {
	return c.Get(key)
}

func AddToCache(key string, value interface{}) {
	c.Set(key, value, cache.DefaultExpiration)
}

func AddToCacheWithExpiration(key string, value interface{}, expiration time.Duration) {
	c.Set(key, value, expiration)
}
```
Above is my caching structure, using [Go-Cache](https://github.com/patrickmn/go-cache) to be a stand-in for writing my own key:value store for the sake of time.
This includes the necessay functions you could ask for; Get/Add, and an expiration for each key as to keep the data fresh.

Next up is the handlers for the exposed endpoints, HandleAPIRequestBest is the the major palyer in dealing with the "story" type items. We call fetchTopStories from here and currently without a limit or paging, this will load 500 IDs into the retrieval process.

```go
func HandleAPIRequestBest(c *gin.Context) {
	cacheKey := "results"
	results, found := getResultsFromCache(cacheKey)
	if found {
		utils.Logger("Results found.")
		c.JSON(http.StatusOK, results)
		return
	}

	data, err := fetchTopStories()
	if err != nil {
		utils.Logger(err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	results = retrieveKids(data)
	addResultsToCache(cacheKey, results)
	c.JSON(http.StatusOK, results)
}
```

Now for the fun stuff, retrieveKids is what orchestrates the fetching and retrieval of the items in the 'data' param. Here we have a waitGroup that I load all of the logic into as to not cast the Go routines into the abyss and hope it comes back. Mutex-ing the results slice allows us to insure we make the writes to the slice in an orderly fashion without collisions or errors blocking multiple writes from occurring. I'm also using Go's defer keyword to ensure that the routine reports that it is complete to the waitGroup as the _last_ action as the scope closes and is pulled out of memory.

```go
func retrieveKids(data []int) []interface{} {
	var wg sync.WaitGroup
	results := make([]interface{}, len(data))

	mutex := new(sync.Mutex) // Mutex to protect concurrent writes to results.

	for i, id := range data {
		wg.Add(1)
		go func(i, id int) {
			defer wg.Done()
			item, err := fetchOrRetrieveFromCache(id)
			if err != nil {
				return
			}

			mutex.Lock() // Claim the mutex while writing.
			results[i] = item
			mutex.Unlock()
		}(i, id)
	}
	wg.Wait()

	utils.Logger(fmt.Sprintf("Number of results found: %v", len(results)))

	return results
}
```

## Tech Used

### Gin Gonic

[Gin Web Framework](https://gin-gonic.com) is a well maintained and straightforward framework that I found to work not unlike Express.js. Easy configuration, default console formatting and baked in param handling made it a piece of cake to use.

## Future Improvements

## Appendix

- [HackerNews](https://news.ycombinator.com) created by [ycombinator](https://www.ycombinator.com)<br>

### Full Code

See the project or fork it at [Hn-Go](https://github.com/Dissurender/hn-gho#readme)
