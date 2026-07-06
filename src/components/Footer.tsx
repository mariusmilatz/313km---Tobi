import Link from "next/link";
import { INSTAGRAM_URL } from "@/data/social";
import InstagramIcon from "./ui/InstagramIcon";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-black/[0.06] bg-paper px-6 py-14 md:px-10">
      <div className="mx-auto flex max-w-content flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <p className="text-sm font-semibold tracking-tight text-graphite">Round Circle Films</p>
          <p className="mt-1 text-sm text-fog">
            Documentary production. {/* TODO: link to the studio's main site once ready. */}
          </p>
        </div>

        <div className="flex items-center gap-6 text-sm text-fog">
          <Link href="#top" className="transition-colors hover:text-graphite">
            Back to top
          </Link>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-graphite"
          >
            <InstagramIcon className="h-4 w-4" />
            Instagram
          </a>
          <Link href="mailto:roundcirclefilmsproduction@gmail.com" className="transition-colors hover:text-graphite">
            Contact
          </Link>
        </div>

        <p className="text-xs text-fog/70">© {year} Round Circle Films. All rights reserved.</p>
      </div>
    </footer>
  );
}
