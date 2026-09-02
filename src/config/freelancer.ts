// ============================================================
// FREELANCER ONBOARDING CONFIG  (Module 22)
// ============================================================
// Presentation constants for the freelancer onboarding module:
// categories + skills, work arrangements, project types, and
// availability options. All backend-authoritative.

import type { FreelancerAvailabilityStatus } from "@/types/freelancer";

// ── Freelancer categories & skills ──────────────────────────

export interface FreelancerCategory {
  id: string;
  name: string;
  skills: string[];
}

export const FREELANCER_CATEGORIES: FreelancerCategory[] = [
  { id: "fc1", name: "Web Development", skills: ["React", "Next.js", "Vue.js", "Angular", "HTML/CSS", "JavaScript", "TypeScript", "Node.js", "PHP", "Laravel", "Django", "WordPress"] },
  { id: "fc2", name: "Mobile Development", skills: ["React Native", "Flutter", "Swift", "Kotlin", "iOS", "Android", "Expo", "Ionic"] },
  { id: "fc3", name: "UI/UX Design", skills: ["Figma", "Adobe XD", "Sketch", "Prototyping", "Wireframing", "User Research", "Design Systems"] },
  { id: "fc4", name: "Graphics Design", skills: ["Adobe Photoshop", "Illustrator", "Canva", "InDesign", "Brand Identity", "Logo Design", "Print Design"] },
  { id: "fc5", name: "Writing & Content", skills: ["Copywriting", "Content Writing", "Blog Writing", "Technical Writing", "SEO Writing", "Editing", "Proofreading"] },
  { id: "fc6", name: "Photography & Video", skills: ["Photography", "Videography", "Video Editing", "Adobe Premiere", "Final Cut Pro", "Drone Photography", "Photo Editing"] },
  { id: "fc7", name: "Digital Marketing", skills: ["Social Media Marketing", "Google Ads", "Facebook Ads", "SEO", "Email Marketing", "Content Strategy", "Analytics"] },
  { id: "fc8", name: "Data Science & AI", skills: ["Python", "Machine Learning", "Data Analysis", "TensorFlow", "SQL", "R", "Power BI", "Excel"] },
  { id: "fc9", name: "Music & Audio", skills: ["Audio Production", "Mixing", "Mastering", "Voice Over", "Podcast Production", "Beat Making", "Sound Design"] },
  { id: "fc10", name: "Tutoring & Education", skills: ["Mathematics", "Physics", "Chemistry", "English", "Programming", "Exam Prep", "Language Teaching"] },
  { id: "fc11", name: "Virtual Assistance", skills: ["Data Entry", "Scheduling", "Email Management", "Research", "Customer Support", "Bookkeeping"] },
  { id: "fc12", name: "Business & Consulting", skills: ["Business Strategy", "Financial Planning", "Project Management", "HR Consulting", "Legal Consulting", "Market Research"] },
];

// ── Work arrangements ───────────────────────────────────────

export const FREELANCER_WORK_ARRANGEMENTS = [
  { value: "remote", label: "Remote" },
  { value: "on_campus", label: "On-campus" },
  { value: "on_site", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
] as const;

// ── Project types ───────────────────────────────────────────

export const FREELANCER_PROJECT_TYPES = [
  { value: "short_term", label: "Short-term projects" },
  { value: "long_term", label: "Long-term contracts" },
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
] as const;

// ── Working days ────────────────────────────────────────────

export const FREELANCER_WORKING_DAYS = [
  { value: "mon", label: "Mon" },
  { value: "tue", label: "Tue" },
  { value: "wed", label: "Wed" },
  { value: "thu", label: "Thu" },
  { value: "fri", label: "Fri" },
  { value: "sat", label: "Sat" },
  { value: "sun", label: "Sun" },
] as const;

// ── Availability status ─────────────────────────────────────

export const FREELANCER_AVAILABILITY_OPTIONS: { value: FreelancerAvailabilityStatus; label: string; description: string }[] = [
  { value: "available_now", label: "Available now", description: "Ready to start taking projects immediately" },
  { value: "available_later", label: "Available later", description: "Planning to start in the near future" },
  { value: "not_available", label: "Not currently available", description: "Setting up profile for later" },
];

// ── Employment types (for experience) ───────────────────────

export const FREELANCER_EMPLOYMENT_TYPES = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "freelance", label: "Freelance" },
  { value: "internship", label: "Internship" },
  { value: "self_employed", label: "Self-employed" },
] as const;

// ── Qualifications (for education) ──────────────────────────

export const FREELANCER_QUALIFICATIONS = [
  { value: "certificate", label: "Certificate" },
  { value: "diploma", label: "Diploma" },
  { value: "nd", label: "National Diploma (ND)" },
  { value: "hnd", label: "Higher National Diploma (HND)" },
  { value: "bsc", label: "Bachelor's Degree (B.Sc)" },
  { value: "ba", label: "Bachelor of Arts (B.A)" },
  { value: "eng", label: "Bachelor of Engineering (B.Eng)" },
  { value: "msc", label: "Master's Degree (M.Sc)" },
  { value: "mba", label: "MBA" },
  { value: "phd", label: "Ph.D" },
  { value: "other", label: "Other" },
] as const;
