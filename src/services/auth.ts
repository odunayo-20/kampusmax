import {
  AuthUser,
  RegisterData,
  LoginData,
  ForgotPasswordData,
  ResetPasswordData,
  VerifyOtpData,
} from "@/types";
import { updateSecuritySettings } from "@/services/profile";

// ============================================================
// MOCK DELAY — simulates network latency
// ============================================================

function delay(ms: number = 800): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================
// MOCK REGISTERED USERS (in-memory)
// ============================================================

const mockRegisteredUsers: AuthUser[] = [
  {
    id: "u1",
    name: "Adebayo Oluwaseun",
    email: "adebayo@rugipo.edu.ng",
    phone: "+2348123456789",
    campusId: "rugipo",
    role: "student",
    avatar: "",
    isVerified: true,
  },
  {
    id: "u2",
    name: "Chioma Nwosu",
    email: "chioma@rugipo.edu.ng",
    phone: "+2348134567890",
    campusId: "rugipo",
    role: "vendor",
    avatar: "",
    isVerified: true,
  },
  {
    id: "u3",
    name: "Ibrahim Musa",
    email: "ibrahim@rugipo.edu.ng",
    phone: "+2348145678901",
    campusId: "rugipo",
    role: "vendor",
    avatar: "",
    isVerified: true,
  },
];

// Simulated password store (email -> password)
const mockPasswords: Record<string, string> = {
  "adebayo@rugipo.edu.ng": "password123",
  "chioma@rugipo.edu.ng": "password123",
  "ibrahim@rugipo.edu.ng": "password123",
};

// Deactivated accounts (email -> bool). The store (acting as the backend)
// owns this flag — the frontend only reads the login rejection it produces.
const mockDeactivatedEmails: Set<string> = new Set();

// ============================================================
// MOCK OTP STORAGE
// ============================================================

const mockOtps: Record<string, string> = {};

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ============================================================
// MOCK TOKEN STORAGE
// ============================================================

const mockTokens: Record<string, string> = {};

function generateToken(userId?: string): string {
  const base = `tok_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  return userId ? `${base}_${userId}` : base;
}

// ============================================================
// PUBLIC API — matches future NestJS endpoints
// ============================================================

export interface AuthResult {
  success: boolean;
  message: string;
  user?: AuthUser;
  token?: string;
}

/**
 * Register a new user.
 * POST /api/auth/register (future)
 */
export async function register(data: RegisterData): Promise<AuthResult> {
  await delay();

  const existing = mockRegisteredUsers.find(
    (u) => u.email.toLowerCase() === data.email.toLowerCase()
  );
  if (existing) {
    return { success: false, message: "An account with this email already exists." };
  }

  const newUser: AuthUser = {
    id: `u${mockRegisteredUsers.length + 1}`,
    name: data.name,
    email: data.email,
    phone: data.phone,
    campusId: data.campusId,
    role: data.role,
    avatar: "",
    isVerified: false,
  };

  mockRegisteredUsers.push(newUser);
  mockPasswords[data.email.toLowerCase()] = data.password;

  const token = generateToken(newUser.id);
  mockTokens[newUser.id] = token;

  return {
    success: true,
    message: "Account created. Please verify your email.",
    user: newUser,
    token,
  };
}

/**
 * Login with email and password.
 * POST /api/auth/login (future)
 */
export async function login(data: LoginData): Promise<AuthResult> {
  await delay();

  const user = mockRegisteredUsers.find(
    (u) => u.email.toLowerCase() === data.email.toLowerCase()
  );
  if (!user) {
    return { success: false, message: "No account found with this email." };
  }

  if (mockDeactivatedEmails.has(data.email.toLowerCase())) {
    return {
      success: false,
      message:
        "This account has been deactivated. Contact Kampmax support to reactivate it.",
    };
  }

  const storedPassword = mockPasswords[data.email.toLowerCase()];
  if (storedPassword !== data.password) {
    return { success: false, message: "Incorrect password. Please try again." };
  }

  const token = generateToken(user.id);
  mockTokens[user.id] = token;

  return {
    success: true,
    message: "Login successful.",
    user,
    token,
  };
}

/**
 * Send a password reset OTP.
 * POST /api/auth/forgot-password (future)
 */
export async function forgotPassword(
  data: ForgotPasswordData
): Promise<AuthResult> {
  await delay();

  const user = mockRegisteredUsers.find(
    (u) => u.email.toLowerCase() === data.email.toLowerCase()
  );
  if (!user) {
    return { success: false, message: "No account found with this email." };
  }

  const otp = generateOtp();
  mockOtps[data.email.toLowerCase()] = otp;

  // In production, this would send an email. For mock, we log it.
  console.log(`[Mock Auth] OTP for ${data.email}: ${otp}`);

  return {
    success: true,
    message: `A verification code has been sent to ${data.email}.`,
  };
}

/**
 * Verify OTP code.
 * POST /api/auth/verify-otp (future)
 */
export async function verifyOtp(data: VerifyOtpData): Promise<AuthResult> {
  await delay();

  const storedOtp = mockOtps[data.email.toLowerCase()];
  if (!storedOtp) {
    return {
      success: false,
      message: "No verification code found. Please request a new one.",
    };
  }

  if (storedOtp !== data.code) {
    return { success: false, message: "Invalid code. Please try again." };
  }

  // OTP verified — generate reset token
  delete mockOtps[data.email.toLowerCase()];
  const resetToken = generateToken();
  mockTokens[`reset_${data.email}`] = resetToken;

  return {
    success: true,
    message: "Code verified.",
    token: resetToken,
  };
}

/**
 * Reset password with token.
 * POST /api/auth/reset-password (future)
 */
export async function resetPassword(
  data: ResetPasswordData
): Promise<AuthResult> {
  await delay();

  if (data.password !== data.confirmPassword) {
    return { success: false, message: "Passwords do not match." };
  }

  if (data.password.length < 6) {
    return {
      success: false,
      message: "Password must be at least 6 characters.",
    };
  }

  // Find the email from the reset token
  const emailKey = Object.keys(mockTokens).find(
    (k) => k.startsWith("reset_") && mockTokens[k] === data.token
  );

  if (!emailKey) {
    return {
      success: false,
      message: "Invalid or expired reset token.",
    };
  }

  const email = emailKey.replace("reset_", "");
  mockPasswords[email] = data.password;
  delete mockTokens[emailKey];

  return {
    success: true,
    message: "Password reset successful. You can now log in.",
  };
}

/**
 * Resend verification OTP.
 * POST /api/auth/resend-otp (future)
 */
export async function resendOtp(email: string): Promise<AuthResult> {
  await delay(500);

  const otp = generateOtp();
  mockOtps[email.toLowerCase()] = otp;

  console.log(`[Mock Auth] OTP for ${email}: ${otp}`);

  return {
    success: true,
    message: `A new verification code has been sent to ${email}.`,
  };
}

/**
 * Get current session.
 * GET /api/auth/me (future)
 */
export async function getCurrentSession(
  token: string
): Promise<AuthResult> {
  await delay(300);

  // Try in-memory lookup first
  const userId = Object.keys(mockTokens).find(
    (k) => !k.startsWith("reset_") && mockTokens[k] === token
  );

  if (userId) {
    const user = mockRegisteredUsers.find((u) => u.id === userId);
    if (user) {
      return { success: true, message: "Session valid.", user, token };
    }
  }

  // Fallback: decode token to extract user id (survives page refresh)
  // Token format: tok_<timestamp>_<random>_<userId>
  // For mock persistence, we embed user id in the token after login
  const tokenParts = token.split("_");
  if (tokenParts.length >= 4) {
    const embeddedUserId = tokenParts.slice(3).join("_");
    const user = mockRegisteredUsers.find((u) => u.id === embeddedUserId);
    if (user) {
      // Re-register the token in memory so future lookups work
      mockTokens[user.id] = token;
      return { success: true, message: "Session valid.", user, token };
    }
  }

  // Final fallback: accept any tok_ prefixed token and return first user (dev convenience)
  if (token.startsWith("tok_")) {
    const user = mockRegisteredUsers[0];
    mockTokens[user.id] = token;
    return { success: true, message: "Session valid.", user, token };
  }

  return { success: false, message: "Invalid or expired session." };
}

/**
 * Logout.
 * POST /api/auth/logout (future)
 */
export async function logout(token: string): Promise<void> {
  await delay(200);
  const userId = Object.keys(mockTokens).find(
    (k) => !k.startsWith("reset_") && mockTokens[k] === token
  );
  if (userId) delete mockTokens[userId];
}

// ============================================================
// ACCOUNT MANAGEMENT (Module 30)
// ============================================================
// These mirror future NestJS endpoints. All state changes happen in the
// service (backend) store — the frontend never fakes success.

export interface ChangePasswordData {
  email: string;
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResult {
  success: boolean;
  message: string;
}

/**
 * Validates a new password against the platform policy. Returns a
 * user-facing error message, or null when the password is acceptable.
 */
export function validatePasswordPolicy(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must include a lowercase letter.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must include an uppercase letter.";
  }
  if (!/\d/.test(password)) {
    return "Password must include a number.";
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must include a symbol (e.g. !, @, #).";
  }
  return null;
}

/**
 * Change the authenticated user's password.
 * POST /api/auth/change-password (future)
 *
 * The current password is verified against the password store; a wrong
 * current password never succeeds. On success the store records the new
 * password and bumps `lastPasswordChange` on the shared security settings.
 */
export async function changePassword(
  data: ChangePasswordData
): Promise<ChangePasswordResult> {
  await delay();

  const email = data.email.trim().toLowerCase();
  const storedPassword = mockPasswords[email];
  if (!storedPassword) {
    return { success: false, message: "No account found with this email." };
  }

  if (storedPassword !== data.currentPassword) {
    return { success: false, message: "Current password is incorrect." };
  }

  if (data.newPassword === data.currentPassword) {
    return {
      success: false,
      message: "New password must be different from your current password.",
    };
  }

  const policyError = validatePasswordPolicy(data.newPassword);
  if (policyError) {
    return { success: false, message: policyError };
  }

  mockPasswords[email] = data.newPassword;
  updateSecuritySettings({ lastPasswordChange: new Date().toISOString() });

  return { success: true, message: "Your password has been updated." };
}

/**
 * Deactivate the current user's account. The store (backend) marks the
 * account as deactivated and ends the session; the login service rejects
 * deactivated accounts. Reactivation is a support/admin action.
 * POST /api/auth/deactivate (future)
 */
export async function deactivateAccount(token: string): Promise<AuthResult> {
  await delay();

  const userId = Object.keys(mockTokens).find(
    (k) => !k.startsWith("reset_") && mockTokens[k] === token
  );
  const user = userId
    ? mockRegisteredUsers.find((u) => u.id === userId)
    : undefined;
  if (!userId || !user) {
    return { success: false, message: "Your session has expired. Please sign in again." };
  }

  mockDeactivatedEmails.add(user.email.toLowerCase());
  delete mockTokens[userId];

  return { success: true, message: "Your account has been deactivated." };
}

/**
 * Permanently delete the current user's account. Requires the account email
 * to be confirmed before the store (backend) removes the record — never a
 * client-supplied id.
 * DELETE /api/auth/account (future)
 */
export async function deleteAccount(
  token: string,
  verifiedEmail: string
): Promise<AuthResult> {
  await delay();

  const userId = Object.keys(mockTokens).find(
    (k) => !k.startsWith("reset_") && mockTokens[k] === token
  );
  const user = userId
    ? mockRegisteredUsers.find((u) => u.id === userId)
    : undefined;
  if (!userId || !user) {
    return { success: false, message: "Your session has expired. Please sign in again." };
  }

  if (verifiedEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
    return { success: false, message: "Email does not match this account." };
  }

  mockDeactivatedEmails.delete(user.email.toLowerCase());
  delete mockPasswords[user.email.toLowerCase()];
  delete mockTokens[userId];
  const index = mockRegisteredUsers.indexOf(user);
  if (index !== -1) mockRegisteredUsers.splice(index, 1);

  return { success: true, message: "Your account has been permanently deleted." };
}
