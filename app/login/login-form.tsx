"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";
import { Sparkles, Loader2 } from "lucide-react";

const initialState: LoginState = {};

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex flex-col items-center text-center">
        <div
          className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm"
          style={{ background: "var(--color-primary)" }}
        >
          <Sparkles className="h-7 w-7 text-white" />
        </div>
        <h1 className="font-heading text-2xl font-semibold" style={{ color: "var(--color-ink)" }}>
          STEAM Hub
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-ink-muted)" }}>
          Sign in to your teaching dashboard
        </p>
      </div>

      <form action={formAction} className="card space-y-4 p-6">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue="admin@steamhub.app"
            className="input"
            placeholder="you@school.edu"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="input"
            placeholder="••••••••"
          />
        </div>

        {state.error && (
          <p
            role="alert"
            className="rounded-lg px-3 py-2 text-sm"
            style={{ background: "rgba(255,59,59,0.1)", color: "var(--color-danger)" }}
          >
            {state.error}
          </p>
        )}

        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-xs" style={{ color: "var(--color-ink-muted)" }}>
        A private, single-user planning tool — not open for registration.
      </p>
    </div>
  );
}
