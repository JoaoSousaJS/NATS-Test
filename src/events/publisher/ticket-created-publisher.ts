import { Subjects } from "../listener/subjects";
import { TicketCreatedEvent } from "../listener/ticket-created-event";
import { Publisher } from "./base-publisher";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated
}