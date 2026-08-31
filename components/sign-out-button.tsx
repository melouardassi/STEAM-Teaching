import { signOut } from "@/auth";
import { LogOut } from "lucide-react";

export function SignOutButton({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <button
        type="submit"
        className={collapsed ? "flex w-full justify-center rounded-lg px-3 py-2" : "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"}
        style={{ color: "var(--color-ink-muted)" }}
        title="Sign out"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        {!collapsed && <span>Sign out</span>}
      </button>
    </form>
  );
}
