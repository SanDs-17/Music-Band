import { redirect } from "next/navigation";

export default function ArtistInboxRedirectPage() {
  redirect("/artist/bookings?tab=inbox");
}
