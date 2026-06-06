import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { SmoothScrollLink } from "@/components/atoms/SmoothScrollLink";
import { DEFAULT_SITE_SECTIONS, type FooterContent } from "@/lib/content-defaults";
import type { SocialLinks } from "@/lib/site-settings";

const companyMenus = [
  { name: "About us", route: "#about" },
  { name: "Contact", route: "#contact" },
];

const SOCIAL_LINK_CONFIG: {
  key: keyof SocialLinks;
  label: string;
}[] = [
  { key: "instagram", label: "Instagram" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "github", label: "GitHub" },
  { key: "twitter", label: "Twitter / X" },
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

function buildSocialMenus(socialLinks?: SocialLinks | null) {
  if (!socialLinks) return [];

  return SOCIAL_LINK_CONFIG.flatMap(({ key, label }) => {
    const url = socialLinks[key]?.trim();
    if (!url) return [];
    return [{ name: label, route: url }];
  });
}

export default function Footer({
  content,
  socialLinks,
}: {
  content?: FooterContent;
  socialLinks?: SocialLinks | null;
}) {
  const footer = content ?? DEFAULT_SITE_SECTIONS.FOOTER;
  const exploreMenus = footer.navLinks.map((link) => ({
    name: link.label,
    route: link.href,
  }));
  const socialMenus = buildSocialMenus(socialLinks);

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

            {socialMenus.length > 0 && (
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
            )}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-zinc-800 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-600">{footer.copyright}</p>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <Link
              href="/privacy"
              className="transition-colors hover:text-white"
            >
              Privacy Policy
            </Link>
            <span aria-hidden className="text-zinc-700">
              ·
            </span>
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
