import { CURRENCY,TICKET_TYPES, MAX_TICKETS_PER_PURCHASE } from "./constants/index.js";
import InvalidPurchaseException from "./lib/InvalidPurchaseException.js";
import TicketPaymentService from "../thirdparty/paymentgateway/TicketPaymentService.js";
import SeatReservationService from "../thirdparty/seatbooking/SeatReservationService.js";

export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */
  #_paymentService = new TicketPaymentService();
  #_seatReservationService = new SeatReservationService();

  #typeList = {};

  // Calculate the total price for a set of ticket type requests
  #calculatePrice(ticketTypeRequests) {
    let totalPrice = 0;

    // Iterate over each ticket type request and add up the total price
    for (const request of ticketTypeRequests) {
      const ticketType = TICKET_TYPES[request.getTicketType()];

      // Check if the ticket type is valid
      if (!ticketType) {
        throw new InvalidPurchaseException(
          `Invalid ticket type: ${request.type}`
        );
      }

      let quantity = request.getNoOfTickets();

      // Check if the ticket quantity is valid
      if (quantity < 0 || quantity > 20) {
        throw new InvalidPurchaseException(
          `Invalid ticket quantity: ${quantity}`
        );
      }

      // Calculate the price for this ticket type request
      const price = ticketType.price * quantity;
      totalPrice += price;
    }

    return totalPrice;
  }

  #validateTickets() {
    const keys = Object.keys(this.#typeList);
    for (let x of keys) {
      const ticketType = TICKET_TYPES[x];

      if (!ticketType.can_book_without_parent) {
        const noPerParent = ticketType.no_per_parent;
        const parentTicket = this.#typeList[ticketType.parent];
        const t = (parentTicket * noPerParent) - this.#typeList[x];

        // Check if the parent ticket is valid and also the limit of each ticket type purchased
        if (!parentTicket || t < 0) {
          throw new InvalidPurchaseException(
            `The number of ${x} tickets purchased exceed ${ticketType.parent} ticket limit`
          );
        }
      }
    }

    return true;
  }

  #printReceipt(accountId, totalPrice, totalQuantity, totalSeat) {
    const date = new Date();
    const formattedDate = this.#formatDate(date);

    const keys = Object.keys(this.#typeList);
    console.log(`*** RECEIPT ***
CUSTOMER NO.        ${accountId}
${formattedDate}`);

    for (let x of keys) {
      let quantity = this.#typeList[x];
      if(quantity==0){
        continue;
      }
      let price = TICKET_TYPES[x].price;
      let total = price * quantity;
      const t = total == 0 ? "Free" : CURRENCY+total;
      console.log(`${x}           | ${quantity}| ${t}`);
    }
    console.log(`----------------------------------------
TOTAL TICKETS       | ${totalQuantity}
TOTAL SEATS RESERVED | ${totalSeat}
TOTAL PRICE         | ${CURRENCY}${totalPrice}`);
  }

  #formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    const second = String(date.getSeconds()).padStart(2, "0");
    const meridiem = hour < 12 ? "AM" : "PM";

    return `${year}-${month}-${day} ${hour}:${minute}:${second} ${meridiem}`;
  }
  // Purchase tickets and reserve seats
  purchaseTickets(accountId, ...ticketTypeRequests) {
    const keys = Object.keys(TICKET_TYPES);
    for (let x of keys) {
      this.#typeList[x] = 0;
    }

    let seatCount = 0;
    let totalQuantity = 0;

    // Check if the ticket type is valid
    if (accountId < 1) {
      throw new InvalidPurchaseException(`Invalid User Account: ${accountId}`);
    }

    if (ticketTypeRequests.length < 1) {
      throw new InvalidPurchaseException(`Request is empty: ${accountId}`);
    }

    // Calculate the total price for the ticket type requests
    const totalPrice = this.#calculatePrice(ticketTypeRequests);

    for (const request of ticketTypeRequests) {
      let type = request.getTicketType();
      let quantity = request.getNoOfTickets();
      const ticketType = TICKET_TYPES[type];
      const reserveSeat = ticketType.reserve_seat;

      // Check if the ticket type is valid
      if (!ticketType) {
        throw new InvalidPurchaseException(`Invalid ticket type: ${type}`);
      }

      this.#typeList[type] += quantity;

      // Calculate total number of tickets
      totalQuantity += quantity;

      // Calculate total seats required for reservation
      seatCount += reserveSeat ? quantity : 0;
    }

    // Check if the ticket quantity is valid
    if (totalQuantity < 1 || totalQuantity > MAX_TICKETS_PER_PURCHASE) {
      throw new InvalidPurchaseException(
        `Invalid ticket quantity: ${totalQuantity}`
      );
    }

    if (this.#validateTickets()) {
      // Make a payment request to the payment service
      this.#_paymentService.makePayment(accountId, totalPrice);

      // Reserve seats for this ticket type request
      this.#_seatReservationService.reserveSeat(accountId, seatCount);

      // Print receipt to console
      this.#printReceipt(accountId, totalPrice, totalQuantity, seatCount);
    }
  }
}
