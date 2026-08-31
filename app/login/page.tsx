import { LoginForm } from "./login-form";

export const metadata = {
  title: "Sign in — STEAM Hub",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{
        background:
          "radial-gradient(circle at 20% 20%, rgba(0,0,255,0.06), transparent 40%), radial-gradient(circle at 80% 80%, rgba(0,0,255,0.05), transparent 40%), var(--color-bg)",
      }}
    >
      <LoginForm callbackUrl={params.callbackUrl ?? "/"} />
    </div>
  );
}
