"use client";

import { useRef, useTransition } from "react";
import { toast } from "sonner";
import { KeyRound, Save } from "lucide-react";
import { changePassword } from "@/lib/actions/settings";

export function PasswordCard() {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await changePassword(formData);
      if (result.ok) {
        toast.success("Password changed");
        formRef.current?.reset();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="card p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <KeyRound className="h-4 w-4" style={{ color: "var(--color-primary)" }} />
        <h2 className="font-heading text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
          Change password
        </h2>
      </div>
      <form ref={formRef} action={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Current password</label>
          <input name="currentPassword" type="password" required autoComplete="current-password" className="input" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">New password</label>
          <input name="newPassword" type="password" required minLength={8} autoComplete="new-password" className="input" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Confirm new password</label>
          <input name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" className="input" />
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={pending} className="btn-primary">
            <Save className="h-3.5 w-3.5" /> {pending ? "Updating…" : "Update password"}
          </button>
        </div>
      </form>
    </div>
  );
}
