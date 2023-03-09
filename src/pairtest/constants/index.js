export const TICKET_TYPES = {
  INFANT: {
    price: 0, //Ticket price
    reserve_seat: false, //Set to true if the type of ticket requires seat reservation or false if not
    can_book_without_parent: false, // Set to false if the ticket type is dependent on another ticket type (parent) or true if not
    parent: "ADULT", // This represents the parent name. The value must exist in TICKET_TYPES
    no_per_parent: 1, // This is the maximum number of tickets that can be assigned to each parent during purchase
  },
  CHILD: {
    price: 10,
    reserve_seat: true,
    can_book_without_parent: false,
    parent: "ADULT",
    no_per_parent: 10,
  },
  ADULT: { price: 20, reserve_seat: true, can_book_without_parent: true },
};

export const MAX_TICKETS_PER_PURCHASE = 20;

export const CURRENCY = '£';
