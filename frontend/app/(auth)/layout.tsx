import Link from "next/link";
import { Music } from "lucide-react";
import { GuestRoute } from "@/components/shared/GuestRoute";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GuestRoute>
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-bg-primary py-12 px-6">
        <div className="absolute inset-0 glow-overlay pointer-events-none" />
        <div className="relative z-10 w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-primary rounded-lg">
                <Music className="h-6 w-6 text-white" />
              </div>
              <span className="font-extrabold text-2xl tracking-tighter text-white">
                Band<span className="text-primary">Connect</span>
              </span>
            </Link>
          </div>
          <div className="glass-card rounded-2xl p-8 shadow-xl">
            {children}
          </div>
        </div>
      </div>
    </GuestRoute>
  );
}
