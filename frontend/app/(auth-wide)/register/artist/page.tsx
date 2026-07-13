import { Metadata } from "next";
import { ArtistRegisterForm } from "@/components/artist/ArtistRegisterForm";

export const metadata: Metadata = {
  title: "Register as Artist / Band | BandConnect",
  description: "Register your music band or performer profile to get bookings from clients.",
};

export default function ArtistRegisterPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <ArtistRegisterForm />
    </div>
  );
}
