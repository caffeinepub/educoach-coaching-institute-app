import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Award,
  Bell,
  BookOpen,
  CheckSquare,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Home,
  Loader2,
  Pencil,
  Play,
  Plus,
  Search,
  Settings,
  Star,
  Trash2,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ForgotPasswordPage, LoginPage, RegisterPage } from "./AuthPages";
import { useAuthFlow } from "./hooks/useAuthFlow";
import {
  useAddCourse,
  useAddLiveClass,
  useAddStudyMaterial,
  useAddTestSeries,
  useAllCourses,
  useAllLiveClasses,
  useAllStudentProgress,
  useAllStudyMaterials,
  useAllTestSeries,
  useDeleteCourse,
  useDeleteLiveClass,
  useDeleteStudyMaterial,
  useDeleteTestSeries,
  useEnrollCourse,
  useInitSampleData,
  useUpdateCourse,
  useUpdateLiveClass,
  useUpdateStudyMaterial,
  useUpdateTestSeries,
  useUserProfile,
} from "./hooks/useQueries";

type Tab = "home" | "courses" | "live" | "study" | "tests" | "admin";

const CATEGORIES = [
  "IIT-JEE",
  "NEET",
  "Foundation",
  "Class 9-10",
  "Class 11-12",
];

const CATEGORY_COLORS: Record<string, string> = {
  "IIT-JEE": "#2EA8FF",
  NEET: "#4CAF50",
  Foundation: "#FF9800",
  "Class 9-10": "#9C27B0",
  "Class 11-12": "#E91E63",
};

const SKELETONS_4 = ["s0", "s1", "s2", "s3"];
const SKELETONS_5 = ["s0", "s1", "s2", "s3", "s4"];

const PRACTICE_ITEMS = [
  {
    subject: "Physics",
    chapter: "Mechanics — Newton's Laws",
    difficulty: "Medium",
  },
  {
    subject: "Chemistry",
    chapter: "Organic — Hydrocarbons",
    difficulty: "Hard",
  },
  { subject: "Maths", chapter: "Calculus — Integration", difficulty: "Easy" },
  {
    subject: "Biology",
    chapter: "Cell Biology — Mitosis",
    difficulty: "Medium",
  },
];

function formatTime(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  const d = new Date(ms);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  if (diff < 0) return "Started";
  if (diff < 3600000) return `In ${Math.round(diff / 60000)}m`;
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Deterministic progress from course id
function courseProgress(id: bigint): number {
  return Number(id % 80n) + 10;
}

function ProgressBar({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDisplayed(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div
      className="w-full h-1.5 rounded-full"
      style={{ backgroundColor: "oklch(var(--edu-track))" }}
    >
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{
          width: `${displayed}%`,
          backgroundColor: "oklch(var(--edu-cyan))",
        }}
      />
    </div>
  );
}

function CourseCard({
  title,
  category,
  subjectTags,
  progress = 0,
  onClick,
}: {
  title: string;
  category: string;
  subjectTags: string[];
  progress?: number;
  onClick?: () => void;
}) {
  const catColor = CATEGORY_COLORS[category] || "#2EA8FF";
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="rounded-2xl p-4 border cursor-pointer"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.145 0.032 243), oklch(0.18 0.038 243))",
        borderColor: "oklch(var(--border))",
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${catColor}22`, color: catColor }}
        >
          {category}
        </span>
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-3 line-clamp-2 leading-tight">
        {title}
      </h3>
      <ProgressBar value={progress} />
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs" style={{ color: "oklch(var(--edu-cyan))" }}>
          {progress}% complete
        </span>
      </div>
      {subjectTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {subjectTags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-xs px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: "oklch(0.225 0.042 243)",
                color: "oklch(var(--muted-foreground))",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function LiveClassCard({
  title,
  teacher,
  isLive,
  scheduledTime,
  viewers = 0,
}: {
  title: string;
  teacher: string;
  isLive: boolean;
  scheduledTime: bigint;
  viewers?: number;
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      className="rounded-2xl p-4 border cursor-pointer"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.145 0.032 243), oklch(0.18 0.038 243))",
        borderColor: isLive
          ? "oklch(0.58 0.22 25 / 40%)"
          : "oklch(var(--border))",
      }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        {isLive ? (
          <>
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: "oklch(var(--edu-red))" }}
            />
            <span
              className="text-xs font-bold"
              style={{ color: "oklch(var(--edu-red))" }}
            >
              LIVE
            </span>
          </>
        ) : (
          <span
            className="text-xs"
            style={{ color: "oklch(var(--muted-foreground))" }}
          >
            {formatTime(scheduledTime)}
          </span>
        )}
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-2 line-clamp-2 leading-tight">
        {title}
      </h3>
      <div className="flex items-center gap-1">
        <Users
          className="w-3 h-3"
          style={{ color: "oklch(var(--muted-foreground))" }}
        />
        <span
          className="text-xs"
          style={{ color: "oklch(var(--muted-foreground))" }}
        >
          {teacher}
        </span>
      </div>
      {isLive && (
        <div className="flex items-center gap-1 mt-1">
          <span
            className="text-xs"
            style={{ color: "oklch(var(--muted-foreground))" }}
          >
            {viewers.toLocaleString()} watching
          </span>
        </div>
      )}
    </motion.div>
  );
}

function CardSkeleton() {
  return (
    <div
      className="rounded-2xl p-4 border"
      style={{
        borderColor: "oklch(var(--border))",
        background: "oklch(0.145 0.032 243)",
      }}
    >
      <Skeleton
        className="h-4 w-16 mb-2 rounded-full"
        style={{ backgroundColor: "oklch(0.225 0.042 243)" }}
      />
      <Skeleton
        className="h-4 w-full mb-1"
        style={{ backgroundColor: "oklch(0.225 0.042 243)" }}
      />
      <Skeleton
        className="h-4 w-3/4 mb-3"
        style={{ backgroundColor: "oklch(0.225 0.042 243)" }}
      />
      <Skeleton
        className="h-1.5 w-full rounded-full"
        style={{ backgroundColor: "oklch(0.225 0.042 243)" }}
      />
    </div>
  );
}

function RowSkeleton() {
  return (
    <div
      className="rounded-2xl p-4 border"
      style={{
        borderColor: "oklch(var(--border))",
        background: "oklch(0.145 0.032 243)",
      }}
    >
      <Skeleton
        className="h-4 w-3/4 mb-2"
        style={{ backgroundColor: "oklch(0.225 0.042 243)" }}
      />
      <Skeleton
        className="h-3 w-1/2"
        style={{ backgroundColor: "oklch(0.225 0.042 243)" }}
      />
    </div>
  );
}

// ─── HOME TAB ──────────────────────────────────────────────────────────────────
function HomeTab() {
  const { data: courses, isLoading: cLoading } = useAllCourses();
  const { data: liveClasses, isLoading: lLoading } = useAllLiveClasses();
  const { data: profile } = useUserProfile();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const studentName = profile?.name || "Student";
  const filteredCourses = activeCategory
    ? (courses || []).filter((c) => c.category === activeCategory)
    : courses || [];

  return (
    <div className="space-y-6">
      {/* Hero greeting */}
      <div
        className="relative rounded-2xl overflow-hidden p-5"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.16 0.05 240), oklch(0.22 0.07 245))",
          border: "1px solid oklch(var(--border))",
        }}
      >
        <img
          src="/assets/generated/edu-hero.dim_800x400.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />
        <div className="relative">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Welcome back, {studentName}! 👋
          </h1>
          <p
            className="text-sm"
            style={{ color: "oklch(var(--muted-foreground))" }}
          >
            Continue your learning journey
          </p>
          <div className="flex gap-3 mt-4">
            {[
              {
                label: "Courses",
                value: courses?.length || 0,
                color: "oklch(var(--edu-cyan))",
              },
              {
                label: "Live Now",
                value: liveClasses?.filter((l) => l.isLive).length || 0,
                color: "oklch(var(--edu-gold))",
              },
              { label: "Progress", value: "↑", color: "oklch(0.70 0.14 150)" },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="flex-1 rounded-xl p-3 text-center"
                style={{ backgroundColor: "oklch(0.115 0.028 243 / 70%)" }}
              >
                <div className="text-lg font-bold" style={{ color }}>
                  {label === "Progress" ? (
                    <TrendingUp className="w-4 h-4 mx-auto" />
                  ) : (
                    value
                  )}
                </div>
                <div
                  className="text-xs"
                  style={{ color: "oklch(var(--muted-foreground))" }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Explore Categories */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">
          Explore Categories
        </h2>
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          <button
            type="button"
            data-ocid="category.tab"
            onClick={() => setActiveCategory(null)}
            className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors"
            style={{
              backgroundColor:
                activeCategory === null
                  ? "oklch(var(--edu-cyan))"
                  : "oklch(0.175 0.033 243)",
              color:
                activeCategory === null
                  ? "oklch(0.115 0.028 243)"
                  : "oklch(var(--foreground))",
            }}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              data-ocid="category.tab"
              onClick={() =>
                setActiveCategory(cat === activeCategory ? null : cat)
              }
              className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors"
              style={{
                backgroundColor:
                  activeCategory === cat
                    ? "oklch(var(--edu-cyan))"
                    : "oklch(0.175 0.033 243)",
                color:
                  activeCategory === cat
                    ? "oklch(0.115 0.028 243)"
                    : "oklch(var(--foreground))",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* My Courses */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">My Courses</h2>
          <span className="text-sm" style={{ color: "oklch(var(--edu-cyan))" }}>
            See all
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {cLoading
            ? SKELETONS_4.map((k) => <CardSkeleton key={k} />)
            : filteredCourses
                .slice(0, 4)
                .map((course) => (
                  <CourseCard
                    key={String(course.id)}
                    title={course.title}
                    category={course.category}
                    subjectTags={course.subjectTags}
                    progress={courseProgress(course.id)}
                  />
                ))}
        </div>
      </div>

      {/* Live Classes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">
            Live Classes
          </h2>
          <span className="text-sm" style={{ color: "oklch(var(--edu-cyan))" }}>
            See all
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {lLoading
            ? SKELETONS_4.map((k) => <CardSkeleton key={k} />)
            : (liveClasses || [])
                .slice(0, 4)
                .map((cls) => (
                  <LiveClassCard
                    key={String(cls.id)}
                    title={cls.title}
                    teacher={cls.teacher}
                    isLive={cls.isLive}
                    scheduledTime={cls.scheduledTime}
                    viewers={Number(cls.id % 5000n) + 500}
                  />
                ))}
        </div>
      </div>

      {/* Daily Practice */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">
          Daily Practice Problems
        </h2>
        <div className="space-y-2">
          {PRACTICE_ITEMS.map((item, i) => (
            <motion.div
              key={item.chapter}
              whileTap={{ scale: 0.98 }}
              data-ocid={`practice.item.${i + 1}`}
              className="flex items-center justify-between p-4 rounded-xl border cursor-pointer"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.145 0.032 243), oklch(0.18 0.038 243))",
                borderColor: "oklch(var(--border))",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "oklch(var(--edu-cyan) / 15%)" }}
                >
                  <Zap
                    className="w-4 h-4"
                    style={{ color: "oklch(var(--edu-cyan))" }}
                  />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {item.chapter}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "oklch(var(--muted-foreground))" }}
                  >
                    {item.subject} · {item.difficulty}
                  </div>
                </div>
              </div>
              <ChevronRight
                className="w-4 h-4"
                style={{ color: "oklch(var(--muted-foreground))" }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MY COURSES TAB ────────────────────────────────────────────────────────────
function CoursesTab() {
  const { data: courses, isLoading } = useAllCourses();
  const enrollCourse = useEnrollCourse();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">My Courses</h2>
      {isLoading ? (
        <div className="space-y-3">
          {SKELETONS_5.map((k) => (
            <div
              key={k}
              className="rounded-2xl p-4 border"
              style={{
                borderColor: "oklch(var(--border))",
                background: "oklch(0.145 0.032 243)",
              }}
            >
              <Skeleton
                className="h-4 w-3/4 mb-2"
                style={{ backgroundColor: "oklch(0.225 0.042 243)" }}
              />
              <Skeleton
                className="h-3 w-1/2 mb-3"
                style={{ backgroundColor: "oklch(0.225 0.042 243)" }}
              />
              <Skeleton
                className="h-1.5 w-full rounded-full"
                style={{ backgroundColor: "oklch(0.225 0.042 243)" }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3" data-ocid="courses.list">
          {(courses || []).map((course, i) => {
            const progress = courseProgress(course.id);
            const catColor = CATEGORY_COLORS[course.category] || "#2EA8FF";
            return (
              <motion.div
                key={String(course.id)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                data-ocid={`courses.item.${i + 1}`}
                className="rounded-2xl p-4 border"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.145 0.032 243), oklch(0.18 0.038 243))",
                  borderColor: "oklch(var(--border))",
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${catColor}22`,
                      color: catColor,
                    }}
                  >
                    {course.category}
                  </span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: "oklch(var(--edu-cyan))" }}
                  >
                    {progress}%
                  </span>
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">
                  {course.title}
                </h3>
                <p
                  className="text-xs mb-3"
                  style={{ color: "oklch(var(--muted-foreground))" }}
                >
                  {course.description}
                </p>
                <ProgressBar value={progress} />
                <div className="flex flex-wrap gap-1 mt-3">
                  {course.subjectTags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: "oklch(0.225 0.042 243)",
                        color: "oklch(var(--muted-foreground))",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <Button
                  data-ocid={`courses.enroll_button.${i + 1}`}
                  size="sm"
                  className="mt-3 w-full text-xs"
                  style={{
                    backgroundColor: "oklch(var(--edu-cyan) / 15%)",
                    color: "oklch(var(--edu-cyan))",
                    border: "1px solid oklch(var(--edu-cyan) / 30%)",
                  }}
                  onClick={() => {
                    enrollCourse.mutate(course.id, {
                      onSuccess: () => toast.success("Enrolled successfully!"),
                      onError: () => toast.error("Could not enroll"),
                    });
                  }}
                >
                  Enroll / Continue
                </Button>
              </motion.div>
            );
          })}
        </div>
      )}
      <Button
        data-ocid="courses.explore_button"
        className="w-full font-semibold"
        style={{
          background:
            "linear-gradient(135deg, oklch(var(--edu-cyan)), oklch(0.55 0.17 240))",
          color: "oklch(0.115 0.028 243)",
        }}
      >
        Explore More Courses
      </Button>
    </div>
  );
}

// ─── LIVE TAB ─────────────────────────────────────────────────────────────────
function LiveTab() {
  const { data: liveClasses, isLoading } = useAllLiveClasses();

  const live = (liveClasses || []).filter((c) => c.isLive);
  const upcoming = (liveClasses || []).filter((c) => !c.isLive);

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-foreground">Live Classes</h2>

      {(live.length > 0 || isLoading) && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: "oklch(var(--edu-red))" }}
            />
            <h3
              className="text-base font-semibold"
              style={{ color: "oklch(var(--edu-red))" }}
            >
              Happening Now
            </h3>
          </div>
          <div className="space-y-3" data-ocid="live.list">
            {isLoading
              ? SKELETONS_4.map((k) => <CardSkeleton key={k} />)
              : live.map((cls, i) => (
                  <motion.div
                    key={String(cls.id)}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    data-ocid={`live.item.${i + 1}`}
                    className="rounded-2xl p-4 border"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.16 0.04 15), oklch(0.18 0.038 243))",
                      borderColor: "oklch(0.58 0.22 25 / 40%)",
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <span
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ backgroundColor: "oklch(var(--edu-red))" }}
                      />
                      <span
                        className="text-xs font-bold"
                        style={{ color: "oklch(var(--edu-red))" }}
                      >
                        LIVE NOW
                      </span>
                    </div>
                    <h4 className="text-base font-semibold text-foreground mb-1">
                      {cls.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      <Users
                        className="w-3.5 h-3.5"
                        style={{ color: "oklch(var(--muted-foreground))" }}
                      />
                      <span
                        className="text-sm"
                        style={{ color: "oklch(var(--muted-foreground))" }}
                      >
                        {cls.teacher}
                      </span>
                    </div>
                    <Button
                      data-ocid={`live.join_button.${i + 1}`}
                      size="sm"
                      className="mt-3"
                      style={{
                        backgroundColor: "oklch(var(--edu-red))",
                        color: "white",
                      }}
                    >
                      <Play className="w-3.5 h-3.5 mr-1.5" />
                      Join Now
                    </Button>
                  </motion.div>
                ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-base font-semibold text-foreground mb-3">
          Upcoming
        </h3>
        <div className="space-y-3">
          {isLoading
            ? SKELETONS_4.map((k) => <CardSkeleton key={k} />)
            : upcoming.map((cls, i) => (
                <motion.div
                  key={String(cls.id)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  data-ocid={`upcoming.item.${i + 1}`}
                  className="rounded-2xl p-4 border flex items-center gap-4"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.145 0.032 243), oklch(0.18 0.038 243))",
                    borderColor: "oklch(var(--border))",
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "oklch(var(--edu-cyan) / 15%)" }}
                  >
                    <Clock
                      className="w-5 h-5"
                      style={{ color: "oklch(var(--edu-cyan))" }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground truncate">
                      {cls.title}
                    </h4>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "oklch(var(--muted-foreground))" }}
                    >
                      {cls.teacher} · {formatTime(cls.scheduledTime)}
                    </p>
                  </div>
                  <ChevronRight
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: "oklch(var(--muted-foreground))" }}
                  />
                </motion.div>
              ))}
        </div>
      </div>
    </div>
  );
}

// ─── STUDY TAB ────────────────────────────────────────────────────────────────
function StudyTab() {
  const { data: materials, isLoading } = useAllStudyMaterials();
  const [activeSubject, setActiveSubject] = useState<string | null>(null);

  const subjects = [...new Set((materials || []).map((m) => m.subject))];
  const filtered = activeSubject
    ? (materials || []).filter((m) => m.subject === activeSubject)
    : materials || [];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">Study Materials</h2>

      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        <button
          type="button"
          data-ocid="study.filter.tab"
          onClick={() => setActiveSubject(null)}
          className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
          style={{
            backgroundColor:
              activeSubject === null
                ? "oklch(var(--edu-cyan))"
                : "oklch(0.175 0.033 243)",
            color:
              activeSubject === null
                ? "oklch(0.115 0.028 243)"
                : "oklch(var(--foreground))",
          }}
        >
          All
        </button>
        {subjects.map((subj) => (
          <button
            key={subj}
            type="button"
            data-ocid="study.filter.tab"
            onClick={() =>
              setActiveSubject(subj === activeSubject ? null : subj)
            }
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            style={{
              backgroundColor:
                activeSubject === subj
                  ? "oklch(var(--edu-cyan))"
                  : "oklch(0.175 0.033 243)",
              color:
                activeSubject === subj
                  ? "oklch(0.115 0.028 243)"
                  : "oklch(var(--foreground))",
            }}
          >
            {subj}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {SKELETONS_5.map((k) => (
            <RowSkeleton key={k} />
          ))}
        </div>
      ) : (
        <div className="space-y-2" data-ocid="study.list">
          {filtered.map((mat, i) => (
            <motion.div
              key={String(mat.id)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              data-ocid={`study.item.${i + 1}`}
              className="flex items-center gap-4 p-4 rounded-2xl border cursor-pointer"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.145 0.032 243), oklch(0.18 0.038 243))",
                borderColor: "oklch(var(--border))",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "oklch(0.80 0.12 85 / 15%)" }}
              >
                <FileText
                  className="w-5 h-5"
                  style={{ color: "oklch(var(--edu-gold))" }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground truncate">
                  {mat.title}
                </h4>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "oklch(var(--muted-foreground))" }}
                >
                  {mat.subject} · {mat.chapter}
                </p>
              </div>
              <button
                type="button"
                data-ocid={`study.download_button.${i + 1}`}
                className="p-2 rounded-xl transition-colors"
                style={{ backgroundColor: "oklch(var(--edu-cyan) / 15%)" }}
                onClick={() => toast.success(`Downloading ${mat.title}`)}
              >
                <Download
                  className="w-4 h-4"
                  style={{ color: "oklch(var(--edu-cyan))" }}
                />
              </button>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div data-ocid="study.empty_state" className="text-center py-12">
              <FileText
                className="w-12 h-12 mx-auto mb-3"
                style={{ color: "oklch(var(--muted-foreground))" }}
              />
              <p style={{ color: "oklch(var(--muted-foreground))" }}>
                No materials found
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── TESTS TAB ────────────────────────────────────────────────────────────────
function TestsTab() {
  const { data: tests, isLoading } = useAllTestSeries();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">Test Series</h2>
      <div
        className="rounded-2xl p-4"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.22 0.07 85), oklch(0.18 0.038 243))",
          border: "1px solid oklch(0.80 0.12 85 / 30%)",
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Award
            className="w-5 h-5"
            style={{ color: "oklch(var(--edu-gold))" }}
          />
          <span className="font-semibold text-foreground">
            All India Mock Tests
          </span>
        </div>
        <p
          className="text-xs"
          style={{ color: "oklch(var(--muted-foreground))" }}
        >
          Compare your rank with {(42000).toLocaleString()}+ students
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {SKELETONS_5.map((k) => (
            <div
              key={k}
              className="rounded-2xl p-4 border"
              style={{
                borderColor: "oklch(var(--border))",
                background: "oklch(0.145 0.032 243)",
              }}
            >
              <Skeleton
                className="h-4 w-3/4 mb-2"
                style={{ backgroundColor: "oklch(0.225 0.042 243)" }}
              />
              <Skeleton
                className="h-3 w-1/2 mb-3"
                style={{ backgroundColor: "oklch(0.225 0.042 243)" }}
              />
              <Skeleton
                className="h-8 w-24 rounded-xl"
                style={{ backgroundColor: "oklch(0.225 0.042 243)" }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3" data-ocid="tests.list">
          {(tests || []).map((test, i) => (
            <motion.div
              key={String(test.id)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              data-ocid={`tests.item.${i + 1}`}
              className="rounded-2xl p-4 border"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.145 0.032 243), oklch(0.18 0.038 243))",
                borderColor: "oklch(var(--border))",
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-semibold text-foreground flex-1 pr-2">
                  {test.title}
                </h4>
                <Badge
                  className="text-xs flex-shrink-0"
                  style={{
                    backgroundColor: "oklch(var(--edu-cyan) / 15%)",
                    color: "oklch(var(--edu-cyan))",
                    border: "1px solid oklch(var(--edu-cyan) / 30%)",
                  }}
                >
                  {test.subject}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1">
                  <Clock
                    className="w-3.5 h-3.5"
                    style={{ color: "oklch(var(--muted-foreground))" }}
                  />
                  <span
                    className="text-xs"
                    style={{ color: "oklch(var(--muted-foreground))" }}
                  >
                    3 hrs
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star
                    className="w-3.5 h-3.5"
                    style={{ color: "oklch(var(--edu-gold))" }}
                  />
                  <span
                    className="text-xs"
                    style={{ color: "oklch(var(--muted-foreground))" }}
                  >
                    {String(test.totalMarks)} marks
                  </span>
                </div>
              </div>
              <Button
                data-ocid={`tests.start_button.${i + 1}`}
                size="sm"
                className="font-semibold text-xs"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(var(--edu-cyan)), oklch(0.55 0.17 240))",
                  color: "oklch(0.115 0.028 243)",
                }}
                onClick={() => toast.success(`Starting: ${test.title}`)}
              >
                Start Test
              </Button>
            </motion.div>
          ))}
          {(tests || []).length === 0 && (
            <div data-ocid="tests.empty_state" className="text-center py-12">
              <CheckSquare
                className="w-12 h-12 mx-auto mb-3"
                style={{ color: "oklch(var(--muted-foreground))" }}
              />
              <p style={{ color: "oklch(var(--muted-foreground))" }}>
                No tests available
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "home", label: "Home", icon: <Home className="w-5 h-5" /> },
  { id: "courses", label: "Courses", icon: <BookOpen className="w-5 h-5" /> },
  { id: "live", label: "Live", icon: <Play className="w-5 h-5" /> },
  { id: "study", label: "Study", icon: <FileText className="w-5 h-5" /> },
  { id: "tests", label: "Tests", icon: <CheckSquare className="w-5 h-5" /> },
];

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

// ─── Admin Panel ───────────────────────────────────────────────────────────────

type AdminSubTab = "courses" | "live" | "materials" | "tests" | "students";

function AdminPanel() {
  const [subTab, setSubTab] = useState<AdminSubTab>("courses");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Settings
          className="w-5 h-5"
          style={{ color: "oklch(var(--edu-cyan))" }}
        />
        <h2 className="text-lg font-bold text-foreground">Admin Panel</h2>
      </div>

      {/* Sub-tab pills */}
      <div
        className="flex gap-2 p-1 rounded-2xl overflow-x-auto"
        style={{ backgroundColor: "oklch(0.16 0.03 243)" }}
      >
        {(
          ["courses", "live", "materials", "tests", "students"] as AdminSubTab[]
        ).map((t) => (
          <button
            key={t}
            type="button"
            data-ocid={`admin.${t}.tab`}
            onClick={() => setSubTab(t)}
            className="whitespace-nowrap flex-shrink-0 px-3 py-2 text-xs font-semibold rounded-xl transition-all"
            style={
              subTab === t
                ? {
                    backgroundColor: "oklch(var(--edu-cyan))",
                    color: "oklch(0.115 0.028 243)",
                  }
                : { color: "oklch(0.6 0.03 220)" }
            }
          >
            {t === "courses"
              ? "Courses"
              : t === "live"
                ? "Live Classes"
                : t === "materials"
                  ? "Study Materials"
                  : t === "tests"
                    ? "Test Series"
                    : "Students"}
          </button>
        ))}
      </div>

      {subTab === "courses" && <AdminCoursesTab />}
      {subTab === "live" && <AdminLiveTab />}
      {subTab === "materials" && <AdminMaterialsTab />}
      {subTab === "tests" && <AdminTestSeriesTab />}
      {subTab === "students" && <AdminStudentsTab />}
    </div>
  );
}

// ─── AdminCoursesTab ──────────────────────────────────────────────────────────

type CourseForm = {
  title: string;
  description: string;
  category: string;
  subjectTags: string;
};

const emptyCourseForm = (): CourseForm => ({
  title: "",
  description: "",
  category: "",
  subjectTags: "",
});

function AdminCoursesTab() {
  const { data: courses = [], isLoading } = useAllCourses();
  const addCourse = useAddCourse();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [form, setForm] = useState<CourseForm>(emptyCourseForm());
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  function openAdd() {
    setEditingId(null);
    setForm(emptyCourseForm());
    setDialogOpen(true);
  }

  function openEdit(course: {
    id: bigint;
    title: string;
    description: string;
    category: string;
    subjectTags: string[];
  }) {
    setEditingId(course.id);
    setForm({
      title: course.title,
      description: course.description,
      category: course.category,
      subjectTags: course.subjectTags.join(", "),
    });
    setDialogOpen(true);
  }

  function handleSubmit() {
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      subjectTags: form.subjectTags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    if (editingId !== null) {
      updateCourse.mutate(
        { courseId: editingId, course: payload },
        {
          onSuccess: () => {
            toast.success("Course updated");
            setDialogOpen(false);
          },
          onError: () => toast.error("Failed to update course"),
        },
      );
    } else {
      addCourse.mutate(payload, {
        onSuccess: () => {
          toast.success("Course added");
          setDialogOpen(false);
        },
        onError: () => toast.error("Failed to add course"),
      });
    }
  }

  const isPending = addCourse.isPending || updateCourse.isPending;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          {courses.length} course{courses.length !== 1 ? "s" : ""}
        </span>
        <Button
          size="sm"
          data-ocid="admin.courses.primary_button"
          onClick={openAdd}
          className="gap-1 text-xs"
          style={{
            backgroundColor: "oklch(var(--edu-cyan))",
            color: "oklch(0.115 0.028 243)",
          }}
        >
          <Plus className="w-3 h-3" /> Add Course
        </Button>
      </div>

      {isLoading ? (
        <div data-ocid="admin.courses.loading_state" className="space-y-2">
          {SKELETONS_4.map((k) => (
            <Skeleton key={k} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div
          data-ocid="admin.courses.empty_state"
          className="text-center py-8 text-muted-foreground text-sm"
        >
          No courses yet. Add one above.
        </div>
      ) : (
        <div className="space-y-2">
          {courses.map((course, idx) => (
            <div
              key={String(course.id)}
              data-ocid={`admin.courses.item.${idx + 1}`}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ backgroundColor: "oklch(0.16 0.03 243)" }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {course.title}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "oklch(0.6 0.03 220)" }}
                >
                  {course.category}
                </p>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  data-ocid={`admin.courses.edit_button.${idx + 1}`}
                  onClick={() => openEdit(course)}
                  className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                  style={{ color: "oklch(var(--edu-cyan))" }}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  data-ocid={`admin.courses.delete_button.${idx + 1}`}
                  onClick={() => setDeleteId(course.id)}
                  className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                  style={{ color: "oklch(var(--edu-red))" }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          data-ocid="admin.courses.dialog"
          className="max-w-sm rounded-2xl border-0"
          style={{ backgroundColor: "oklch(0.13 0.025 243)", color: "inherit" }}
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingId !== null ? "Edit Course" : "Add Course"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Title</Label>
              <Input
                data-ocid="admin.courses.input"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="Course title"
                className="bg-white/5 border-white/10 text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Description
              </Label>
              <Textarea
                data-ocid="admin.courses.textarea"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Course description"
                rows={3}
                className="bg-white/5 border-white/10 text-foreground resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Category</Label>
              <Input
                value={form.category}
                onChange={(e) =>
                  setForm((p) => ({ ...p, category: e.target.value }))
                }
                placeholder="e.g. IIT-JEE, NEET"
                className="bg-white/5 border-white/10 text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Subject Tags (comma-separated)
              </Label>
              <Input
                value={form.subjectTags}
                onChange={(e) =>
                  setForm((p) => ({ ...p, subjectTags: e.target.value }))
                }
                placeholder="Physics, Chemistry, Maths"
                className="bg-white/5 border-white/10 text-foreground"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              data-ocid="admin.courses.cancel_button"
              onClick={() => setDialogOpen(false)}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.courses.submit_button"
              onClick={handleSubmit}
              disabled={isPending || !form.title.trim()}
              style={{
                backgroundColor: "oklch(var(--edu-cyan))",
                color: "oklch(0.115 0.028 243)",
              }}
            >
              {isPending && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              {isPending ? "Saving..." : editingId !== null ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete AlertDialog */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <AlertDialogContent
          data-ocid="admin.courses.dialog"
          className="max-w-sm rounded-2xl border-0"
          style={{ backgroundColor: "oklch(0.13 0.025 243)" }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Delete Course?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="admin.courses.cancel_button"
              className="bg-white/5 border-white/10 text-foreground hover:bg-white/10"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="admin.courses.delete_button"
              onClick={() => {
                if (deleteId !== null) {
                  deleteCourse.mutate(deleteId, {
                    onSuccess: () => {
                      toast.success("Course deleted");
                      setDeleteId(null);
                    },
                    onError: () => toast.error("Failed to delete course"),
                  });
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── AdminLiveTab ─────────────────────────────────────────────────────────────

type LiveForm = {
  title: string;
  teacher: string;
  scheduledTime: string;
  isLive: boolean;
};

const emptyLiveForm = (): LiveForm => ({
  title: "",
  teacher: "",
  scheduledTime: "",
  isLive: false,
});

function nsToDatetimeLocal(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function datetimeLocalToNs(value: string): bigint {
  return BigInt(new Date(value).getTime()) * 1_000_000n;
}

function AdminLiveTab() {
  const { data: classes = [], isLoading } = useAllLiveClasses();
  const addClass = useAddLiveClass();
  const updateClass = useUpdateLiveClass();
  const deleteClass = useDeleteLiveClass();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [form, setForm] = useState<LiveForm>(emptyLiveForm());
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  function openAdd() {
    setEditingId(null);
    setForm(emptyLiveForm());
    setDialogOpen(true);
  }

  function openEdit(cls: {
    id: bigint;
    title: string;
    teacher: string;
    scheduledTime: bigint;
    isLive: boolean;
  }) {
    setEditingId(cls.id);
    setForm({
      title: cls.title,
      teacher: cls.teacher,
      scheduledTime: nsToDatetimeLocal(cls.scheduledTime),
      isLive: cls.isLive,
    });
    setDialogOpen(true);
  }

  function handleSubmit() {
    const payload = {
      title: form.title.trim(),
      teacher: form.teacher.trim(),
      scheduledTime: datetimeLocalToNs(form.scheduledTime),
      isLive: form.isLive,
    };
    if (editingId !== null) {
      updateClass.mutate(
        { classId: editingId, liveClass: payload },
        {
          onSuccess: () => {
            toast.success("Class updated");
            setDialogOpen(false);
          },
          onError: () => toast.error("Failed to update class"),
        },
      );
    } else {
      addClass.mutate(payload, {
        onSuccess: () => {
          toast.success("Class scheduled");
          setDialogOpen(false);
        },
        onError: () => toast.error("Failed to schedule class"),
      });
    }
  }

  const isPending = addClass.isPending || updateClass.isPending;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          {classes.length} class{classes.length !== 1 ? "es" : ""}
        </span>
        <Button
          size="sm"
          data-ocid="admin.live.primary_button"
          onClick={openAdd}
          className="gap-1 text-xs"
          style={{
            backgroundColor: "oklch(var(--edu-cyan))",
            color: "oklch(0.115 0.028 243)",
          }}
        >
          <Plus className="w-3 h-3" /> Schedule Class
        </Button>
      </div>

      {isLoading ? (
        <div data-ocid="admin.live.loading_state" className="space-y-2">
          {SKELETONS_4.map((k) => (
            <Skeleton key={k} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : classes.length === 0 ? (
        <div
          data-ocid="admin.live.empty_state"
          className="text-center py-8 text-muted-foreground text-sm"
        >
          No live classes yet. Schedule one above.
        </div>
      ) : (
        <div className="space-y-2">
          {classes.map((cls, idx) => (
            <div
              key={String(cls.id)}
              data-ocid={`admin.live.item.${idx + 1}`}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ backgroundColor: "oklch(0.16 0.03 243)" }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {cls.title}
                  </p>
                  {cls.isLive && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "oklch(var(--edu-red))",
                        color: "white",
                      }}
                    >
                      LIVE
                    </span>
                  )}
                </div>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "oklch(0.6 0.03 220)" }}
                >
                  {cls.teacher} ·{" "}
                  {new Date(
                    Number(cls.scheduledTime) / 1_000_000,
                  ).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  data-ocid={`admin.live.edit_button.${idx + 1}`}
                  onClick={() => openEdit(cls)}
                  className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                  style={{ color: "oklch(var(--edu-cyan))" }}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  data-ocid={`admin.live.delete_button.${idx + 1}`}
                  onClick={() => setDeleteId(cls.id)}
                  className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                  style={{ color: "oklch(var(--edu-red))" }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          data-ocid="admin.live.dialog"
          className="max-w-sm rounded-2xl border-0"
          style={{ backgroundColor: "oklch(0.13 0.025 243)", color: "inherit" }}
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingId !== null ? "Edit Class" : "Schedule Class"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Title</Label>
              <Input
                data-ocid="admin.live.input"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="Class title"
                className="bg-white/5 border-white/10 text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Teacher</Label>
              <Input
                value={form.teacher}
                onChange={(e) =>
                  setForm((p) => ({ ...p, teacher: e.target.value }))
                }
                placeholder="Teacher name"
                className="bg-white/5 border-white/10 text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Date & Time
              </Label>
              <Input
                type="datetime-local"
                value={form.scheduledTime}
                onChange={(e) =>
                  setForm((p) => ({ ...p, scheduledTime: e.target.value }))
                }
                className="bg-white/5 border-white/10 text-foreground"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                data-ocid="admin.live.switch"
                checked={form.isLive}
                onCheckedChange={(v) => setForm((p) => ({ ...p, isLive: v }))}
              />
              <Label className="text-sm text-foreground">
                Mark as Live Now
              </Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              data-ocid="admin.live.cancel_button"
              onClick={() => setDialogOpen(false)}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.live.submit_button"
              onClick={handleSubmit}
              disabled={isPending || !form.title.trim() || !form.scheduledTime}
              style={{
                backgroundColor: "oklch(var(--edu-cyan))",
                color: "oklch(0.115 0.028 243)",
              }}
            >
              {isPending && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              {isPending
                ? "Saving..."
                : editingId !== null
                  ? "Update"
                  : "Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete AlertDialog */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <AlertDialogContent
          data-ocid="admin.live.dialog"
          className="max-w-sm rounded-2xl border-0"
          style={{ backgroundColor: "oklch(0.13 0.025 243)" }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Delete Class?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="admin.live.cancel_button"
              className="bg-white/5 border-white/10 text-foreground hover:bg-white/10"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="admin.live.delete_button"
              onClick={() => {
                if (deleteId !== null) {
                  deleteClass.mutate(deleteId, {
                    onSuccess: () => {
                      toast.success("Class deleted");
                      setDeleteId(null);
                    },
                    onError: () => toast.error("Failed to delete class"),
                  });
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── AdminMaterialsTab ────────────────────────────────────────────────────────

type MaterialForm = { title: string; subject: string; chapter: string };
const emptyMaterialForm = (): MaterialForm => ({
  title: "",
  subject: "",
  chapter: "",
});

function AdminMaterialsTab() {
  const { data: materials = [], isLoading } = useAllStudyMaterials();
  const addMaterial = useAddStudyMaterial();
  const updateMaterial = useUpdateStudyMaterial();
  const deleteMaterial = useDeleteStudyMaterial();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [form, setForm] = useState<MaterialForm>(emptyMaterialForm());
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  function openAdd() {
    setEditingId(null);
    setForm(emptyMaterialForm());
    setDialogOpen(true);
  }

  function openEdit(mat: {
    id: bigint;
    title: string;
    subject: string;
    chapter: string;
  }) {
    setEditingId(mat.id);
    setForm({ title: mat.title, subject: mat.subject, chapter: mat.chapter });
    setDialogOpen(true);
  }

  function handleSubmit() {
    const payload = {
      title: form.title.trim(),
      subject: form.subject.trim(),
      chapter: form.chapter.trim(),
    };
    if (editingId !== null) {
      updateMaterial.mutate(
        { materialId: editingId, material: payload },
        {
          onSuccess: () => {
            toast.success("Material updated");
            setDialogOpen(false);
          },
          onError: () => toast.error("Failed to update material"),
        },
      );
    } else {
      addMaterial.mutate(payload, {
        onSuccess: () => {
          toast.success("Material added");
          setDialogOpen(false);
        },
        onError: () => toast.error("Failed to add material"),
      });
    }
  }

  const isPending = addMaterial.isPending || updateMaterial.isPending;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          {materials.length} material{materials.length !== 1 ? "s" : ""}
        </span>
        <Button
          size="sm"
          data-ocid="admin.materials.primary_button"
          onClick={openAdd}
          className="gap-1 text-xs"
          style={{
            backgroundColor: "oklch(var(--edu-cyan))",
            color: "oklch(0.115 0.028 243)",
          }}
        >
          <Plus className="w-3 h-3" /> Add Material
        </Button>
      </div>

      {isLoading ? (
        <div data-ocid="admin.materials.loading_state" className="space-y-2">
          {SKELETONS_4.map((k) => (
            <Skeleton key={k} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : materials.length === 0 ? (
        <div
          data-ocid="admin.materials.empty_state"
          className="text-center py-8 text-muted-foreground text-sm"
        >
          No study materials yet. Add one above.
        </div>
      ) : (
        <div className="space-y-2">
          {materials.map((mat, idx) => (
            <div
              key={String(mat.id)}
              data-ocid={`admin.materials.item.${idx + 1}`}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ backgroundColor: "oklch(0.16 0.03 243)" }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {mat.title}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "oklch(0.6 0.03 220)" }}
                >
                  {mat.subject} · {mat.chapter}
                </p>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  data-ocid={`admin.materials.edit_button.${idx + 1}`}
                  onClick={() => openEdit(mat)}
                  className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                  style={{ color: "oklch(var(--edu-cyan))" }}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  data-ocid={`admin.materials.delete_button.${idx + 1}`}
                  onClick={() => setDeleteId(mat.id)}
                  className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                  style={{ color: "oklch(var(--edu-red))" }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          data-ocid="admin.materials.dialog"
          className="max-w-sm rounded-2xl border-0"
          style={{ backgroundColor: "oklch(0.13 0.025 243)", color: "inherit" }}
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingId !== null ? "Edit Material" : "Add Material"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Title</Label>
              <Input
                data-ocid="admin.materials.input"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="Material title"
                className="bg-white/5 border-white/10 text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Subject</Label>
              <Input
                value={form.subject}
                onChange={(e) =>
                  setForm((p) => ({ ...p, subject: e.target.value }))
                }
                placeholder="e.g. Physics"
                className="bg-white/5 border-white/10 text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Chapter</Label>
              <Input
                value={form.chapter}
                onChange={(e) =>
                  setForm((p) => ({ ...p, chapter: e.target.value }))
                }
                placeholder="e.g. Thermodynamics"
                className="bg-white/5 border-white/10 text-foreground"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              data-ocid="admin.materials.cancel_button"
              onClick={() => setDialogOpen(false)}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.materials.submit_button"
              onClick={handleSubmit}
              disabled={isPending || !form.title.trim()}
              style={{
                backgroundColor: "oklch(var(--edu-cyan))",
                color: "oklch(0.115 0.028 243)",
              }}
            >
              {isPending && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              {isPending ? "Saving..." : editingId !== null ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete AlertDialog */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <AlertDialogContent
          data-ocid="admin.materials.dialog"
          className="max-w-sm rounded-2xl border-0"
          style={{ backgroundColor: "oklch(0.13 0.025 243)" }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Delete Material?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="admin.materials.cancel_button"
              className="bg-white/5 border-white/10 text-foreground hover:bg-white/10"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="admin.materials.delete_button"
              onClick={() => {
                if (deleteId !== null) {
                  deleteMaterial.mutate(deleteId, {
                    onSuccess: () => {
                      toast.success("Material deleted");
                      setDeleteId(null);
                    },
                    onError: () => toast.error("Failed to delete material"),
                  });
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── AdminTestSeriesTab ──────────────────────────────────────────────────────

type TestSeriesForm = { title: string; subject: string; totalMarks: string };
const emptyTestSeriesForm = (): TestSeriesForm => ({
  title: "",
  subject: "",
  totalMarks: "",
});

function AdminTestSeriesTab() {
  const { data: tests = [], isLoading } = useAllTestSeries();
  const addTest = useAddTestSeries();
  const updateTest = useUpdateTestSeries();
  const deleteTest = useDeleteTestSeries();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [form, setForm] = useState<TestSeriesForm>(emptyTestSeriesForm());
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  function openAdd() {
    setEditingId(null);
    setForm(emptyTestSeriesForm());
    setDialogOpen(true);
  }

  function openEdit(t: {
    id: bigint;
    title: string;
    subject: string;
    totalMarks: bigint;
  }) {
    setEditingId(t.id);
    setForm({
      title: t.title,
      subject: t.subject,
      totalMarks: String(t.totalMarks),
    });
    setDialogOpen(true);
  }

  function handleSubmit() {
    const payload = {
      title: form.title.trim(),
      subject: form.subject.trim(),
      totalMarks: BigInt(form.totalMarks || "0"),
    };
    if (editingId !== null) {
      updateTest.mutate(
        { testId: editingId, series: payload },
        {
          onSuccess: () => {
            toast.success("Test series updated");
            setDialogOpen(false);
          },
          onError: () => toast.error("Failed to update test series"),
        },
      );
    } else {
      addTest.mutate(payload, {
        onSuccess: () => {
          toast.success("Test series added");
          setDialogOpen(false);
        },
        onError: () => toast.error("Failed to add test series"),
      });
    }
  }

  const isPending = addTest.isPending || updateTest.isPending;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          {tests.length} test series
        </span>
        <Button
          size="sm"
          data-ocid="admin.tests.primary_button"
          onClick={openAdd}
          className="gap-1 text-xs"
          style={{
            backgroundColor: "oklch(var(--edu-cyan))",
            color: "oklch(0.115 0.028 243)",
          }}
        >
          <Plus className="w-3 h-3" /> Add Test Series
        </Button>
      </div>

      {isLoading ? (
        <div data-ocid="admin.tests.loading_state" className="space-y-2">
          {SKELETONS_4.map((k) => (
            <Skeleton key={k} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : tests.length === 0 ? (
        <div
          data-ocid="admin.tests.empty_state"
          className="text-center py-8 text-muted-foreground text-sm"
        >
          No test series yet. Add one above.
        </div>
      ) : (
        <div className="space-y-2">
          {tests.map((t, idx) => (
            <div
              key={String(t.id)}
              data-ocid={`admin.tests.item.${idx + 1}`}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ backgroundColor: "oklch(0.16 0.03 243)" }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {t.title}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "oklch(0.6 0.03 220)" }}
                >
                  {t.subject} · {String(t.totalMarks)} marks
                </p>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  data-ocid={`admin.tests.edit_button.${idx + 1}`}
                  onClick={() => openEdit(t)}
                  className="p-1.5 rounded-lg transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: "oklch(var(--edu-cyan) / 0.15)",
                    color: "oklch(var(--edu-cyan))",
                  }}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  data-ocid={`admin.tests.delete_button.${idx + 1}`}
                  onClick={() => setDeleteId(t.id)}
                  className="p-1.5 rounded-lg transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: "oklch(0.55 0.18 25 / 0.15)",
                    color: "oklch(0.65 0.18 25)",
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          data-ocid="admin.tests.dialog"
          className="max-w-sm rounded-2xl border-0"
          style={{ backgroundColor: "oklch(0.13 0.025 243)" }}
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingId !== null ? "Edit Test Series" : "Add Test Series"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Title</Label>
              <Input
                data-ocid="admin.tests.input"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="e.g. JEE Main Mock Test"
                className="bg-white/5 border-white/10 text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Subject</Label>
              <Input
                value={form.subject}
                onChange={(e) =>
                  setForm((p) => ({ ...p, subject: e.target.value }))
                }
                placeholder="e.g. Physics"
                className="bg-white/5 border-white/10 text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Total Marks
              </Label>
              <Input
                type="number"
                min="0"
                value={form.totalMarks}
                onChange={(e) =>
                  setForm((p) => ({ ...p, totalMarks: e.target.value }))
                }
                placeholder="e.g. 300"
                className="bg-white/5 border-white/10 text-foreground"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              data-ocid="admin.tests.cancel_button"
              onClick={() => setDialogOpen(false)}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.tests.submit_button"
              onClick={handleSubmit}
              disabled={isPending || !form.title.trim()}
              style={{
                backgroundColor: "oklch(var(--edu-cyan))",
                color: "oklch(0.115 0.028 243)",
              }}
            >
              {isPending && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              {isPending ? "Saving..." : editingId !== null ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <AlertDialogContent
          data-ocid="admin.tests.dialog"
          className="max-w-sm rounded-2xl border-0"
          style={{ backgroundColor: "oklch(0.13 0.025 243)" }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Delete Test Series?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="admin.tests.cancel_button"
              className="bg-white/5 border-white/10 text-foreground hover:bg-white/10"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="admin.tests.delete_button"
              onClick={() => {
                if (deleteId !== null) {
                  deleteTest.mutate(deleteId, {
                    onSuccess: () => {
                      toast.success("Test series deleted");
                      setDeleteId(null);
                    },
                    onError: () => toast.error("Failed to delete test series"),
                  });
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── AdminStudentsTab ─────────────────────────────────────────────────────────

function AdminStudentsTab() {
  const { data: students = [], isLoading } = useAllStudentProgress();

  return (
    <div className="space-y-3">
      <span className="text-sm font-medium text-foreground">
        {students.length} student{students.length !== 1 ? "s" : ""} enrolled
      </span>

      {isLoading ? (
        <div data-ocid="admin.students.loading_state" className="space-y-2">
          {SKELETONS_4.map((k) => (
            <Skeleton key={k} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : students.length === 0 ? (
        <div
          data-ocid="admin.students.empty_state"
          className="text-center py-8 text-muted-foreground text-sm"
        >
          No students enrolled yet.
        </div>
      ) : (
        <div className="space-y-2">
          {students.map(([principal, progress], idx) => {
            const principalStr = principal.toString();
            const truncated = `${principalStr.slice(0, 10)}...`;
            const pct = Number(progress.completionPercentage);
            return (
              <div
                key={principalStr}
                data-ocid={`admin.students.item.${idx + 1}`}
                className="p-3 rounded-xl space-y-2"
                style={{ backgroundColor: "oklch(0.16 0.03 243)" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users
                      className="w-4 h-4"
                      style={{ color: "oklch(var(--edu-cyan))" }}
                    />
                    <span className="text-xs font-mono text-foreground">
                      {truncated}
                    </span>
                  </div>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "oklch(var(--edu-cyan))" }}
                  >
                    {pct}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="flex-1 h-1.5 rounded-full"
                    style={{ backgroundColor: "oklch(0.22 0.03 243)" }}
                  >
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${Math.min(pct, 100)}%`,
                        backgroundColor: "oklch(var(--edu-cyan))",
                      }}
                    />
                  </div>
                  <span
                    className="text-xs"
                    style={{ color: "oklch(0.6 0.03 220)" }}
                  >
                    {progress.enrolledCourses.length} course
                    {progress.enrolledCourses.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [authScreen, setAuthScreen] = useState<"login" | "register" | "forgot">(
    "login",
  );
  const initSample = useInitSampleData();
  const { status, refresh } = useAuthFlow();
  const isAdmin = status === "admin";

  const runInit = useCallback(() => {
    initSample.mutate();
  }, [initSample.mutate]);

  useEffect(() => {
    runInit();
  }, [runInit]);

  // Auth routing
  if (status === "loading") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "oklch(0.08 0.02 243)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center animate-pulse"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.175 220), oklch(0.55 0.20 245))",
            }}
          >
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <p className="text-sm" style={{ color: "oklch(0.55 0.025 220)" }}>
            Loading EduCoach...
          </p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <AnimatePresence mode="wait">
        {authScreen === "login" && (
          <LoginPage
            key="login"
            onGoToRegister={() => setAuthScreen("register")}
            onGoToForgotPassword={() => setAuthScreen("forgot")}
          />
        )}
        {authScreen === "register" && (
          <RegisterPage
            key="register"
            onBack={() => setAuthScreen("login")}
            onRegistered={() => setAuthScreen("login")}
          />
        )}
        {authScreen === "forgot" && (
          <ForgotPasswordPage
            key="forgot"
            onBack={() => setAuthScreen("login")}
          />
        )}
      </AnimatePresence>
    );
  }

  if (status === "unregistered") {
    return <RegisterPage onBack={() => {}} onRegistered={refresh} />;
  }

  return (
    <div
      className="min-h-screen flex items-stretch justify-center"
      style={{ backgroundColor: "oklch(0.08 0.02 243)" }}
    >
      <div
        className="w-full max-w-[430px] relative flex flex-col min-h-screen"
        style={{ backgroundColor: "oklch(var(--background))" }}
      >
        {/* Top Header */}
        <header
          className="sticky top-0 z-40 px-4 pt-10 pb-3"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.115 0.028 243) 0%, oklch(0.115 0.028 243 / 95%) 100%)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(var(--edu-cyan)), oklch(0.55 0.17 240))",
                  color: "oklch(0.115 0.028 243)",
                }}
              >
                E
              </div>
              <span className="font-bold text-base text-foreground">
                EduCoach
              </span>
            </div>

            <div
              className="flex-1 flex items-center gap-2 px-3 py-2 rounded-full"
              style={{ backgroundColor: "oklch(0.175 0.033 243)" }}
            >
              <Search
                className="w-3.5 h-3.5 flex-shrink-0"
                style={{ color: "oklch(var(--muted-foreground))" }}
              />
              <input
                data-ocid="header.search_input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses..."
                className="bg-transparent text-xs outline-none flex-1 text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                data-ocid="header.bell_button"
                className="relative p-1.5 rounded-xl"
                style={{ backgroundColor: "oklch(0.175 0.033 243)" }}
              >
                <Bell className="w-4 h-4 text-foreground" />
                <span
                  className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                  style={{ backgroundColor: "oklch(var(--edu-red))" }}
                />
              </button>
              {isAdmin && (
                <button
                  type="button"
                  data-ocid="header.admin.button"
                  onClick={() => setActiveTab("admin")}
                  className="relative p-1.5 rounded-xl transition-colors"
                  style={{
                    backgroundColor:
                      activeTab === "admin"
                        ? "oklch(var(--edu-cyan) / 20%)"
                        : "oklch(0.175 0.033 243)",
                    color:
                      activeTab === "admin"
                        ? "oklch(var(--edu-cyan))"
                        : "oklch(0.7 0.03 220)",
                  }}
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}
              <div
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.80 0.12 85), oklch(0.65 0.10 75))",
                  color: "oklch(0.115 0.028 243)",
                }}
              >
                <Star className="w-3 h-3" />
                Premium
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-4 py-4 pb-28">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === "home" && <HomeTab />}
              {activeTab === "courses" && <CoursesTab />}
              {activeTab === "live" && <LiveTab />}
              {activeTab === "study" && <StudyTab />}
              {activeTab === "tests" && <TestsTab />}
              {activeTab === "admin" && <AdminPanel />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Navigation */}
        <nav
          className="fixed bottom-0 w-full max-w-[430px] z-40 px-2 pb-2 pt-1"
          style={{
            backgroundColor: "oklch(var(--edu-nav))",
            borderTop: "1px solid oklch(var(--border))",
          }}
        >
          <div className="flex items-center justify-around">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  data-ocid={`nav.${item.id}.tab`}
                  onClick={() => setActiveTab(item.id)}
                  className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all relative"
                  style={{
                    color: isActive
                      ? "oklch(var(--edu-cyan))"
                      : "oklch(0.55 0.025 220)",
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-2xl"
                      style={{
                        backgroundColor: "oklch(var(--edu-cyan) / 10%)",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative">{item.icon}</span>
                  <span className="text-[10px] font-medium relative">
                    {item.label}
                  </span>
                  {item.id === "live" && (
                    <span
                      className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ backgroundColor: "oklch(var(--edu-red))" }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        <div
          className="text-center text-xs py-2 px-4"
          style={{ color: "oklch(0.45 0.02 240)" }}
        >
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: "oklch(var(--edu-cyan))" }}
          >
            caffeine.ai
          </a>
        </div>
      </div>

      <Toaster theme="dark" />
    </div>
  );
}
