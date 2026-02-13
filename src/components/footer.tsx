import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

const TAGLINE = "AI survival toolkit for international students in Germany";
const CONTACT_EMAIL = "prateek.saurabh212@gmail.com";

export function Footer() {
  return (
    <footer className="relative z-20 w-full border-t border-white/10 bg-muted/80 backdrop-blur-xl">
      <div className="w-full px-4 py-10 md:px-8 md:py-12">
        <div className="grid gap-8 md:grid-cols-3 md:gap-12">
          {/* Branding & Contact */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Logo className="text-lg md:text-xl" />
            </div>
            <p className="max-w-xs text-sm text-muted-foreground">
              {TAGLINE}
            </p>
            <Button asChild size="default" className="gap-2">
              <a href={`mailto:${CONTACT_EMAIL}`}>
                <MessageCircle className="h-4 w-4" />
                Contact Us
              </a>
            </Button>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Follow Us / Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              Follow Us
            </h3>
            <div className="flex items-center gap-3">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-background/80 backdrop-blur-sm text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
                aria-label="Email us"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              {CONTACT_EMAIL}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
