import Link from "next/link";

const LINKS = [
  { href: "#live", label: "Live" },
  { href: "#route", label: "Route" },
  { href: "#days", label: "Days" },
  { href: "#story", label: "Story" },
  { href: "#updates", label: "Updates" },
  { href: "#sponsors", label: "Sponsors" },
];

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-black/[0.06] bg-paper/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-content items-center justify-between px-6 py-4 md:px-10">
        <Link href="#top" className="text-[15px] font-semibold tracking-tight text-graphite">
          Tobi Runs the Eifelsteig
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm text-fog transition-colors hover:text-graphite"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="#live"
          className="rounded-full bg-black/[0.05] px-4 py-2 text-sm font-medium text-graphite backdrop-blur-md transition-colors hover:bg-black/[0.09]"
        >
          Track Live
        </Link>
      </nav>
    </header>
  );
}
