"use client";

import { Suspense, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/lib/auth-context";
import { getCampuses } from "@/services/campus";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCampus = searchParams.get("campus") || "";
  const { register } = useAuth();
  const campuses = getCampuses();

  const [step, setStep] = useState<"role" | "form">(
    preselectedCampus ? "form" : "role"
  );
  const [role, setRole] = useState<UserRole>("student");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [campusId, setCampusId] = useState(preselectedCampus);
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const selectedCampus = campuses.find((c) => c.id === campusId);

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Full name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^(\+?234|0)[789][01]\d{8}$/.test(phone.replace(/\s/g, ""))) {
      newErrors.phone = "Enter a valid Nigerian phone number";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!campusId) newErrors.campusId = "Please select your campus";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const result = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        campusId,
        role,
        department: department || undefined,
        level: level || undefined,
      });
      if (result.success) {
        router.push("/home");
      } else {
        setErrors({ general: result.message });
      }
    } catch {
      setErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  // Step 1: Role selection
  if (step === "role") {
    return (
      <div className="space-y-6">
        <div>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-1 text-sm text-kampmax-text-secondary hover:text-kampmax-text transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="text-2xl font-bold text-kampmax-text">
            Join Kampmax
          </h1>
          <p className="text-sm text-kampmax-text-secondary mt-1">
            How do you want to use Kampmax?
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => { setRole("student"); setStep("form"); }}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-lg border text-left transition-all",
              "border-kampmax-border hover:border-kampmax-blue/50 bg-white"
            )}
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <User className="h-6 w-6 text-kampmax-blue" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-kampmax-text">
                Student
              </h3>
              <p className="text-xs text-kampmax-text-secondary mt-0.5">
                Buy and sell items on your campus
              </p>
            </div>
          </button>

          <button
            onClick={() => { setRole("vendor"); setStep("form"); }}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-lg border text-left transition-all",
              "border-kampmax-border hover:border-kampmax-blue/50 bg-white"
            )}
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <svg
                className="h-6 w-6 text-kampmax-gold-dark"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015A3.001 3.001 0 0021 9.349M13.5 21h-3.75"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-kampmax-text">
                Vendor
              </h3>
              <p className="text-xs text-kampmax-text-secondary mt-0.5">
                Set up a store and sell to students
              </p>
            </div>
          </button>
        </div>

        <p className="text-center text-sm text-kampmax-text-secondary">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-kampmax-blue hover:text-kampmax-blue-dark transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  // Step 2: Registration form
  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => setStep("role")}
          className="inline-flex items-center gap-1 text-sm text-kampmax-text-secondary hover:text-kampmax-text transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-kampmax-text">
          {role === "student" ? "Student" : "Vendor"} Registration
        </h1>
        <p className="text-sm text-kampmax-text-secondary mt-1">
          Fill in your details to create your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-kampmax-error">{errors.general}</p>
          </div>
        )}

        <Input
          label="Full name"
          type="text"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          leftIcon={<User className="h-4 w-4" />}
          autoComplete="name"
        />

        <Input
          label="Email address"
          type="email"
          placeholder="you@school.edu.ng"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          leftIcon={<Mail className="h-4 w-4" />}
          autoComplete="email"
        />

        <Input
          label="Phone number"
          type="tel"
          placeholder="+234 812 345 6789"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={errors.phone}
          leftIcon={<Phone className="h-4 w-4" />}
          autoComplete="tel"
        />

        <Select
          label="Campus"
          value={campusId}
          onChange={(e) => setCampusId(e.target.value)}
          error={errors.campusId}
          placeholder="Select your campus"
        >
          {campuses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} — {c.location}
            </option>
          ))}
        </Select>

        {selectedCampus && (
          <div className="space-y-4">
            <Select
              label="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Select your department (optional)"
            >
              {selectedCampus.departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>

            <Select
              label="Level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              placeholder="Select your level (optional)"
            >
              <option value="ND1">ND1</option>
              <option value="ND2">ND2</option>
              <option value="HND1">HND1</option>
              <option value="HND2">HND2</option>
              <option value="100">100 Level</option>
              <option value="200">200 Level</option>
              <option value="300">300 Level</option>
              <option value="400">400 Level</option>
              <option value="500">500 Level</option>
            </Select>
          </div>
        )}

        <PasswordInput
          label="Password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="new-password"
        />

        <PasswordInput
          label="Confirm password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating account...
            </span>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-kampmax-text-secondary">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-kampmax-blue hover:text-kampmax-blue-dark transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 border-2 border-kampmax-blue/20 border-t-kampmax-blue rounded-full animate-spin" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
