import { CampusPost, Comment } from "@/types";

export const comments: Comment[] = [
  // cp1 - marketplace
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
  // cp2 - event
  {
    id: "cm3",
    postId: "cp2",
    userId: "u1",
    text: "Great event! I'll be there with my laptop.",
    createdAt: "2025-01-15T11:00:00Z",
    likes: 2,
    isLiked: false,
  },
  // cp3 - discussion
  {
    id: "cm4",
    postId: "cp3",
    userId: "u2",
    text: "I have some items to sell too. Can I join?",
    createdAt: "2025-01-16T10:00:00Z",
    likes: 4,
    isLiked: false,
  },
  // cp4 - question
  {
    id: "cm5",
    postId: "cp4",
    userId: "u4",
    text: "Has anyone tried the new suya spot near the library? Is it good?",
    createdAt: "2025-01-15T18:30:00Z",
    likes: 5,
    isLiked: true,
  },
  // cp6 - discussion (campus life)
  {
    id: "cm6",
    postId: "cp6",
    userId: "u1",
    text: "The Wi-Fi at the library is actually fast now. They upgraded the routers last week!",
    createdAt: "2025-01-17T09:15:00Z",
    likes: 7,
    isLiked: false,
  },
  {
    id: "cm7",
    postId: "cp6",
    userId: "u3",
    text: "About time! I remember when it used to take 5 minutes to load a page.",
    createdAt: "2025-01-17T09:30:00Z",
    likes: 3,
    isLiked: false,
  },
  // cp7 - image (campus vibes)
  {
    id: "cm8",
    postId: "cp7",
    userId: "u5",
    text: "Beautiful shot! The campus looks amazing at sunset.",
    createdAt: "2025-01-18T17:45:00Z",
    likes: 6,
    isLiked: true,
  },
  {
    id: "cm9",
    postId: "cp7",
    userId: "u2",
    text: "RUGIPO never looked this good! 📸",
    createdAt: "2025-01-18T18:00:00Z",
    likes: 4,
    isLiked: false,
  },
  // cp8 - lost_found
  {
    id: "cm10",
    postId: "cp8",
    userId: "u5",
    text: "I think I saw someone drop a black bag near the cafeteria yesterday. I'll check if it's still there.",
    createdAt: "2025-01-19T10:00:00Z",
    likes: 2,
    isLiked: false,
  },
  // cp9 - poll
  {
    id: "cm11",
    postId: "cp9",
    userId: "u4",
    text: "We should also consider having it on Friday evenings so more people can attend.",
    createdAt: "2025-01-20T14:00:00Z",
    likes: 5,
    isLiked: false,
  },
  // cp10 - marketplace (power banks)
  {
    id: "cm12",
    postId: "cp10",
    userId: "u1",
    text: "Do they support iPhone fast charging? I need one urgently.",
    createdAt: "2025-01-13T15:00:00Z",
    likes: 1,
    isLiked: false,
  },
  // cp11 - discussion (exam prep)
  {
    id: "cm13",
    postId: "cp11",
    userId: "u2",
    text: "Engineering Maths is the hardest. Does anyone have past questions from 2023?",
    createdAt: "2025-01-21T11:00:00Z",
    likes: 8,
    isLiked: true,
  },
  {
    id: "cm14",
    postId: "cp11",
    userId: "u3",
    text: "I have some! I'll upload them to the study group chat.",
    createdAt: "2025-01-21T11:30:00Z",
    likes: 12,
    isLiked: false,
  },
  // cp12 - lost_found (found phone)
  {
    id: "cm15",
    postId: "cp12",
    userId: "u1",
    text: "That might be my friend's phone! He lost a Samsung near the admin block last week. I'll tell him to contact you.",
    createdAt: "2025-01-20T16:00:00Z",
    likes: 3,
    isLiked: false,
  },
];

export const campusPosts: CampusPost[] = [
  // ── MARKETPLACE ──
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
    id: "cp10",
    userId: "u3",
    campusId: "rugipo",
    type: "marketplace",
    title: "New batch of power banks available",
    content:
      "Just got a new batch of MEGA 20000mAh power banks. Fast charging, dual USB. Limited stock! Available at TechHub Owo stall near Main Gate.",
    tags: ["power bank", "electronics", "gadgets"],
    likes: 8,
    commentCount: 1,
    createdAt: "2025-01-13T14:00:00Z",
    productId: "p10",
  },
  {
    id: "cp13",
    userId: "u5",
    campusId: "rugipo",
    type: "marketplace",
    title: "Nike Air Max 90 - barely worn",
    content:
      "Size 43, White/Black colorway. Worn only twice, still in original box. Asking 25,000. Can deliver to any RUGIPO hostel.",
    images: [],
    tags: ["sneakers", "fashion", "nike"],
    likes: 15,
    commentCount: 3,
    isLiked: true,
    createdAt: "2025-01-22T09:00:00Z",
    productId: "p5",
  },

  // ── EVENT ──
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
    id: "cp14",
    userId: "u2",
    campusId: "rugipo",
    type: "event",
    title: "Campus Fashion Show - Express Yourself!",
    content:
      "RUGIPO's first fashion show! Showcase your style on the runway. Categories: Traditional, Casual, Formal, and Creative. Prizes for winners! Register at the Student Union.",
    tags: ["fashion", "show", "campus life"],
    likes: 22,
    commentCount: 5,
    createdAt: "2025-01-23T10:00:00Z",
    eventId: "e5",
  },

  // ── DISCUSSION ──
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
    id: "cp6",
    userId: "u3",
    campusId: "rugipo",
    type: "discussion",
    title: "Library Wi-Fi upgrade - finally!",
    content:
      "Has anyone noticed the library Wi-Fi is actually usable now? They finally upgraded the routers. I downloaded an entire textbook in under 2 minutes. About time RUGIPO invested in decent internet!",
    tags: ["campus life", "library", "wifi"],
    likes: 34,
    commentCount: 2,
    createdAt: "2025-01-17T09:00:00Z",
  },
  {
    id: "cp11",
    userId: "u4",
    campusId: "rugipo",
    type: "discussion",
    title: "Exam preparation tips - share yours!",
    content:
      "Exams are coming up fast! Let's share our best study tips. I personally find that making summary sheets works best for me. What about you guys?",
    tags: ["exams", "study tips", "academic"],
    likes: 28,
    commentCount: 2,
    createdAt: "2025-01-21T10:00:00Z",
  },

  // ── QUESTION ──
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
    id: "cp15",
    userId: "u1",
    campusId: "rugipo",
    type: "question",
    title: "Where can I print cheaply near campus?",
    content:
      "Need to print about 50 pages for my project. The library printer is always jammed. Any recommendations for affordable print shops near the main gate?",
    tags: ["printing", "campus life", "recommendations"],
    likes: 11,
    commentCount: 4,
    createdAt: "2025-01-24T08:00:00Z",
  },

  // ── IMAGE ──
  {
    id: "cp7",
    userId: "u2",
    campusId: "rugipo",
    type: "image",
    title: "RUGIPO sunset from the admin block 🌅",
    content:
      "Caught this beautiful sunset during the evening rush. RUGIPO campus really has some hidden gems for photography.",
    images: [],
    tags: ["campus vibes", "photography", "sunset"],
    likes: 42,
    commentCount: 2,
    isLiked: true,
    createdAt: "2025-01-18T17:30:00Z",
  },
  {
    id: "cp16",
    userId: "u4",
    campusId: "rugipo",
    type: "image",
    title: "New computer lab is ready! 💻",
    content:
      "The new Computer Science lab at Block C is finally open. 40 brand new desktops, fast internet, and air conditioning. Best place to study on campus now!",
    images: [],
    tags: ["campus", "computer lab", "study"],
    likes: 56,
    commentCount: 8,
    createdAt: "2025-01-25T14:00:00Z",
  },

  // ── LOST & FOUND ──
  {
    id: "cp8",
    userId: "u4",
    campusId: "rugipo",
    type: "lost_found",
    title: "Lost: Black Samsung Galaxy S24 near Engineering block",
    content:
      "I lost my black Samsung Galaxy S24 near the Engineering block yesterday around 3pm. It has a blue case with a small crack on the back. If found, please contact me or drop it at the security office. Reward offered!",
    tags: ["lost", "phone", "samsung"],
    likes: 8,
    commentCount: 1,
    createdAt: "2025-01-19T09:00:00Z",
    lostFound: {
      id: "lf1",
      status: "open",
      itemDescription: "Black Samsung Galaxy S24 with blue cracked case",
      location: "Engineering block",
      dateReported: "2025-01-19",
      contactInfo: "DM or security office",
    },
  },
  {
    id: "cp12",
    userId: "u5",
    campusId: "rugipo",
    type: "lost_found",
    title: "Found: Student ID card near cafeteria",
    content:
      "Found a student ID card near the cafeteria this morning. Name starts with 'A' - looks like it belongs to someone from the Science faculty. Please claim it at the Student Union office.",
    tags: ["found", "id card", "campus"],
    likes: 14,
    commentCount: 1,
    createdAt: "2025-01-20T14:00:00Z",
    lostFound: {
      id: "lf2",
      status: "open",
      itemDescription: "Student ID card (Science faculty)",
      location: "Cafeteria",
      dateReported: "2025-01-20",
      contactInfo: "Student Union office",
    },
  },

  // ── POLL ──
  {
    id: "cp9",
    userId: "u2",
    campusId: "rugipo",
    type: "poll",
    title: "When should we have the next campus hangout?",
    content:
      "Let's vote on the best day for our next campus hangout! We're thinking of organizing a fun day with games, music, and free food.",
    tags: ["campus life", "hangout", "social"],
    likes: 19,
    commentCount: 1,
    createdAt: "2025-01-20T12:00:00Z",
    poll: {
      id: "pol1",
      question: "Best day for the next campus hangout?",
      options: [
        { id: "po1", text: "Friday evening", votes: ["u1", "u2", "u4"] },
        { id: "po2", text: "Saturday afternoon", votes: ["u3"] },
        { id: "po3", text: "Sunday evening", votes: ["u5"] },
        { id: "po4", text: "Any day works!", votes: [] },
      ],
      totalVotes: 5,
      endsAt: "2025-02-01T00:00:00Z",
      isAnonymous: false,
    },
  },
  {
    id: "cp17",
    userId: "u1",
    campusId: "rugipo",
    type: "poll",
    title: "Which course needs the most study group support?",
    content:
      "We're setting up study groups for exam prep. Vote for the course you think needs the most help!",
    tags: ["study", "exams", "academic"],
    likes: 23,
    commentCount: 2,
    createdAt: "2025-01-22T16:00:00Z",
    poll: {
      id: "pol2",
      question: "Which course needs the most study group support?",
      options: [
        { id: "po5", text: "Engineering Mathematics", votes: ["u1", "u4", "u5"] },
        { id: "po6", text: "Computer Programming", votes: ["u2"] },
        { id: "po7", text: "Business Economics", votes: ["u3"] },
        { id: "po8", text: "Technical Drawing", votes: [] },
      ],
      totalVotes: 5,
      endsAt: "2025-02-05T00:00:00Z",
      isAnonymous: false,
    },
  },

  // ── ANNOUNCEMENT ──
  {
    id: "cp18",
    userId: "u1",
    campusId: "rugipo",
    type: "announcement",
    title: "Mid-Semester Break Notice",
    content:
      "The management has approved a one-week mid-semester break starting February 3rd. All lectures are suspended. Students are advised to use the break productively. Classes resume February 10th.",
    tags: ["admin", "break", "important"],
    likes: 67,
    commentCount: 12,
    createdAt: "2025-01-25T08:00:00Z",
    announcement: {
      id: "ann1",
      campusId: "rugipo",
      title: "Mid-Semester Break Notice",
      content:
        "The management has approved a one-week mid-semester break starting February 3rd. All lectures are suspended.",
      authorId: "u1",
      priority: "urgent",
      expiresAt: "2025-02-10T00:00:00Z",
      createdAt: "2025-01-25T08:00:00Z",
    },
  },
  {
    id: "cp19",
    userId: "u3",
    campusId: "rugipo",
    type: "announcement",
    title: "New Shuttle Routes Available",
    content:
      "Starting next week, two new shuttle routes will be available: Route C (Hostels ↔ Main Gate via Library) and Route D (Engineering Block ↔ Cafeteria). Shuttle runs every 30 minutes from 7am-7pm.",
    tags: ["shuttle", "transport", "campus"],
    likes: 31,
    commentCount: 6,
    createdAt: "2025-01-26T10:00:00Z",
    announcement: {
      id: "ann2",
      campusId: "rugipo",
      title: "New Shuttle Routes Available",
      content:
        "Two new shuttle routes starting next week. Route C and Route D.",
      authorId: "u3",
      priority: "info",
      expiresAt: "2025-03-01T00:00:00Z",
      createdAt: "2025-01-26T10:00:00Z",
    },
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
  return comments
    .filter((c) => c.postId === postId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
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
