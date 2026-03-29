import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

// ── Shared layout wrapper ──────────────────────────────────────────────────
function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-stretch justify-center"
      style={{ backgroundColor: "oklch(0.08 0.02 243)" }}
    >
      <div
        className="w-full max-w-[430px] min-h-screen flex flex-col"
        style={{ backgroundColor: "oklch(var(--background))" }}
      >
        {children}
      </div>
    </div>
  );
}

// ── Logo ──────────────────────────────────────────────────────────────────
function EduLogo() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.65 0.175 220), oklch(0.55 0.20 245))",
          boxShadow: "0 8px 32px oklch(0.65 0.175 220 / 35%)",
        }}
      >
        <GraduationCap className="w-8 h-8 text-white" />
      </div>
      <div className="text-center">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: "oklch(0.97 0.012 240)" }}
        >
          EduCoach
        </h1>
        <p
          className="text-sm mt-0.5"
          style={{ color: "oklch(0.68 0.025 220)" }}
        >
          Your Gateway to Academic Excellence
        </p>
      </div>
    </div>
  );
}

// ── LOGIN PAGE ────────────────────────────────────────────────────────────
interface LoginPageProps {
  onGoToRegister: () => void;
  onGoToForgotPassword: () => void;
}

export function LoginPage({
  onGoToRegister,
  onGoToForgotPassword,
}: LoginPageProps) {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <AuthShell>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -24 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex flex-col flex-1 px-6 pt-20 pb-10"
      >
        <EduLogo />

        <div className="mt-12 flex flex-col gap-4">
          <Button
            data-ocid="login.primary_button"
            onClick={login}
            disabled={isLoggingIn}
            size="lg"
            className="w-full h-14 text-base font-semibold rounded-2xl gap-2"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.175 220), oklch(0.55 0.20 245))",
              color: "oklch(0.97 0.012 240)",
              boxShadow: "0 4px 20px oklch(0.65 0.175 220 / 40%)",
            }}
          >
            {isLoggingIn ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <KeyRound className="w-5 h-5" />
            )}
            {isLoggingIn ? "Connecting..." : "Login with Internet Identity"}
          </Button>

          <div className="flex items-center gap-3 my-1">
            <div
              className="flex-1 h-px"
              style={{ backgroundColor: "oklch(var(--border))" }}
            />
            <span className="text-xs" style={{ color: "oklch(0.5 0.02 220)" }}>
              or
            </span>
            <div
              className="flex-1 h-px"
              style={{ backgroundColor: "oklch(var(--border))" }}
            />
          </div>

          <button
            type="button"
            data-ocid="login.register_link"
            onClick={onGoToRegister}
            className="text-center text-sm font-medium py-2 transition-opacity hover:opacity-80"
            style={{ color: "oklch(var(--edu-cyan))" }}
          >
            New student? Create Account
          </button>

          <button
            type="button"
            data-ocid="login.forgot_link"
            onClick={onGoToForgotPassword}
            className="text-center text-xs py-1 transition-opacity hover:opacity-70"
            style={{ color: "oklch(0.55 0.025 220)" }}
          >
            Forgot Password?
          </button>
        </div>

        <div className="mt-auto pt-10 flex flex-col items-center gap-2">
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs"
            style={{
              backgroundColor: "oklch(0.145 0.032 243)",
              color: "oklch(0.55 0.025 220)",
              border: "1px solid oklch(var(--border))",
            }}
          >
            <KeyRound className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              Powered by Internet Identity — secure &amp; passwordless
            </span>
          </div>
        </div>
      </motion.div>
    </AuthShell>
  );
}

// ── REGISTER PAGE ─────────────────────────────────────────────────────────
interface RegisterPageProps {
  onBack: () => void;
  onRegistered: () => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  className?: string;
  password?: string;
  confirmPassword?: string;
}

const inputStyle = {
  backgroundColor: "oklch(0.145 0.032 243)",
  borderColor: "oklch(var(--border))",
  color: "oklch(0.97 0.012 240)",
};

const iconStyle = { color: "oklch(0.5 0.02 220)" };

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs mt-1" style={{ color: "oklch(0.65 0.2 25)" }}>
      {message}
    </p>
  );
}

export function RegisterPage({ onBack, onRegistered }: RegisterPageProps) {
  const { actor } = useActor();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [className, setClassName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminToken, setAdminToken] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!name.trim()) errs.name = "Full name is required.";
    if (!email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Enter a valid email address.";
    }
    if (!phone.trim()) {
      errs.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(phone.trim())) {
      errs.phone = "Enter a valid 10-digit phone number.";
    }
    if (!className) errs.className = "Please select your class.";
    if (!password) {
      errs.password = "Password is required.";
    } else if (password.length < 8) {
      errs.password = "Password must be at least 8 characters.";
    }
    if (!confirmPassword) {
      errs.confirmPassword = "Please confirm your password.";
    } else if (confirmPassword !== password) {
      errs.confirmPassword = "Passwords do not match.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSendOtp = () => {
    if (!/^\d{10}$/.test(phone.trim())) {
      setErrors((prev) => ({
        ...prev,
        phone: "Enter a valid 10-digit number first.",
      }));
      return;
    }
    setOtpSent(true);
    toast.success("OTP sent! (UI demo — no real SMS)");
  };

  const handleGoogleSignIn = () => {
    toast.info("Google Sign-In coming soon!");
  };

  const handleRegister = async () => {
    if (!validate()) return;
    if (!actor) {
      toast.error("Not connected. Please login first.");
      return;
    }
    setLoading(true);
    try {
      await actor._initializeAccessControlWithSecret(adminToken.trim());
      await actor.saveCallerUserProfile({ name: name.trim() });
      toast.success("Account created successfully!");
      onRegistered();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex flex-col flex-1 px-6 pt-12 pb-10 overflow-y-auto"
      >
        <button
          type="button"
          data-ocid="register.back_link"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm mb-8 w-fit transition-opacity hover:opacity-70"
          style={{ color: "oklch(var(--edu-cyan))" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>

        <EduLogo />

        <h2
          className="text-xl font-bold mt-8 mb-1"
          style={{ color: "oklch(0.97 0.012 240)" }}
        >
          Create Your Account
        </h2>
        <p className="text-sm mb-6" style={{ color: "oklch(0.55 0.025 220)" }}>
          Join thousands of students learning with EduCoach
        </p>

        {/* Google Sign-In */}
        <button
          type="button"
          data-ocid="register.secondary_button"
          onClick={handleGoogleSignIn}
          className="w-full h-12 rounded-xl flex items-center justify-center gap-3 text-sm font-medium mb-5 transition-opacity hover:opacity-80"
          style={{
            border: "1px solid oklch(var(--border))",
            backgroundColor: "oklch(0.145 0.032 243)",
            color: "oklch(0.85 0.02 220)",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            role="img"
            aria-label="Google"
          >
            <path
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
              fill="#4285F4"
            />
            <path
              d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
              fill="#34A853"
            />
            <path
              d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
              fill="#FBBC05"
            />
            <path
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        {/* OR divider */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="flex-1 h-px"
            style={{ backgroundColor: "oklch(var(--border))" }}
          />
          <span className="text-xs" style={{ color: "oklch(0.5 0.02 220)" }}>
            OR
          </span>
          <div
            className="flex-1 h-px"
            style={{ backgroundColor: "oklch(var(--border))" }}
          />
        </div>

        <div className="flex flex-col gap-4">
          {/* Full Name */}
          <div className="flex flex-col gap-1">
            <Label
              htmlFor="reg-name"
              className="text-sm font-medium"
              style={{ color: "oklch(0.75 0.02 220)" }}
            >
              Full Name <span style={{ color: "oklch(0.65 0.2 25)" }}>*</span>
            </Label>
            <div className="relative">
              <User
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                style={iconStyle}
              />
              <Input
                id="reg-name"
                data-ocid="register.input"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 h-12 rounded-xl"
                style={inputStyle}
              />
            </div>
            <FieldError message={errors.name} />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <Label
              htmlFor="reg-email"
              className="text-sm font-medium"
              style={{ color: "oklch(0.75 0.02 220)" }}
            >
              Email ID <span style={{ color: "oklch(0.65 0.2 25)" }}>*</span>
            </Label>
            <div className="relative">
              <Mail
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                style={iconStyle}
              />
              <Input
                id="reg-email"
                data-ocid="register.input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 rounded-xl"
                style={inputStyle}
              />
            </div>
            <FieldError message={errors.email} />
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1">
            <Label
              htmlFor="reg-phone"
              className="text-sm font-medium"
              style={{ color: "oklch(0.75 0.02 220)" }}
            >
              Phone Number{" "}
              <span style={{ color: "oklch(0.65 0.2 25)" }}>*</span>
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Phone
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={iconStyle}
                />
                <Input
                  id="reg-phone"
                  data-ocid="register.input"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="pl-10 h-12 rounded-xl"
                  style={inputStyle}
                />
              </div>
              <button
                type="button"
                data-ocid="register.secondary_button"
                onClick={handleSendOtp}
                className="h-12 px-4 rounded-xl text-sm font-medium whitespace-nowrap transition-opacity hover:opacity-80"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.55 0.175 220), oklch(0.45 0.20 245))",
                  color: "oklch(0.97 0.012 240)",
                }}
              >
                Send OTP
              </button>
            </div>
            <FieldError message={errors.phone} />

            {/* OTP input (appears after Send OTP) */}
            <AnimatePresence>
              {otpSent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 flex flex-col gap-2">
                    <p
                      className="text-xs"
                      style={{ color: "oklch(0.65 0.025 220)" }}
                    >
                      Enter the 6-digit OTP sent to +91 {phone}
                    </p>
                    <InputOTP
                      data-ocid="register.input"
                      maxLength={6}
                      value={otp}
                      onChange={setOtp}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Class Name */}
          <div className="flex flex-col gap-1">
            <Label
              htmlFor="reg-class"
              className="text-sm font-medium"
              style={{ color: "oklch(0.75 0.02 220)" }}
            >
              Class Name <span style={{ color: "oklch(0.65 0.2 25)" }}>*</span>
            </Label>
            <div className="relative">
              <BookOpen
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 z-10"
                style={iconStyle}
              />
              <Select value={className} onValueChange={setClassName}>
                <SelectTrigger
                  id="reg-class"
                  data-ocid="register.select"
                  className="h-12 rounded-xl pl-10"
                  style={inputStyle}
                >
                  <SelectValue placeholder="Select your class" />
                </SelectTrigger>
                <SelectContent
                  style={{
                    backgroundColor: "oklch(0.18 0.032 243)",
                    borderColor: "oklch(var(--border))",
                    color: "oklch(0.97 0.012 240)",
                  }}
                >
                  <SelectItem value="class-8">Class 8</SelectItem>
                  <SelectItem value="class-9">Class 9</SelectItem>
                  <SelectItem value="class-10">Class 10</SelectItem>
                  <SelectItem value="class-11">Class 11</SelectItem>
                  <SelectItem value="class-12">Class 12</SelectItem>
                  <SelectItem value="dropper">Dropper / Repeater</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <FieldError message={errors.className} />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <Label
              htmlFor="reg-password"
              className="text-sm font-medium"
              style={{ color: "oklch(0.75 0.02 220)" }}
            >
              Password <span style={{ color: "oklch(0.65 0.2 25)" }}>*</span>
            </Label>
            <div className="relative">
              <Lock
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                style={iconStyle}
              />
              <Input
                id="reg-password"
                data-ocid="register.input"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-11 h-12 rounded-xl"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                style={iconStyle}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <FieldError message={errors.password} />
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1">
            <Label
              htmlFor="reg-confirm"
              className="text-sm font-medium"
              style={{ color: "oklch(0.75 0.02 220)" }}
            >
              Confirm Password{" "}
              <span style={{ color: "oklch(0.65 0.2 25)" }}>*</span>
            </Label>
            <div className="relative">
              <Lock
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                style={iconStyle}
              />
              <Input
                id="reg-confirm"
                data-ocid="register.input"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 pr-11 h-12 rounded-xl"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((p) => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                style={iconStyle}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <FieldError message={errors.confirmPassword} />
          </div>

          {/* Admin Token (optional) */}
          <div className="flex flex-col gap-1">
            <Label
              htmlFor="register-token"
              className="text-sm font-medium"
              style={{ color: "oklch(0.75 0.02 220)" }}
            >
              Admin Token{" "}
              <span
                className="text-xs font-normal"
                style={{ color: "oklch(0.5 0.02 220)" }}
              >
                (optional)
              </span>
            </Label>
            <div className="relative">
              <KeyRound
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                style={iconStyle}
              />
              <Input
                id="register-token"
                data-ocid="register.input"
                type="password"
                placeholder="Leave empty if you're a student"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                className="pl-10 h-12 rounded-xl"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Register Button */}
          <Button
            data-ocid="register.submit_button"
            onClick={handleRegister}
            disabled={loading}
            size="lg"
            className="w-full h-14 text-base font-semibold rounded-2xl mt-2"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.175 220), oklch(0.55 0.20 245))",
              color: "oklch(0.97 0.012 240)",
              boxShadow: "0 4px 20px oklch(0.65 0.175 220 / 40%)",
            }}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Creating Account...
              </>
            ) : (
              "Register"
            )}
          </Button>

          {loading && (
            <div
              data-ocid="register.loading_state"
              className="mt-2 text-center text-sm"
              style={{ color: "oklch(0.55 0.025 220)" }}
            >
              Setting up your profile…
            </div>
          )}

          {/* Already have an account */}
          <p
            className="text-center text-sm mt-1"
            style={{ color: "oklch(0.55 0.025 220)" }}
          >
            Already have an account?{" "}
            <button
              type="button"
              data-ocid="register.link"
              onClick={onBack}
              className="font-semibold transition-opacity hover:opacity-80"
              style={{ color: "oklch(var(--edu-cyan))" }}
            >
              Login
            </button>
          </p>
        </div>
      </motion.div>
    </AuthShell>
  );
}

// ── FORGOT PASSWORD PAGE ──────────────────────────────────────────────────
interface ForgotPasswordPageProps {
  onBack: () => void;
}

export function ForgotPasswordPage({ onBack }: ForgotPasswordPageProps) {
  return (
    <AuthShell>
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex flex-col flex-1 px-6 pt-12 pb-10"
      >
        <button
          type="button"
          data-ocid="forgot.back_link"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm mb-8 w-fit transition-opacity hover:opacity-70"
          style={{ color: "oklch(var(--edu-cyan))" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>

        <div className="flex flex-col items-center text-center gap-4 mt-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: "oklch(0.145 0.032 243)",
              border: "1px solid oklch(var(--border))",
            }}
          >
            <KeyRound
              className="w-7 h-7"
              style={{ color: "oklch(var(--edu-cyan))" }}
            />
          </div>

          <h2
            className="text-xl font-bold"
            style={{ color: "oklch(0.97 0.012 240)" }}
          >
            Account Recovery
          </h2>

          <p
            className="text-sm leading-relaxed max-w-xs"
            style={{ color: "oklch(0.65 0.025 220)" }}
          >
            EduCoach uses{" "}
            <strong style={{ color: "oklch(0.85 0.02 220)" }}>
              Internet Identity
            </strong>{" "}
            — a passwordless authentication system. There is no password to
            recover.
          </p>

          <div
            className="rounded-2xl p-4 text-sm text-left w-full"
            style={{
              backgroundColor: "oklch(0.145 0.032 243)",
              border: "1px solid oklch(var(--border))",
              color: "oklch(0.65 0.025 220)",
            }}
          >
            <p
              className="font-semibold mb-2"
              style={{ color: "oklch(0.85 0.02 220)" }}
            >
              How to regain access:
            </p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>Use your device passkey (fingerprint, Face ID, PIN)</li>
              <li>Use your recovery phrase set up during II registration</li>
              <li>Add a recovery device on the Internet Identity dashboard</li>
            </ul>
          </div>

          <a
            href="https://identity.ic0.app"
            target="_blank"
            rel="noopener noreferrer"
            data-ocid="forgot.primary_button"
          >
            <Button
              size="lg"
              className="h-13 px-8 text-sm font-semibold rounded-2xl gap-2 mt-2"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.175 220), oklch(0.55 0.20 245))",
                color: "oklch(0.97 0.012 240)",
                boxShadow: "0 4px 20px oklch(0.65 0.175 220 / 40%)",
              }}
            >
              <ExternalLink className="w-4 h-4" />
              Visit Internet Identity
            </Button>
          </a>

          <button
            type="button"
            data-ocid="forgot.cancel_button"
            onClick={onBack}
            className="text-sm transition-opacity hover:opacity-70 mt-1"
            style={{ color: "oklch(0.55 0.025 220)" }}
          >
            Back to Login
          </button>
        </div>
      </motion.div>
    </AuthShell>
  );
}
