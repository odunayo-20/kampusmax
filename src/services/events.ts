import { CampusEvent } from "@/types";
import {
  events as mockEvents,
  getEventsByCampus as _getEventsByCampus,
  getEventById as _getEventById,
  getUpcomingEvents as _getUpcomingEvents,
} from "@/data/events";

export function getEvents(campusId: string): CampusEvent[] {
  return _getEventsByCampus(campusId);
}

export function getEventById(id: string): CampusEvent | undefined {
  return _getEventById(id);
}

export function getUpcomingEvents(campusId: string): CampusEvent[] {
  return _getUpcomingEvents(campusId);
}

export function attendEvent(eventId: string, userId: string): void {
  const event = mockEvents.find((e) => e.id === eventId);
  if (event && !event.attendees.includes(userId)) {
    event.attendees.push(userId);
  }
}

export function unattendEvent(eventId: string, userId: string): void {
  const event = mockEvents.find((e) => e.id === eventId);
  if (event) {
    event.attendees = event.attendees.filter((id) => id !== userId);
  }
}
