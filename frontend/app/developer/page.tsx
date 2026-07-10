"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { isDevMode, makeDevToken, mockUsers } from "@/utils/dev-mode";
import { useRouter } from "next/navigation";

export default function DeveloperPage() {
  const router = useRouter();
  const { user, setAuth, clearAuth } = useAuth();

  if (!isDevMode()) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-bold text-white">Not Found</h2>
        <p className="text-text-secondary">Developer tools are not enabled in this environment.</p>
      </div>
    );
  }

  const handleSelect = (role: keyof typeof mockUsers) => {
    const u = mockUsers[role];
    const token = makeDevToken(u.role, u.id);
    try {
      localStorage.setItem("dev_auth_token", token);
      localStorage.setItem("access_token", token);
    } catch (e) {
      // ignore storage errors
    }
    setAuth(u as any, token);
    const path = `/${u.role === "venue_owner" ? "venue" : u.role}/dashboard`;
    router.push(path);
  };

  const handleClear = () => {
    try {
      localStorage.removeItem("dev_auth_token");
      localStorage.removeItem("access_token");
    } catch (e) {
      // ignore
    }
    clearAuth();
    router.push("/");
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-primary text-sm font-semibold">
          Development Mode Enabled
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {(["admin", "artist", "venue_owner", "client"] as const).map((r) => {
          const u = mockUsers[r as keyof typeof mockUsers];
          return (
            <Card key={r} className="p-4">
              <CardHeader>
                <CardTitle>{u.name}</CardTitle>
                <CardDescription className="text-xs">Role: {u.role}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary mb-3">{u.email}</p>
                <div className="mb-3 text-xs text-text-secondary">
                  Permissions: {u.permissions.join(", ")}
                </div>
                <Button size="sm" onClick={() => handleSelect(r as any)} className="w-full">
                  Login as{" "}
                  {u.role === "venue_owner"
                    ? "Venue Owner"
                    : u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <div className="text-sm text-text-secondary">Current:</div>
        <div className="text-sm text-white">{user ? `${user.name} (${user.role})` : "None"}</div>
        <Button variant="outline" size="sm" onClick={handleClear} className="ml-auto">
          Clear Dev Session
        </Button>
      </div>
    </div>
  );
}
