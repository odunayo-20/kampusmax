import { CampusPost, Comment } from "@/types";

export const comments: Comment[] = [
  {
    id: "cm1",
    postId: "cp1",
    userId: "u4",
    text: "This is so helpful! I've been looking for this textbook.",
    createdAt: "2025-01-14T11:30:00Z",
    likes: 3,
    isLiked: false,
  },
  {
    id: "cm2",
    postId: "cp1",
    userId: "u3",
    text: "Is the calculator still available? I need one for my exams.",
    createdAt: "2025-01-14T12:00:00Z",
    likes: 1,
    isLiked: true,
  },
  {
    id: "cm3",
    postId: "cp2",
    userId: "u1",
    text: "Great event! I'll be there with my laptop.",
    createdAt: "2025-01-15T11:00:00Z",
    likes: 2,
    isLiked: false,
  },
  {
    id: "cm4",
    postId: "cp3",
    userId: "u2",
    text: "I have some items to sell too. Can I join?",
    createdAt: "2025-01-16T10:00:00Z",
    likes: 4,
    isLiked: false,
  },
  {
    id: "cm5",
    postId: "cp4",
    userId: "u4",
    text: "Has anyone tried the new suya spot near the library? Is it good?",
    createdAt: "2025-01-15T18:30:00Z",
    likes: 5,
    isLiked: true,
  },
];

export const campusPosts: CampusPost[] = [
  {
    id: "cp1",
    userId: "u1",
    campusId: "rugipo",
    type: "marketplace",
    title: "Selling my Engineering Mathematics textbook",
    content:
      "Selling Advanced Engineering Mathematics by Kreyszig, 10th Edition. Slightly used with minor highlighting. Perfect for Engineering and Science students. Price: 8,500 (negotiable). DM me or check my store on Kampmax.",
    tags: ["textbook", "engineering", "mathematics"],
    likes: 12,
    commentCount: 2,
    isLiked: false,
    createdAt: "2025-01-14T10:00:00Z",
    productId: "p1",
  },
  {
    id: "cp2",
    userId: "u1",
    campusId: "rugipo",
    type: "event",
    title: "Tech Meetup: Introduction to Web Development",
    content:
      "Hey everyone! I'm organizing a tech meetup at Computer Lab 3 next week. We'll cover HTML, CSS, and JavaScript basics. Bring your laptop! All departments welcome.",
    tags: ["tech", "web development", "meetup"],
    likes: 18,
    commentCount: 1,
    isLiked: true,
    createdAt: "2025-01-15T09:00:00Z",
    eventId: "e2",
  },
  {
    id: "cp3",
    userId: "u5",
    campusId: "rugipo",
    type: "discussion",
    title: "End of Semester Sale - Vendors Welcome!",
    content:
      "Calling all vendors! We're organizing a massive end-of-semester sale at the Student Union Building on January 20th. If you want a stall, DM me. Buyers, come ready to shop!",
    tags: ["sale", "vendors", "marketplace"],
    likes: 25,
    commentCount: 1,
    createdAt: "2025-01-14T08:00:00Z",
  },
  {
    id: "cp4",
    userId: "u4",
    campusId: "rugipo",
    type: "question",
    title: "Best food spots on RUGIPO campus?",
    content:
      "I just resumed at RUGIPO and I'm looking for the best food spots on campus. Where do you guys get your meals? I've heard CampusBites is good but looking for more options.",
    tags: ["food", "campus life", "recommendations"],
    likes: 30,
    commentCount: 1,
    createdAt: "2025-01-15T17:00:00Z",
  },
  {
    id: "cp5",
    userId: "u3",
    campusId: "rugipo",
    type: "marketplace",
    title: "New batch of power banks available",
    content:
      "Just got a new batch of MEGA 20000mAh power banks. Fast charging, dual USB. Limited stock! Available at TechHub Owo stall near Main Gate.",
    tags: ["power bank", "electronics", "gadgets"],
    likes: 8,
    commentCount: 0,
    createdAt: "2025-01-13T14:00:00Z",
    productId: "p10",
  },
];

export function getCampusPosts(campusId: string): CampusPost[] {
  return campusPosts
    .filter((p) => p.campusId === campusId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export function getCampusPostById(id: string): CampusPost | undefined {
  return campusPosts.find((p) => p.id === id);
}

export function getCommentsByPost(postId: string): Comment[] {
  return comments.filter((c) => c.postId === postId);
}

export function getPostsByUser(userId: string): CampusPost[] {
  return campusPosts.filter((p) => p.userId === userId);
}

export function getPostsByType(
  campusId: string,
  type: CampusPost["type"]
): CampusPost[] {
  return getCampusPosts(campusId).filter((p) => p.type === type);
}
