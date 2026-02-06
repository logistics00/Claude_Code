import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/authenticate");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-4xl font-bold">Dashboard Page</h1>
    </div>
  );
}
