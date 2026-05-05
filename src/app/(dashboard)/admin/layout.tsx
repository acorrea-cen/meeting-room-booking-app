import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, isAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  if (!isAdmin(session.user.role)) redirect("/rooms");

  return (
    <div className="space-y-6">
      <nav className="flex gap-4 border-b pb-2 text-sm">
        <Link href="/admin/rooms" className="hover:underline">
          Salas
        </Link>
        <Link href="/admin/bookings" className="hover:underline">
          Todas las reservas
        </Link>
      </nav>
      {children}
    </div>
  );
}
