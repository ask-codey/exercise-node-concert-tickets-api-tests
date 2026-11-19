// A copy of app.js with one bug planted in it, for npm run check. Your tests should fail on it.
// Try writing your tests from the README before you look for the bug here. You don't need to change this file.
import express from "express";
import { STATUS_CODES } from "node:http";
import { shows, tickets, nextTicketId } from "../../../data.js";
import { orderTotal } from "../../../tickets.js";

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
