# Exercise: Concert Tickets API Tests

Exercise code for the lesson **Exercise: Concert Tickets API Tests** in the Node.js in Depth course on [ask-codey.com](https://www.ask-codey.com).

Starlight Stage, a small concert venue, sells its tickets through this Express API: the shows, buying tickets, and refunds. The API works, but nobody wrote tests for it, so the next person who changes it could break ticket sales and not find out until fans do. You'll write the tests. Then `npm run check` plants three real bugs in the API, one at a time, and tells you whether your tests caught each one.

## What's here

- `app.js`: the tickets API, `export const app = express()`. The comment at its top lists every request it answers, with the status and JSON body of each. It works. Ready to use: don't change it.
- `data.js`: the three shows and the tickets sold, kept in memory, and `resetData()`, which puts them back the way they start. Ready to use.
- `tickets.js`: `orderTotal(price, quantity)`, what an order costs: the ticket price times the number of tickets, plus a $2 fee, with no fee from 6 tickets. Ready to use.
- `server.js`: starts the API at `http://localhost:3100`. Ready to use.
- `tickets.http`: the requests to try, for VS Code's REST Client extension. Ready to use.
- `app.test.js`: your tests. It resets the data before every test and has one worked example. For you to finish.
- `check/`: the check that runs your tests against three copies of `app.js` with a bug planted in each. You don't need to change it, and it's more fun if you don't read the copies until you're done.
- `package.json` and `package-lock.json`: the project's settings, its scripts (`start`, `dev`, `test` and `check`) and its two packages at exact versions, Express 5.3.0 and Supertest 7.3.2. Ready to use.

## Before you start

You need Node.js 24 or later (`node --version` shows yours). In VS Code's terminal, in this folder, install the packages:

```bash
npm install
```

It makes a `node_modules` folder. That folder is in `.gitignore`, so Git leaves it out: `npm install` makes it again on any computer.

## Run it

```bash
npm start
```

The terminal says `Starlight Stage's tickets API is listening on http://localhost:3100` and keeps running. Open `tickets.http` and click **Send Request** above any request; REST Client shows the answer beside it. The data lives in memory, so it starts fresh each time the API starts. Stop it with **Ctrl+C**.

## Write your tests

```bash
npm test
```

It runs every test in `app.test.js` and lists each one by name. No server needs to be running: Supertest hands each request straight to `app`.

Cover every behavior below with at least one test. The show data is in `data.js`: show 1 is The Velvet Owls ($25, 40 seats left), show 2 is Midnight Brass Band ($32, 4 seats left) and show 3 is Juniper Lane ($18, sold out, 0 seats left). Every error answer has the same shape: `status`, `title` (the status code's standard name, such as `"Not Found"`), `detail` (what went wrong), and for a 400, `problems`, a list of `{ field, message }`.

**`GET /shows` and `GET /shows/:id`**

1. `GET /shows` answers 200 with all 3 shows, in order. (This is the worked example.)
2. `GET /shows/2` answers 200 with the whole of show 2: `{ "id": 2, "title": "Midnight Brass Band", "date": "2026-12-05", "price": 32, "seatsLeft": 4 }`.
3. `GET /shows/99` answers 404 with `{ "status": 404, "title": "Not Found", "detail": "There's no show 99." }`.

**`POST /shows/:id/tickets`, with a body such as `{ "quantity": 2 }`**

4. `{ "quantity": 2 }` for show 2 answers 201 with `{ "id": 1, "showId": 2, "quantity": 2, "total": 66 }` (2 × $32, plus the $2 fee), and afterwards `GET /shows/2` has `seatsLeft` 2.
5. `{ "quantity": 6 }` for show 1 answers 201 with `total` 150 (6 × $25, no fee from 6 tickets), and afterwards show 1 has `seatsLeft` 34.
6. `{ "quantity": 4 }` for show 2 answers 201: the last seats can be sold. Afterwards show 2 has `seatsLeft` 0.
7. `{ "quantity": 5 }` for show 2, one more than it has left, answers 409 with `{ "status": 409, "title": "Conflict", "detail": "Only 4 seats are left for Midnight Brass Band." }`, and afterwards show 2 still has `seatsLeft` 4.
8. `{ "quantity": 1 }` for show 3 answers 409 with `{ "status": 409, "title": "Conflict", "detail": "Only 0 seats are left for Juniper Lane." }`.
9. A `quantity` of `0`, `9` or `"two"` for show 1 answers 400 with `{ "status": 400, "title": "Bad Request", "detail": "The order isn't valid.", "problems": [{ "field": "quantity", "message": "quantity must be a whole number from 1 to 8." }] }`, and afterwards show 1 still has `seatsLeft` 40. Test all three values.
10. `{ "quantity": 1 }` for show 99 answers 404 with `{ "status": 404, "title": "Not Found", "detail": "There's no show 99." }`.

**`DELETE /tickets/:id`, a refund**

11. After buying 2 tickets for show 2 (ticket 1), `DELETE /tickets/1` answers 204 with an empty body, and afterwards show 2 has `seatsLeft` 4 again.
12. `DELETE /tickets/99` answers 404 with `{ "status": 404, "title": "Not Found", "detail": "There's no ticket 99." }`.

## Check your work

```bash
npm run check
```

It runs your tests four times and prints a numbered line for each run:

1. **On the working `app.js`.** There must be tests, and every one must pass. If one fails here, the API is right and the test is wrong: check the value it expects.
2. **On a copy with a wrong status.**
3. **On a copy where the seats can go negative.**
4. **On a copy where a refund never gives the seats back.**

A planted bug counts as caught when at least one of your tests fails on its copy. If all your tests pass on a broken copy, that bug would reach real fans, and the line says what kind of test to add.

On the starter, check 1 passes (the worked example passes) and checks 2 to 4 fail: that's expected, because one test can't catch three bugs yet. When all four lines show a check mark, your tests protect the API.

## The rules

- Don't change `app.js`, `data.js` or `tickets.js`. They work; the tests are your work.
- Write your tests in `app.test.js` and import the app from `./app.js`, as the worked example does, so the check can swap in its planted-bug copies.
- Keep the `beforeEach` that calls `resetData()`, so every test starts from the shows in `data.js` and passes in any order.
- Name every test after what it sends and what it expects, such as `7) POST /shows/2/tickets with quantity 5 answers 409 and leaves the 4 seats alone`.

## Tips

- Work out each expected value by hand first, from this README and the comment at the top of `app.js`, and only then write it in the test. A test that copies whatever the API answers proves nothing.
- Check the status code of every answer, as well as its body.
- An order or a refund changes the data. Check what changed with a second request: `GET /shows/2`, then read `body.seatsLeft`.
- A refused order must change nothing: after a 400 or a 409, check that the seats left are still what they were.
- Bugs hide at the edges. For a show with 4 seats left, try 4 and 5, not only 2.
- A loop can make one test for each bad value: `for (const quantity of [0, 9, "two"]) { test(...) }`.

## Hand it in

When it works, push your solution to a public repo of your own on GitHub, then paste that repo's address into **Submit your exercise** on the lesson page at [ask-codey.com](https://www.ask-codey.com). That's what completes the lesson. The lesson page shows the Git commands, step by step.
