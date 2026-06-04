/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";

function Footer() {
  const exploreMenus = [
    { name: "Our service", route: "#services" },
    { name: "Portfolio", route: "#portfolio" },
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

  return (
    <footer className="w-full bg-black-1 text-white border-t border-zinc-800">
      <div className="mx-auto max-w-6xl px-6 lg:px-10 py-16 md:py-20">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-y-12">
          {/* Logo + tagline */}
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
            <p className="text-sm text-zinc-500 max-w-[240px] leading-relaxed">
              Crafting digital experiences for global brands.
            </p>
          </div>

          {/* Link columns */}
          <div className="flex flex-col sm:flex-row gap-x-16 gap-y-10">
            <div className="flex flex-col gap-y-3">
              <h4 className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500 mb-2">
                Explore
              </h4>
              {exploreMenus.map((menu) => (
                <Link
                  key={menu.name}
                  href={menu.route as any}
                  className="group relative text-sm text-zinc-400 hover:text-white transition-colors duration-300 w-fit"
                >
                  {menu.name}
                  <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-accent group-hover:w-full transition-all duration-400" />
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-y-3">
              <h4 className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500 mb-2">
                Company
              </h4>
              {companyMenus.map((menu) => (
                <Link
                  key={menu.name}
                  href={menu.route as any}
                  className="group relative text-sm text-zinc-400 hover:text-white transition-colors duration-300 w-fit"
                >
                  {menu.name}
                  <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-accent group-hover:w-full transition-all duration-400" />
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-y-3">
              <h4 className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500 mb-2">
                Social
              </h4>
              {socialMenus.map((menu) => (
                <Link
                  key={menu.name}
                  href={menu.route as any}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative text-sm text-zinc-400 hover:text-white transition-colors duration-300 w-fit"
                >
                  {menu.name}
                  <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-accent group-hover:w-full transition-all duration-400" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-zinc-800">
          <p className="text-xs text-zinc-600">
            Copyright &copy; {new Date().getFullYear()} Devix. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
