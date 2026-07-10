export function isDevMode(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    (process.env.NEXT_PUBLIC_DEV_MODE || "false") === "true"
  );
}

export const mockUsers = {
  admin: {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Dev Admin",
    email: "admin@dev.local",
    role: "admin",
    permissions: ["users.manage", "artists.verify", "venues.verify"],
  },
  artist: {
    id: "00000000-0000-0000-0000-000000000002",
    name: "Dev Artist",
    email: "artist@dev.local",
    role: "artist",
    permissions: ["bookings.manage", "profile.edit"],
  },
  venue_owner: {
    id: "00000000-0000-0000-0000-000000000003",
    name: "Dev Venue",
    email: "venue@dev.local",
    role: "venue_owner",
    permissions: ["venue.manage", "bookings.manage"],
  },
  client: {
    id: "00000000-0000-0000-0000-000000000004",
    name: "Dev Client",
    email: "client@dev.local",
    role: "client",
    permissions: ["bookings.request"],
  },
};

export function makeDevToken(role: string, id: string) {
  // Simple dev token format: dev-<role>-<id>
  return `dev-${role}-${id}`;
}
