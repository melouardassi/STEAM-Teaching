import {
  Home,
  CalendarDays,
  BookOpen,
  Users,
  ClipboardList,
  KanbanSquare,
  Lightbulb,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/students", label: "Students", icon: Users },
  { href: "/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/tasks", label: "Tasks", icon: KanbanSquare },
  { href: "/projects", label: "Project Ideas", icon: Lightbulb },
  { href: "/settings", label: "Settings", icon: Settings },
];
