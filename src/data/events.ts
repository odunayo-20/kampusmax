import { CampusEvent } from "@/types";

export const events: CampusEvent[] = [
  {
    id: "e1",
    campusId: "rugipo",
    title: "End of Semester Sale",
    description:
      "Massive clearance sale! Get up to 50% off on textbooks, electronics, and fashion items. Vendors from all departments participating.",
    location: "Student Union Building",
    startDate: "2025-01-20T09:00:00Z",
    endDate: "2025-01-20T18:00:00Z",
    organizerId: "u2",
    attendees: ["u1", "u2", "u3", "u4", "u5"],
    maxAttendees: 200,
    isVirtual: false,
    tags: ["sale", "marketplace", "end of semester"],
    createdAt: "2025-01-14T08:00:00Z",
  },
  {
    id: "e2",
    campusId: "rugipo",
    title: "Tech Meetup: Introduction to Web Development",
    description:
      "Learn the basics of HTML, CSS, and JavaScript. Bring your laptop! Hosted by the Computer Science department.",
    location: "Computer Lab 3",
    startDate: "2025-01-22T14:00:00Z",
    endDate: "2025-01-22T17:00:00Z",
    organizerId: "u1",
    attendees: ["u1", "u4"],
    maxAttendees: 40,
    isVirtual: false,
    tags: ["tech", "web development", "learning"],
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "e3",
    campusId: "rugipo",
    title: "Campus Food Festival",
    description:
      "Taste the best campus food! CampusBites and other food vendors will be serving jollof rice, suya, meat pies, and more.",
    location: "Cafeteria Ground",
    startDate: "2025-01-25T11:00:00Z",
    endDate: "2025-01-25T20:00:00Z",
    organizerId: "u5",
    attendees: ["u1", "u2", "u5"],
    maxAttendees: 300,
    isVirtual: false,
    tags: ["food", "festival", "campus life"],
    createdAt: "2025-01-16T09:00:00Z",
  },
  {
    id: "e4",
    campusId: "rugipo",
    title: "Online Study Group: Engineering Mathematics",
    description:
      "Weekly online study group for Engineering Mathematics. We'll cover differential equations and linear algebra.",
    location: "Zoom",
    startDate: "2025-01-18T19:00:00Z",
    endDate: "2025-01-18T21:00:00Z",
    organizerId: "u4",
    attendees: ["u1", "u4"],
    isVirtual: true,
    meetingLink: "https://zoom.us/j/123456789",
    tags: ["study", "mathematics", "engineering"],
    createdAt: "2025-01-15T14:00:00Z",
  },
];

export function getEventsByCampus(campusId: string): CampusEvent[] {
  return events
    .filter((e) => e.campusId === campusId)
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
}

export function getEventById(id: string): CampusEvent | undefined {
  return events.find((e) => e.id === id);
}

export function getUpcomingEvents(campusId: string): CampusEvent[] {
  const now = new Date();
  return getEventsByCampus(campusId).filter(
    (e) => new Date(e.startDate) > now
  );
}
