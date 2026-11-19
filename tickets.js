// What an order costs. Ready to use: you don't need to change this file.
// The ticket price times the number of tickets, plus a $2 fee for the order. An order of 6 or more tickets pays no fee.
//
//   orderTotal(32, 2) -> 66    (2 x $32, plus the $2 fee)
//   orderTotal(25, 6) -> 150   (6 x $25, no fee)
export function orderTotal(price, quantity) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 8) {
    throw new RangeError("Buy from 1 to 8 tickets at a time.");
  }
  let fee = 2;
  if (quantity >= 6) {
    fee = 0;
  }
  return price * quantity + fee;
}
