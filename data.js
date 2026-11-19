// Starlight Stage's shows and the tickets sold, kept in memory. Ready to use: you don't need to change this file.
// resetData() puts everything back the way it starts: the three shows below, and no tickets sold yet.
// Call it before every test (beforeEach), so each test starts from the same seats.
const startingShows = [
  { id: 1, title: "The Velvet Owls", date: "2026-12-04", price: 25, seatsLeft: 40 },
  { id: 2, title: "Midnight Brass Band", date: "2026-12-05", price: 32, seatsLeft: 4 },
  { id: 3, title: "Juniper Lane", date: "2026-12-11", price: 18, seatsLeft: 0 },
];

export const shows = [];
export const tickets = [];
let lastTicketId = 0;

// The id for the next ticket sold: 1, then 2, then 3, starting again at 1 after resetData().
export function nextTicketId() {
  lastTicketId += 1;
  return lastTicketId;
}

export function resetData() {
  shows.length = 0;
  shows.push(...structuredClone(startingShows));
  tickets.length = 0;
  lastTicketId = 0;
}

resetData();
