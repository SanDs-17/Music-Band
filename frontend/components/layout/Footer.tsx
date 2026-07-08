import Link from "next/link";
import { Music } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-card/50 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
        <div className="flex flex-col items-center md:items-start gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-1.5 bg-primary rounded-lg">
              <Music className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tighter text-white">
              Band<span className="text-primary">Connect</span>
            </span>
          </Link>
          <p className="text-xs text-text-muted mt-2">
            Direct live entertainment bookings, automated schedules, secure payouts.
          </p>
        </div>
        <div className="flex gap-6 text-sm">
          <Link href="/artists" className="text-text-secondary hover:text-white transition-colors">
            Artists
          </Link>
          <Link href="/venues" className="text-text-secondary hover:text-white transition-colors">
            Venues
          </Link>
          <Link href="/terms" className="text-text-secondary hover:text-white transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-text-secondary hover:text-white transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-border/30 mt-8 pt-6 text-center">
        <p className="text-xs text-text-muted">
          &copy; {new Date().getFullYear()} BandConnect. All rights reserved. Made for professional artists.
        </p>
      </div>
    </footer>
  );
}
