// Starlight Stage's tickets API. It works: ready to use, and you don't need to change this file.
// Your job is the tests, in app.test.js. Every request it answers, with its status and JSON body:
//
//   GET /shows               200, every show in data.js, in order
//   GET /shows/2             200, show 2 (every show's id works the same way)
//   GET /shows/99            404, { "status": 404, "title": "Not Found", "detail": "There's no show 99." }
//   POST /shows/2/tickets    with { "quantity": 2 }: 201, the new ticket, { "id": 1, "showId": 2, "quantity": 2, "total": 66 },
//                            and show 2 has 2 fewer seats left (the total comes from orderTotal in tickets.js)
//     ...a quantity that isn't a whole number from 1 to 8 (0, 9, "two", or none at all):
//                            400, { "status": 400, "title": "Bad Request", "detail": "The order isn't valid.",
//                                   "problems": [{ "field": "quantity", "message": "quantity must be a whole number from 1 to 8." }] }
//     ...more tickets than the seats left:
//                            409, { "status": 409, "title": "Conflict", "detail": "Only 4 seats are left for Midnight Brass Band." }
//                            (the show's seats left and title), and the seats left don't change
//     ...a show that isn't there: 404, { "status": 404, "title": "Not Found", "detail": "There's no show 99." }
//   DELETE /tickets/1        a refund: 204 with no body, and the ticket's seats go back to its show
//   DELETE /tickets/99       404, { "status": 404, "title": "Not Found", "detail": "There's no ticket 99." }
//   Any other path           404, { "status": 404, "title": "Not Found", "detail": "There's nothing at /concerts." } (the path asked for)
import express from "express";
import { STATUS_CODES } from "node:http";
import { shows, tickets, nextTicketId } from "./data.js";
import { orderTotal } from "./tickets.js";

export const app = express();
app.use(express.json());

function findShow(id) {
  return shows.find((show) => show.id === Number(id));
}

// Every error answer has the same shape: the status, its standard title, what went wrong, and any field problems.
function sendProblem(res, status, detail, problems) {
  const body = { status, title: STATUS_CODES[status], detail };
  if (problems !== undefined) {
    body.problems = problems;
  }
  res.status(status).json(body);
}

app.get("/shows", (req, res) => {
  res.json(shows);
});

app.get("/shows/:id", (req, res) => {
  const show = findShow(req.params.id);
  if (show === undefined) {
    sendProblem(res, 404, `There's no show ${req.params.id}.`);
    return;
  }
  res.json(show);
});

app.post("/shows/:id/tickets", (req, res) => {
  const show = findShow(req.params.id);
  if (show === undefined) {
    sendProblem(res, 404, `There's no show ${req.params.id}.`);
    return;
  }
  const quantity = req.body?.quantity;
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 8) {
    sendProblem(res, 400, "The order isn't valid.", [
      { field: "quantity", message: "quantity must be a whole number from 1 to 8." },
    ]);
    return;
  }
  if (quantity > show.seatsLeft) {
    sendProblem(res, 409, `Only ${show.seatsLeft} seats are left for ${show.title}.`);
    return;
  }
  show.seatsLeft -= quantity;
  const ticket = { id: nextTicketId(), showId: show.id, quantity, total: orderTotal(show.price, quantity) };
  tickets.push(ticket);
  res.status(201).json(ticket);
});

app.delete("/tickets/:id", (req, res) => {
  const index = tickets.findIndex((ticket) => ticket.id === Number(req.params.id));
  if (index === -1) {
    sendProblem(res, 404, `There's no ticket ${req.params.id}.`);
    return;
  }
  const [ticket] = tickets.splice(index, 1);
  findShow(ticket.showId).seatsLeft += ticket.quantity;
  res.status(204).end();
});

// Any path no route above answers.
app.use((req, res) => {
  sendProblem(res, 404, `There's nothing at ${req.path}.`);
});

// Errors Express catches, such as a body that isn't valid JSON. The caller never sees the error's details.
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    sendProblem(res, 400, "The body isn't valid JSON.");
    return;
  }
  console.error(err);
  sendProblem(res, 500, "Something went wrong on our side.");
});
