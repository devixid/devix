import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { SmoothScrollLink } from "@/components/atoms/SmoothScrollLink";
import { DEFAULT_SITE_SECTIONS, type FooterContent } from "@/lib/content-defaults";

const exploreMenus = [
  { name: "Our service", route: "#services" },
  { name: "Projects", route: "/projects" },
  { name: "Team", route: "#team" },
];

const companyMenus = [
  { name: "About us", route: "#about" },
  { name: "Contact", route: "#contact" },
];

const socialMenus = [
  { name: "Instagram", route: "https://instagram.com" },
  { name: "LinkedIn", route: "https://linkedin.com" },
  { name: "GitHub", route: "https://github.com" },
];

function FooterLink({
  href,
  children,
  external,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const className =
    "group relative w-fit text-sm text-zinc-400 transition-colors duration-300 hover:text-white";

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
        <span className="bg-accent absolute bottom-0 left-0 h-[1px] w-0 transition-all duration-400 group-hover:w-full" />
      </a>
    );
  }

  if (href.startsWith("#")) {
    return (
      <SmoothScrollLink href={href} className={className}>
        {children}
        <span className="bg-accent absolute bottom-0 left-0 h-[1px] w-0 transition-all duration-400 group-hover:w-full" />
      </SmoothScrollLink>
    );
  }

  return (
    <Link href={href as Route} className={className}>
      {children}
      <span className="bg-accent absolute bottom-0 left-0 h-[1px] w-0 transition-all duration-400 group-hover:w-full" />
    </Link>
  );
}

export default function Footer({ content }: { content?: FooterContent }) {
  const footer = content ?? DEFAULT_SITE_SECTIONS.FOOTER;

  return (
    <footer className="bg-black-1 w-full border-t border-zinc-800 text-white">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20 lg:px-10">
        <div className="flex flex-col gap-y-12 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-y-4">
            <Link href="/" className="flex items-center gap-x-3">
              <Image
                src="/devix_logo.white.png"
                alt="Devix"
                width={32}
                height={38}
                quality={100}
              />
              <span className="font-display text-xl font-semibold tracking-tight text-white">
                DEVIX
              </span>
            </Link>
            <p className="max-w-[240px] text-sm leading-relaxed text-zinc-500">
              {footer.tagline}
            </p>
          </div>

          <div className="flex flex-col gap-x-16 gap-y-10 sm:flex-row">
            <div className="flex flex-col gap-y-3">
              <h4 className="mb-2 text-[11px] font-medium tracking-[0.2em] text-zinc-500 uppercase">
                Explore
              </h4>
              {exploreMenus.map((menu) => (
                <FooterLink key={menu.name} href={menu.route}>
                  {menu.name}
                </FooterLink>
              ))}
            </div>

            <div className="flex flex-col gap-y-3">
              <h4 className="mb-2 text-[11px] font-medium tracking-[0.2em] text-zinc-500 uppercase">
                Company
              </h4>
              {companyMenus.map((menu) => (
                <FooterLink key={menu.name} href={menu.route}>
                  {menu.name}
                </FooterLink>
              ))}
            </div>

            <div className="flex flex-col gap-y-3">
              <h4 className="mb-2 text-[11px] font-medium tracking-[0.2em] text-zinc-500 uppercase">
                Social
              </h4>
              {socialMenus.map((menu) => (
                <FooterLink key={menu.name} href={menu.route} external>
                  {menu.name}
                </FooterLink>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-zinc-800 pt-8">
          <p className="text-xs text-zinc-600">{footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
