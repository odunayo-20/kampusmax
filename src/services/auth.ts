import {
  AuthUser,
  RegisterData,
  LoginData,
  ForgotPasswordData,
  ResetPasswordData,
  VerifyOtpData,
} from "@/types";

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

function generateToken(): string {
  return `tok_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
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

  const token = generateToken();
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

  const storedPassword = mockPasswords[data.email.toLowerCase()];
  if (storedPassword !== data.password) {
    return { success: false, message: "Incorrect password. Please try again." };
  }

  const token = generateToken();
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

  const userId = Object.keys(mockTokens).find(
    (k) => !k.startsWith("reset_") && mockTokens[k] === token
  );

  if (!userId) {
    return { success: false, message: "Invalid or expired session." };
  }

  const user = mockRegisteredUsers.find((u) => u.id === userId);
  if (!user) {
    return { success: false, message: "User not found." };
  }

  return { success: true, message: "Session valid.", user, token };
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
