import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.06] bg-ink px-6 py-14 md:px-10">
      <div className="mx-auto flex max-w-content flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <p className="text-sm font-semibold tracking-tight text-mist">Round Circle Films</p>
          <p className="mt-1 text-sm text-fog">
            Documentary production. {/* TODO: link to the studio's main site once ready. */}
          </p>
        </div>

        <div className="flex items-center gap-6 text-sm text-fog">
          <Link href="#top" className="transition-colors hover:text-mist">
            Back to top
          </Link>
          {/* TODO: swap for real social links (Instagram, YouTube, etc.) */}
          <Link href="mailto:roundcirclefilmsproduction@gmail.com" className="transition-colors hover:text-mist">
            Contact
          </Link>
        </div>

        <p className="text-xs text-fog/70">© {year} Round Circle Films. All rights reserved.</p>
      </div>
    </footer>
  );
}
