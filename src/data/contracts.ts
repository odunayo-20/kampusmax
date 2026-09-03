// ============================================================
// FREELANCE CONTRACTS DATA STORE  (Module 24)
// ============================================================
// In-memory mock store simulating the future NestJS contracts module.
// Backend-authoritative: ownership is scoped to the authenticated freelancer,
// and every state transition (accept/cancel/complete) mutates the store only
// through the mutation helpers below — never via raw status writes from the UI.

import type { Contract } from "@/types/contract";
import { CONTRACT_STATUS } from "@/types/contract";

// ── Store ───────────────────────────────────────────────────

interface ContractStoreRecord {
  contract: Contract;
}

const store = new Map<string, ContractStoreRecord>();

// ── Date helpers ────────────────────────────────────────────

function nowIso(): string {
  return new Date().toISOString();
}

function daysFromNow(n: number): string {
  return new Date(Date.now() + n * 86_400_000).toISOString();
}

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}

function freshId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function cloneContract(c: Contract): Contract {
  return JSON.parse(JSON.stringify(c));
}

// ── Action helper type ──────────────────────────────────────
// The backend decides eligibility. The store only performs transitions the
// helper functions explicitly permit, and returns a discriminated result so
// the UI never fabricates success.

export interface ActionSuccess {
  ok: true;
  contract: Contract;
}

export interface ActionFailure {
  ok: false;
  code: string;
  message: string;
}

export type ActionResult = ActionSuccess | ActionFailure;

// ── Demo owner ──────────────────────────────────────────────
// Matches the demo freelancer (Adebayo, id "u1") used by onboarding/dashboard.

const DEMO_FREELANCER_ID = "u1";

// ── Seed contracts ──────────────────────────────────────────

function pendingContract(): Contract {
  const now = daysFromNow(1);
  return {
    id: freshId("ct"),
    proposalId: "pr_001",
    projectTitle: "Website Redesign",
    status: CONTRACT_STATUS.PENDING_ACCEPTANCE,
    client: {
      id: "cl_001",
      displayName: "Acme Business Solutions",
      avatar: "",
      organization: "Acme Business Solutions",
      verified: true,
    },
    agreedAmount: 450000,
    currency: "NGN",
    startDate: now,
    deadline: daysFromNow(30),
    progress: 0,
    currentMilestone: undefined,
    nextAction: "Review and accept this contract to begin work.",
    lastActivity: daysAgo(1),
    totalMilestones: 3,
    completedMilestones: 0,
    outstandingDeliverables: 0,
    agreement: {
      scope: "Redesign the Acme Business Solutions website with a modern, mobile-first layout including a homepage, services page, project gallery, and contact form.",
      terms: "Milestone-based payments. The client will review each deliverable within 5 business days. The freelancer agrees to provide up to two rounds of revisions per milestone as described in the scope.",
      expectations: "The freelancer is expected to communicate weekly progress updates and to deliver the final source files and a deployment ready to go live.",
      deliverables: ["Responsive homepage", "Services page", "Project gallery", "Working contact form", "Source files + deployment notes"],
      conditions: [
        "All deliverables must be original and free of third-party licensing conflicts.",
        "The client will own the final deliverables after completion.",
        "Revisions beyond two rounds per milestone may be quoted separately.",
      ],
    },
    projectScope: {
      included: [
        "Up to 5 page templates",
        "Mobile and desktop responsive design",
        "2 rounds of revisions per milestone",
        "Basic on-page SEO setup",
        "Contact form with email submission",
      ],
      excluded: [
        "Copywriting of website text",
        "Custom illustrations or photography",
        "Hosting and domain registration",
        "Ongoing maintenance after launch",
      ],
      requirements: [
        "Modern, clean visual language aligned with the Acme brand",
        "Mobile-first responsive layout",
        "Fast page load performance",
        "Accessible markup (WCAG AA)",
      ],
    },
    milestones: [
      {
        id: "ms_001",
        contractId: "",
        title: "Design & Mockups",
        description: "Create wireframes and high-fidelity mockups for all pages.",
        dueDate: daysFromNow(10),
        status: "PENDING",
        progress: 0,
        deliverables: [],
      },
      {
        id: "ms_002",
        contractId: "",
        title: "Frontend Implementation",
        description: "Build the responsive frontend from the approved mockups.",
        dueDate: daysFromNow(20),
        status: "PENDING",
        progress: 0,
        deliverables: [],
      },
      {
        id: "ms_003",
        contractId: "",
        title: "Integration & Deployment",
        description: "Integrate the contact form, finalize the site, and prepare deployment.",
        dueDate: daysFromNow(30),
        status: "PENDING",
        progress: 0,
        deliverables: [],
      },
    ],
    files: [
      {
        id: "f_101",
        filename: "acme-brand-guidelines.pdf",
        fileType: "pdf",
        size: 2400000,
        uploadedBy: "Acme Business Solutions",
        uploadedAt: daysAgo(1),
        url: "/contracts/acme-brand-guidelines.pdf",
      },
    ],
    timeline: [
      {
        id: "tl_101",
        type: "CONTRACT_CREATED",
        timestamp: now,
        actor: { displayName: "Acme Business Solutions" },
        description: "Contract created from an accepted proposal.",
      },
    ],
    deliverables: [],
    canAccept: true,
    canCancel: true,
    canComplete: false,
    createdAt: now,
    updatedAt: now,
  };
}

function activeContract(): Contract {
  const now = daysFromNow(0);
  return {
    id: freshId("ct"),
    proposalId: "pr_002",
    projectTitle: "E-commerce Store Build",
    status: CONTRACT_STATUS.ACTIVE,
    client: {
      id: "cl_002",
      displayName: "StyleByChi",
      avatar: "",
      organization: "StyleByChi",
      verified: true,
    },
    agreedAmount: 600000,
    currency: "NGN",
    startDate: daysAgo(12),
    deadline: daysFromNow(18),
    progress: 66,
    currentMilestone: "Frontend Implementation",
    nextAction: "Submit the completed product listing page in Milestone 2.",
    lastActivity: daysAgo(1),
    totalMilestones: 3,
    completedMilestones: 2,
    outstandingDeliverables: 1,
    agreement: {
      scope: "Build a full e-commerce store for StyleByChi including product catalog, cart, checkout, and an admin inventory view.",
      terms: "Milestone-based with client review within 5 business days of each submission. Up to two rounds of revisions per milestone.",
      expectations: "Weekly progress updates, clean documented code, and a working storefront ready for staging deployment.",
      deliverables: ["Product catalog", "Shopping cart", "Checkout flow", "Admin inventory view", "Deployment-ready codebase"],
      conditions: [
        "The freelancer owns the code until final payment and transfer of ownership.",
        "Payments are released per approved milestone.",
      ],
    },
    projectScope: {
      included: [
        "Product catalog with search and filters",
        "Shopping cart and checkout flow",
        "Admin inventory view",
        "Responsive mobile-first design",
        "Basic payment integration",
      ],
      excluded: [
        "Custom payment gateway configuration",
        "Ongoing hosting",
        "Marketing or photography",
      ],
      requirements: [
        "Clean, maintainable code",
        "WCAG AA accessible",
        "Fast load times",
      ],
    },
    milestones: [
      {
        id: "ms_201",
        contractId: "",
        title: "Store Setup & Design",
        description: "Set up the store structure and design system with a responsive theme.",
        dueDate: daysAgo(2),
        status: "COMPLETED",
        progress: 100,
        deliverables: [
          { id: "md_201", title: "Store theme", status: "COMPLETED" },
        ],
        completedAt: daysAgo(2),
      },
      {
        id: "ms_202",
        contractId: "",
        title: "Frontend Implementation",
        description: "Build the storefront pages, product catalog, and cart interactions.",
        dueDate: daysFromNow(6),
        status: "ACTIVE",
        progress: 66,
        deliverables: [
          { id: "md_202", title: "Product listing page", status: "UNDER_REVIEW" },
          { id: "md_203", title: "Cart & checkout UI", status: "SUBMITTED" },
          { id: "md_204", title: "Product detail page", status: "DRAFT" },
        ],
      },
      {
        id: "ms_203",
        contractId: "",
        title: "Checkout & Admin Integration",
        description: "Wire the checkout flow and build the admin inventory view.",
        dueDate: daysFromNow(18),
        status: "PENDING",
        progress: 0,
        deliverables: [],
      },
    ],
    files: [
      {
        id: "f_201",
        filename: "stylebychi-logo.svg",
        fileType: "svg",
        size: 420000,
        uploadedBy: "StyleByChi",
        uploadedAt: daysAgo(10),
        url: "/contracts/stylebychi-logo.svg",
      },
      {
        id: "f_202",
        filename: "color-palette.pdf",
        fileType: "pdf",
        size: 1800000,
        uploadedBy: "StyleByChi",
        uploadedAt: daysAgo(9),
        url: "/contracts/color-palette.pdf",
      },
    ],
    timeline: [
      {
        id: "tl_201",
        type: "CONTRACT_CREATED",
        timestamp: daysAgo(12),
        actor: { displayName: "StyleByChi" },
        description: "Contract created from an accepted proposal.",
      },
      {
        id: "tl_202",
        type: "CONTRACT_ACCEPTED",
        timestamp: daysAgo(11),
        actor: { displayName: "You" },
        description: "You accepted the contract and started the project.",
      },
      {
        id: "tl_203",
        type: "MILESTONE_STARTED",
        timestamp: daysAgo(8),
        actor: { displayName: "System" },
        description: "Milestone 2 'Frontend Implementation' started.",
      },
      {
        id: "tl_204",
        type: "DELIVERABLE_SUBMITTED",
        timestamp: daysAgo(3),
        actor: { displayName: "You" },
        description: "Submitted deliverable 'Product listing page'.",
      },
      {
        id: "tl_205",
        type: "DELIVERABLE_SUBMITTED",
        timestamp: daysAgo(1),
        actor: { displayName: "You" },
        description: "Submitted deliverable 'Cart & checkout UI'.",
      },
    ],
    deliverables: [
      {
        id: "d_201",
        contractId: "",
        milestoneId: "ms_202",
        title: "Product listing page",
        description: "Responsive product grid with filters and pagination.",
        status: "UNDER_REVIEW",
        submittedAt: daysAgo(3),
        submittedMessage: "Implemented the product listing page with responsive grid, search, and category filters.",
        files: [
          { id: "f_203", filename: "product-listing.zip", fileType: "zip", size: 3400000, uploadedBy: "You", uploadedAt: daysAgo(3), url: "/contracts/product-listing.zip" },
        ],
        links: ["https://staging.stylebychi.example/product-listing"],
        clientFeedback: undefined,
        revisionCount: 0,
        createdAt: daysAgo(3),
        updatedAt: daysAgo(3),
      },
      {
        id: "d_202",
        contractId: "",
        milestoneId: "ms_202",
        title: "Cart & checkout UI",
        description: "Interactive cart drawer and checkout UI flow.",
        status: "SUBMITTED",
        submittedAt: daysAgo(1),
        submittedMessage: "Cart and checkout UI ready for review.",
        files: [
          { id: "f_204", filename: "cart-checkout.zip", fileType: "zip", size: 4100000, uploadedBy: "You", uploadedAt: daysAgo(1), url: "/contracts/cart-checkout.zip" },
        ],
        links: [],
        clientFeedback: undefined,
        revisionCount: 0,
        createdAt: daysAgo(1),
        updatedAt: daysAgo(1),
      },
    ],
    canAccept: false,
    canCancel: true,
    canComplete: false,
    createdAt: daysAgo(12),
    updatedAt: daysAgo(1),
  };
}

function completedContract(): Contract {
  const now = daysAgo(20);
  return {
    id: freshId("ct"),
    proposalId: "pr_003",
    projectTitle: "Logo & Brand Identity Package",
    status: CONTRACT_STATUS.COMPLETED,
    client: {
      id: "cl_003",
      displayName: "CampusBites",
      avatar: "",
      organization: "CampusBites",
      verified: true,
    },
    agreedAmount: 150000,
    currency: "NGN",
    startDate: daysAgo(40),
    deadline: daysAgo(20),
    progress: 100,
    currentMilestone: undefined,
    nextAction: "This contract has been completed.",
    lastActivity: daysAgo(20),
    totalMilestones: 2,
    completedMilestones: 2,
    outstandingDeliverables: 0,
    agreement: {
      scope: "Create a full brand identity package for CampusBites including logo, color palette, typography guide, and usage guidelines.",
      terms: "Single milestone with one review round. Final delivery includes editable source files.",
      expectations: "Deliver a cohesive, modern brand identity with all source files.",
      deliverables: ["Primary logo", "Logo variations", "Color palette", "Typography guide", "Usage guidelines"],
      conditions: [
        "All final source files delivered after completion.",
        "Exclusive rights transferred to CampusBites.",
      ],
    },
    projectScope: {
      included: [
        "Logo design with 3 concepts",
        "Logo variations",
        "Brand color palette",
        "Typography guide",
        "Usage guidelines document",
      ],
      excluded: ["Stationery design", "Social media kit"],
      requirements: [
        "Versatile logo usable across digital and print",
        "Scalable vector source files",
        "Clear brand usage rules",
      ],
    },
    milestones: [
      {
        id: "ms_301",
        contractId: "",
        title: "Logo Design",
        description: "Present logo concepts and refine the selected direction.",
        dueDate: daysAgo(25),
        status: "COMPLETED",
        progress: 100,
        deliverables: [
          { id: "md_301", title: "Logo concepts", status: "COMPLETED" },
        ],
        completedAt: daysAgo(25),
      },
      {
        id: "ms_302",
        contractId: "",
        title: "Brand Guidelines",
        description: "Finalize the color palette, typography, and usage guidelines.",
        dueDate: daysAgo(20),
        status: "COMPLETED",
        progress: 100,
        deliverables: [
          { id: "md_302", title: "Brand guidelines file", status: "COMPLETED" },
        ],
        completedAt: daysAgo(20),
      },
    ],
    files: [
      {
        id: "f_301",
        filename: "campusbites-brand-pack.zip",
        fileType: "zip",
        size: 8200000,
        uploadedBy: "You",
        uploadedAt: daysAgo(20),
        url: "/contracts/campusbites-brand-pack.zip",
      },
    ],
    timeline: [
      {
        id: "tl_301",
        type: "CONTRACT_CREATED",
        timestamp: daysAgo(40),
        actor: { displayName: "CampusBites" },
        description: "Contract created from an accepted proposal.",
      },
      {
        id: "tl_302",
        type: "CONTRACT_ACCEPTED",
        timestamp: daysAgo(39),
        actor: { displayName: "You" },
        description: "You accepted the contract.",
      },
      {
        id: "tl_303",
        type: "DELIVERABLE_APPROVED",
        timestamp: daysAgo(22),
        actor: { displayName: "CampusBites" },
        description: "Milestone 1 approved.",
      },
      {
        id: "tl_304",
        type: "PROJECT_COMPLETED",
        timestamp: daysAgo(20),
        actor: { displayName: "System" },
        description: "Contract marked complete.",
      },
    ],
    deliverables: [
      {
        id: "d_301",
        contractId: "",
        milestoneId: "ms_302",
        title: "Brand guidelines file",
        description: "Final brand identity PDF with all guidelines.",
        status: "COMPLETED",
        submittedAt: daysAgo(20),
        submittedMessage: "Here is the complete brand identity package.",
        files: [
          { id: "f_302", filename: "campusbites-brand-pack.zip", fileType: "zip", size: 8200000, uploadedBy: "You", uploadedAt: daysAgo(20), url: "/contracts/campusbites-brand-pack.zip" },
        ],
        links: [],
        clientFeedback: undefined,
        revisionCount: 0,
        createdAt: daysAgo(21),
        updatedAt: daysAgo(20),
      },
    ],
    canAccept: false,
    canCancel: false,
    canComplete: false,
    createdAt: daysAgo(40),
    updatedAt: daysAgo(20),
  };
}

function disputedContract(): Contract {
  const now = daysAgo(5);
  return {
    id: freshId("ct"),
    proposalId: "pr_004",
    projectTitle: "Mobile App Prototype",
    status: CONTRACT_STATUS.DISPUTED,
    client: {
      id: "cl_004",
      displayName: "TechStart Accelerator",
      avatar: "",
      organization: "TechStart Accelerator",
      verified: true,
    },
    agreedAmount: 380000,
    currency: "NGN",
    startDate: daysAgo(25),
    deadline: daysFromNow(5),
    progress: 40,
    currentMilestone: "UI Prototype",
    nextAction: "This contract is under dispute review.",
    lastActivity: daysAgo(5),
    totalMilestones: 2,
    completedMilestones: 1,
    outstandingDeliverables: 1,
    agreement: {
      scope: "Design an interactive mobile app prototype for a campus services platform.",
      terms: "Milestone-based. Client review within 5 business days.",
      expectations: "Deliver an interactive Figma prototype and a style guide.",
      deliverables: ["UI prototype", "Style guide", "Interaction map"],
      conditions: [
        "Prototype deliverables submitted as shareable Figma links.",
      ],
    },
    projectScope: {
      included: ["Interactive prototype", "Style guide", "Interaction map"],
      excluded: ["Development handoff", "Backend APIs"],
      requirements: ["High-fidelity screens", "Usable interactive flows"],
    },
    milestones: [
      {
        id: "ms_401",
        contractId: "",
        title: "Discovery & Wireframes",
        description: "Gather requirements and create wireframes.",
        dueDate: daysAgo(10),
        status: "COMPLETED",
        progress: 100,
        deliverables: [
          { id: "md_401", title: "Wireframes", status: "COMPLETED" },
        ],
        completedAt: daysAgo(10),
      },
      {
        id: "ms_402",
        contractId: "",
        title: "UI Prototype",
        description: "Build the high-fidelity interactive prototype.",
        dueDate: daysFromNow(5),
        status: "UNDER_REVIEW",
        progress: 40,
        deliverables: [
          { id: "md_402", title: "High-fidelity screens", status: "REVISION_REQUESTED" },
        ],
      },
    ],
    files: [
      {
        id: "f_401",
        filename: "techstart-brand.pdf",
        fileType: "pdf",
        size: 1200000,
        uploadedBy: "TechStart Accelerator",
        uploadedAt: daysAgo(20),
        url: "/contracts/techstart-brand.pdf",
      },
    ],
    timeline: [
      {
        id: "tl_401",
        type: "CONTRACT_CREATED",
        timestamp: daysAgo(25),
        actor: { displayName: "TechStart Accelerator" },
        description: "Contract created from an accepted proposal.",
      },
      {
        id: "tl_402",
        type: "DISPUTE_OPENED",
        timestamp: daysAgo(5),
        actor: { displayName: "TechStart Accelerator" },
        description: "A dispute was opened by the client.",
      },
    ],
    deliverables: [
      {
        id: "d_401",
        contractId: "",
        milestoneId: "ms_402",
        title: "High-fidelity screens",
        description: "High-fidelity prototype screens for the main flows.",
        status: "REVISION_REQUESTED",
        submittedAt: daysAgo(6),
        submittedMessage: "Initial high-fidelity screens ready for review.",
        files: [
          { id: "f_402", filename: "screens-figma-link.txt", fileType: "txt", size: 200, uploadedBy: "You", uploadedAt: daysAgo(6), url: "/contracts/screens-figma-link.txt" },
        ],
        links: ["https://figma.example/protos/techstart-screens"],
        clientFeedback: "The screens do not match the approved wireframes closely enough.",
        revisionCount: 1,
        createdAt: daysAgo(6),
        updatedAt: daysAgo(5),
      },
    ],
    canAccept: false,
    canCancel: false,
    canComplete: false,
    disputeStatus: "UNDER_REVIEW",
    createdAt: daysAgo(25),
    updatedAt: daysAgo(5),
  };
}

// ── Seed store at module load ───────────────────────────────

store.set(freshId("ct"), { contract: pendingContract() });
store.set(freshId("ct"), { contract: activeContract() });
store.set(freshId("ct"), { contract: completedContract() });
store.set(freshId("ct"), { contract: disputedContract() });

// ── Store API ───────────────────────────────────────────────

/** Returns all contracts owned by the given freelancer (backend-scoped). */
export function getContractsForFreelancer(userId: string): Contract[] {
  // Demo store: same set regardless of id for the seeded user.
  if (userId !== DEMO_FREELANCER_ID) return [];
  return Array.from(store.values()).map((r) => cloneContract(r.contract));
}

/** Returns a single contract by id if it belongs to the freelancer. */
export function getContractForFreelancer(userId: string, contractId: string): Contract | null {
  if (userId !== DEMO_FREELANCER_ID) return null;
  const rec = Array.from(store.values()).find((r) => r.contract.id === contractId);
  return rec ? cloneContract(rec.contract) : null;
}

/** Backend-authoritative acceptance. */
export function acceptContract(userId: string, contractId: string): ActionResult {
  if (userId !== DEMO_FREELANCER_ID) {
    return { ok: false, code: "FORBIDDEN", message: "You are not permitted to perform this action." };
  }
  const rec = Array.from(store.values()).find((r) => r.contract.id === contractId);
  if (!rec) {
    return { ok: false, code: "NOT_FOUND", message: "Contract not found." };
  }
  const c = rec.contract;
  if (!c.canAccept) {
    return { ok: false, code: "STATE_CONFLICT", message: "This contract is no longer awaiting acceptance." };
  }
  c.status = CONTRACT_STATUS.ACTIVE;
  c.canAccept = false;
  c.progress = 0;
  c.currentMilestone = c.milestones[0]?.title;
  if (c.milestones[0]) {
    c.milestones[0] = { ...c.milestones[0], status: "ACTIVE" };
  }
  c.nextAction = "Your project is ready to begin. Start with the first milestone.";
  c.updatedAt = nowIso();
  c.timeline = [
    ...c.timeline,
    {
      id: freshId("tl"),
      type: "CONTRACT_ACCEPTED",
      timestamp: nowIso(),
      actor: { displayName: "You" },
      description: "You accepted the contract and the project is ready to begin.",
    },
  ];
  return { ok: true, contract: cloneContract(c) };
}

/** Backend-authoritative cancellation request. */
export function cancelContract(userId: string, contractId: string, reason: string): ActionResult {
  if (userId !== DEMO_FREELANCER_ID) {
    return { ok: false, code: "FORBIDDEN", message: "You are not permitted to perform this action." };
  }
  const rec = Array.from(store.values()).find((r) => r.contract.id === contractId);
  if (!rec) {
    return { ok: false, code: "NOT_FOUND", message: "Contract not found." };
  }
  const c = rec.contract;
  if (!c.canCancel) {
    return { ok: false, code: "STATE_CONFLICT", message: "Cancellation is not permitted for this contract." };
  }
  c.status = CONTRACT_STATUS.CANCELLED;
  c.canCancel = false;
  c.cancellationReason = reason;
  c.nextAction = "This contract has been cancelled.";
  c.updatedAt = nowIso();
  c.timeline = [
    ...c.timeline,
    {
      id: freshId("tl"),
      type: "CONTRACT_CANCELLED",
      timestamp: nowIso(),
      actor: { displayName: "You" },
      description: "You requested cancellation of this contract.",
    },
  ];
  return { ok: true, contract: cloneContract(c) };
}

/** Backend-authoritative completion. */
export function completeContract(userId: string, contractId: string): ActionResult {
  if (userId !== DEMO_FREELANCER_ID) {
    return { ok: false, code: "FORBIDDEN", message: "You are not permitted to perform this action." };
  }
  const rec = Array.from(store.values()).find((r) => r.contract.id === contractId);
  if (!rec) {
    return { ok: false, code: "NOT_FOUND", message: "Contract not found." };
  }
  const c = rec.contract;
  if (!c.canComplete) {
    return { ok: false, code: "STATE_CONFLICT", message: "This contract cannot be marked complete right now." };
  }
  c.status = CONTRACT_STATUS.COMPLETED;
  c.canComplete = false;
  c.progress = 100;
  c.completedMilestones = c.totalMilestones;
  c.nextAction = "This contract has been completed.";
  c.updatedAt = nowIso();
  c.timeline = [
    ...c.timeline,
    {
      id: freshId("tl"),
      type: "PROJECT_COMPLETED",
      timestamp: nowIso(),
      actor: { displayName: "You" },
      description: "You marked the project work as complete.",
    },
  ];
  return { ok: true, contract: cloneContract(c) };
}

/** Backend-authoritative deliverable submission. */
export function submitDeliverable(
  userId: string,
  contractId: string,
  milestoneId: string,
  payload: {
    title: string;
    description: string;
    message?: string;
    links?: string[];
  }
): ActionResult {
  if (userId !== DEMO_FREELANCER_ID) {
    return { ok: false, code: "FORBIDDEN", message: "You are not permitted to perform this action." };
  }
  const rec = Array.from(store.values()).find((r) => r.contract.id === contractId);
  if (!rec) {
    return { ok: false, code: "NOT_FOUND", message: "Contract not found." };
  }
  const c = rec.contract;
  if (c.status === CONTRACT_STATUS.COMPLETED || c.status === CONTRACT_STATUS.CANCELLED) {
    return { ok: false, code: "STATE_CONFLICT", message: "This contract is no longer active." };
  }
  const milestone = c.milestones.find((m) => m.id === milestoneId);
  if (!milestone) {
    return { ok: false, code: "NOT_FOUND", message: "Milestone not found." };
  }
  if (milestone.status === "COMPLETED") {
    return { ok: false, code: "STATE_CONFLICT", message: "This milestone is already completed." };
  }

  const del: Contract["deliverables"][number] = {
    id: freshId("d"),
    contractId,
    milestoneId,
    title: payload.title.trim(),
    description: payload.description.trim(),
    status: "SUBMITTED",
    submittedAt: nowIso(),
    submittedMessage: payload.message?.trim() || undefined,
    files: [],
    links: payload.links?.filter((l) => l.trim().length > 0) ?? [],
    revisionCount: 0,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  c.deliverables = [del, ...c.deliverables];
  milestone.deliverables = [
    ...milestone.deliverables,
    { id: del.id, title: del.title, status: del.status },
  ];
  milestone.status = "SUBMITTED";
  c.status = CONTRACT_STATUS.AWAITING_CLIENT_REVIEW;
  c.nextAction = "Your deliverable is now under client review.";
  c.updatedAt = nowIso();
  c.timeline = [
    ...c.timeline,
    {
      id: freshId("tl"),
      type: "DELIVERABLE_SUBMITTED",
      timestamp: nowIso(),
      actor: { displayName: "You" },
      description: `Submitted deliverable "${del.title}" in milestone "${milestone.title}".`,
      milestoneId: milestone.id,
      deliverableId: del.id,
    },
  ];
  return { ok: true, contract: cloneContract(c) };
}

/** Backend-authoritative deliverable resubmission (revision). */
export function resubmitDeliverable(
  userId: string,
  contractId: string,
  deliverableId: string,
  payload: {
    message: string;
    links?: string[];
  }
): ActionResult {
  if (userId !== DEMO_FREELANCER_ID) {
    return { ok: false, code: "FORBIDDEN", message: "You are not permitted to perform this action." };
  }
  const rec = Array.from(store.values()).find((r) => r.contract.id === contractId);
  if (!rec) {
    return { ok: false, code: "NOT_FOUND", message: "Contract not found." };
  }
  const c = rec.contract;
  const del = c.deliverables.find((d) => d.id === deliverableId);
  if (!del) {
    return { ok: false, code: "NOT_FOUND", message: "Deliverable not found." };
  }
  if (del.status !== "REVISION_REQUESTED" && del.status !== "REJECTED") {
    return { ok: false, code: "STATE_CONFLICT", message: "This deliverable is not awaiting a revision." };
  }
  del.status = "SUBMITTED";
  del.submittedMessage = payload.message.trim();
  del.links = payload.links?.filter((l) => l.trim().length > 0) ?? [];
  del.revisionCount = (del.revisionCount ?? 0) + 1;
  del.updatedAt = nowIso();

  const milestone = c.milestones.find((m) => m.id === del.milestoneId);
  if (milestone) {
    milestone.status = "SUBMITTED";
    const md = milestone.deliverables.find((x) => x.id === del.id);
    if (md) md.status = del.status;
  }
  c.status = CONTRACT_STATUS.AWAITING_CLIENT_REVIEW;
  c.nextAction = "Your revised deliverable is now under client review.";
  c.updatedAt = nowIso();
  c.timeline = [
    ...c.timeline,
    {
      id: freshId("tl"),
      type: "DELIVERABLE_RESUBMITTED",
      timestamp: nowIso(),
      actor: { displayName: "You" },
      description: `Resubmitted deliverable "${del.title}".`,
      milestoneId: del.milestoneId,
      deliverableId: del.id,
    },
  ];
  return { ok: true, contract: cloneContract(c) };
}

export { cloneContract };
