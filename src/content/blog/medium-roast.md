---
title: Slightly Roasted
author: Rhyn Ogg
pubDatetime: 2023-10-25T12:00:00Z
postSlug: slightly-roasted
featured: true
draft: false
ogImage: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=1200&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
tags:
  - Javascript
  - Backend
  - Express
  - PostgreSQL
  - Recursion
description: Adventures in transforming a key-value dump into a relational database with a proxy API.
---

## Building a JavaScript Proxy API for Hacker News Data

Getting started with this program I had the goal of ingesting the data from [HackerNews](https://news.ycombinator.com) created by [ycombinator](https://www.ycombinator.com) and providing a fully fetched comment tree upon querying a story.

## Table of Contents

## Write-up

As I began setting up the server with expressjs I discovered three things, one being that the Hackernews API is really a memory dump of their internal database hosted on Firebase. Two, that the documentation for said API linked in the footer of [HackerNews](https://news.ycombinator.com) is not entirely straight foward.. I actually found another version of documentation that was more useful [Hackernews.api-docs.io](https://hackernews.api-docs.io/v0/overview/introduction) that had more information on what to expect from fetching data. And three, because of the responses from the Firebase API are chunked, we have to handle a Bufferstream in Javascript(very fun without types!). So below is a function that I used to handle chunked responses.

```js
// This is my base function where all fetches are made from
export async function fetchFromHN(id) {
  return await fetch(base + `v0/item/${id}.json`).then(processChunkedResponse);
}
```

```js
function processChunkedResponse(response) {
  let text = "";
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  return readChunk().catch(error => {
    logger.error("Error reading chunk: " + error);
    throw new Error(error);
  });

  function readChunk() {
    return reader.read().then(appendChunks);
  }

  function appendChunks(result) {
    const chunk = decoder.decode(result.value || new Uint8Array(), {
      stream: !result.done,
    });

    text += chunk;

    if (result.done) {
      try {
        return JSON.parse(text);
      } catch (error) {
        logger.error("Error parsing JSON:" + error);
        throw new Error(error);
      }
    } else {
      return readChunk();
    }
  }
}
```

(This is a modification on [fetch-chunked.js](https://gist.githubusercontent.com/jfsiii/034152ecfa908cf66178/raw/d0ecf6deaa53615027d19c3dc5e5fd3bac9c38ab/fetch-chunked.js) written by [John Schulz](https://twitter.com/JFSIII))

So back to feeling good about this, I have my goals in mind, creating a local data structure to hold onto what was fetched while I was building out the routes and endpoints. This part was straight foward and only require Create and Read endpoints.
Setting up postgres is where I encountered the first major hurdle. After recently switching to a Debian based distribution and began the process of wrestling PostgreSQL onto my machine. This was resolved rather quickly once I threw my hands up and just created a Docker container to run on the default ports for postgres. Moving on to creating a sql script and getting the tables for _stories_ and _comments_, surely this sounds easy enough? No dice on this one either..
Once fetched, each comment may or may not have child comments of its own and so forth, causing our table to be self-referencing. So defining the _comments_ table in simple terms and using contraints to insure the data was good was not going to work for this application. At least not in the time I had allocated for design.So I chose to use Prisma ORM, making interfacing with the database a non-issue once you set up migrations for the tables.

Movin on, I would like to point out my main functions to make this all work as i wanted.

## Code Showcase

### IngestData

```js
// ingestController.js
export async function ingestData(data, type) {
  // return if data is bad
  if (data === null) {
    logger.error("IngestData parameter `data` is null.");
    return;
  }

  let queue = [...data];
  let result = [];

  for (let i = 0; i < queue.length; i++) {
    let selectItem = await checkDB(queue[i], type);

    if (selectItem === null) {
      logger.info(`${type} not found.`);

      selectItem = await fetchFromHN(queue[i]);
      createQuery(selectItem, type);
    } else {
      logger.info("story found.");
    }

    result.push(selectItem);
  }

  return result;
}
```

Above is my main function for data ingestion in the program, given an array of Integers or a single Integer ID; I make a local copy of the parameter as a very stripped down version of a work queue. A check is made to the appropriate table _type_ and we load the object into result for delivery, else we create a new row item with a guaranteed collision free INSERT due to the unique ID being the Primary Key.

### GetComments

```js
// ingestControllers.js
export async function getComments(item, type) {
  if (!item.kids || typeof item !== "object") {
    logger.warn(`${item} is not valid.`);
    return item;
  }
  logger.info("Getting comments for " + item.id);

  const kids = await ingestData(item.kids, type);

  let newKids = [];

  for (let i = 0; i < kids.length; i++) {
    const temp = await getComments(kids[i], "comment");
    newKids.push(temp);
  }

  const newItem = { ...item, kids: newKids };

  return newItem;
}
```

Above is where we recurse through comments, and comments' comments, and comments' comments' comments... Utilizing ingestData to fetch the actual data and replacing the integer arrays with the respective items and checking whether to continue with each iteration of our loop. I could have created functionality that would have dealt with this structure using Promise.all() but the issue there is that an item _can be null and still succeed_.

## Logging Utility

Using [Winston](https://github.com/winstonjs/winston) as a logging utility, I create rotating files locally for filtered relevent events(INFO level) and all errors(ERROR level). A sample of the INFO

```js
  transports: [
    new transports.Console(),

    new transports.DailyRotateFile({
      level: 'info',
      filename: `${logFolder}/%DATE%-info.log`,
      datePattern: 'YYYY-MM-DD',
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        printf(({ timestamp, message }) => {
          return `${timestamp} -- ${message}`;
        })
      ),
      zippedArchive: true,
      maxSize: '20m',
    }),
```

## Tech Used

The utilities I took advantage of in medium-roast:

- Prisma ORM for handling the data schema and managing the connection to the database.
- Docker to containerize a PostgreSQL database given that setting up postgres on debian was a headache.
- Winston and Morgan packages for logging and StdOut formating.
- ESLint and Prettier for code formatting and checking.

## Future Improvements

If in the future I can fit this project into my schedule, a few things I want to implement would be:

- Caching Top Stories for improved availability of the "frontpage"

  - Either use the simple cache I saved in /utils or Redis

- Create a web hook on the endpoint /maxitem

  - This could be implemented similarly to what happens on /secretingest

- Rewrite the schema to handle the self-referencing Comments

## Appendix

- [fetch-chunked.js](https://gist.githubusercontent.com/jfsiii/034152ecfa908cf66178/raw/d0ecf6deaa53615027d19c3dc5e5fd3bac9c38ab/fetch-chunked.js) written by [John Schulz](https://twitter.com/JFSIII)
  <br>
- [HackerNews](https://news.ycombinator.com) created by [ycombinator](https://www.ycombinator.com)<br>
- [Prisma](https://www.prisma.io) ORM
  <br>
- [Winston](https://github.com/winstonjs/winston) Logging Utility

### Full Code

See the project or fork it at [Medium-Roast](https://github.com/Dissurender/medium-roast#readme)
