import TicketService from "./src/pairtest/TicketService.js";
import TicketTypeRequest from "./src/pairtest/lib/TicketTypeRequest.js";

// Check /src/pairtest/constant/index.js for configuration

let Type = ["ADULT", "CHILD", "INFANT"];
let ticket = new TicketService();
let i = Math.round(Math.random() * 2);
let no = Math.round(1 + Math.random() * 10);
let t1 = new TicketTypeRequest(Type[i], no);
console.log(i, no);
i = Math.round(Math.random() * 2);
no = Math.round(1 + Math.random() * 4);
let t2 = new TicketTypeRequest(Type[i], no);
console.log(i, no);
i = Math.round(Math.random() * 2);
no = Math.round(1 + Math.random() * 2);
let t3 = new TicketTypeRequest(Type[i], no);
console.log(i, no);
i = Math.round(Math.random() * 2);
no = Math.round(1 + Math.random() * 2);
let t4 = new TicketTypeRequest(Type[i], no);
console.log(i, no);
ticket.purchaseTickets(1, t1, t2, t3, t4);
