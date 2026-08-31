export const QUOTES = [
  { text: "Design is not just what it looks like — design is how it works.", author: "Steve Jobs" },
  { text: "Every artist was first an amateur.", author: "Ralph Waldo Emerson" },
  { text: "Creativity is intelligence having fun.", author: "Albert Einstein" },
  { text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
  { text: "Good design is as little design as possible.", author: "Dieter Rams" },
  { text: "Failure is simply the opportunity to begin again, this time more intelligently.", author: "Henry Ford" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  { text: "The details are not the details. They make the design.", author: "Charles Eames" },
  { text: "Students don't remember what you say — they remember what they built.", author: "Anonymous Maker-Teacher" },
  { text: "A prototype is worth a thousand meetings.", author: "IDEO" },
  { text: "Play is the highest form of research.", author: "Albert Einstein" },
  { text: "Iteration is the mother of invention.", author: "Anonymous" },
] as const;

export function quoteForToday(seedDate = new Date()) {
  const dayOfYear = Math.floor(
    (Date.UTC(seedDate.getFullYear(), seedDate.getMonth(), seedDate.getDate()) -
      Date.UTC(seedDate.getFullYear(), 0, 0)) /
      86400000
  );
  return QUOTES[dayOfYear % QUOTES.length];
}

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const DAY_NAMES_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const SCHOOL_DAYS = [1, 2, 3, 4, 5]; // Mon-Fri

export const PROJECT_TAGS = [
  "3D printing",
  "architecture",
  "robotics",
  "branding",
  "product design",
  "IB Design",
  "sustainability",
  "engineering",
] as const;

export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "DONE"] as const;

export const PRIORITY_STYLES: Record<string, { label: string; className: string }> = {
  LOW: { label: "Low", className: "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)]" },
  MEDIUM: { label: "Medium", className: "bg-blue-100 text-[var(--color-primary)] dark:bg-blue-500/15" },
  HIGH: { label: "High", className: "bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300" },
  URGENT: { label: "Urgent", className: "bg-red-100 text-[var(--color-danger)] dark:bg-red-500/15" },
};

export const COURSE_COLORS = ["#0000FF", "#00C853", "#FF3B3B", "#9333EA", "#F59E0B", "#0EA5E9", "#EC4899", "#14B8A6"];
