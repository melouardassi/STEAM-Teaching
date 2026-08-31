"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { User, Save } from "lucide-react";
import { updateProfile } from "@/lib/actions/settings";

export function ProfileCard({ name, schoolName }: { name: string; schoolName: string }) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.ok) toast.success("Profile updated");
      else toast.error(result.error);
    });
  }

  return (
    <div className="card p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <User className="h-4 w-4" style={{ color: "var(--color-primary)" }} />
        <h2 className="font-heading text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
          Profile
        </h2>
      </div>
      <form action={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Name</label>
          <input name="name" defaultValue={name} required className="input" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">School name</label>
          <input name="schoolName" defaultValue={schoolName} required className="input" />
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={pending} className="btn-primary">
            <Save className="h-3.5 w-3.5" /> {pending ? "Saving…" : "Save profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
