import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/modules/auth/infrastructure/auth.config";
import { Sidebar } from "@/components/admin/Sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userName={session.user.name ?? "Administrador"} role={session.user.role} />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
