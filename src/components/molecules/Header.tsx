"use client";

import { m } from "framer-motion";
import { memo, useState, useEffect, useCallback } from "react";
import { cn } from "@/utils";
import { NavMenu } from "@/constants";
import { useWindow } from "@/hooks";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

function getElementBackgroundColor(el: Element | null): string {
  if (!el) return "rgb(255, 255, 255)";
  const style = window.getComputedStyle(el);
  const bgColor = style.backgroundColor;

  if (
    bgColor === "transparent" ||
    bgColor === "rgba(0, 0, 0, 0)" ||
    bgColor === "rgba(0,0,0,0)" ||
    bgColor.endsWith(", 0)")
  ) {
    return getElementBackgroundColor(el.parentElement);
  }
  return bgColor;
}

function isDarkColor(colorString: string): boolean {
  const match = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return false;

  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
}

function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [isDarkSection, setIsDarkSection] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollPosition } = useWindow();

  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection(pathname || "");
      return;
    }

    const pendingScroll = sessionStorage.getItem("scrollToSection");
    if (pendingScroll) {
      sessionStorage.removeItem("scrollToSection");
      setTimeout(() => {
        const elem = document.getElementById(pendingScroll);
        if (elem) {
          window.scrollTo({
            top: elem.getBoundingClientRect().top + window.scrollY - 80,
            behavior: "smooth",
          });
        }
      }, 100);
    }

    const sectionIds = [
      "#home",
      "#services",
      "#about",
      "#team",
      "#portfolio",
      "#cta",
    ];
    const elements = sectionIds
      .map((id) => document.querySelector(id))
      .filter((el): el is Element => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`);
          }
        });
      },
      {
        rootMargin: "-80px 0px -80% 0px",
        threshold: 0,
      },
    );

    elements.forEach((el) => observer.observe(el));
    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [pathname]);

  useEffect(() => {
    setIsScrolled(scrollPosition.y > 60);
  }, [scrollPosition.y]);

  useEffect(() => {
    // Sample color from center of header height, offset right to avoid header DOM elements
    const x = window.innerWidth * 0.5;
    const y = 32;

    // Temporarily hide header to get element behind it
    const headerEl = document.querySelector("header");
    if (headerEl) {
      const prevPointerEvents = headerEl.style.pointerEvents;
      headerEl.style.pointerEvents = "none";
      const element = document.elementFromPoint(x, y);
      headerEl.style.pointerEvents = prevPointerEvents;
      const bgColor = getElementBackgroundColor(element);
      setIsDarkSection(isDarkColor(bgColor));
    }
  }, [scrollPosition.y, pathname]);

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, targetPath: string) => {
      setMobileMenuOpen(false);

      if (targetPath.startsWith("#")) {
        const targetId = targetPath.replace(/.*#/, "");
        if (pathname === "/") {
          e.preventDefault();
          const elem = document.getElementById(targetId);
          if (elem) {
            window.scrollTo({
              top: elem.getBoundingClientRect().top + window.scrollY - 80,
              behavior: "smooth",
            });
          }
        } else {
          sessionStorage.setItem("scrollToSection", targetId);
        }
      }
    },
    [pathname],
  );

  // Color scheme based on background detection
  const textColor = isDarkSection ? "text-white" : "text-black-1";
  const borderColor = isDarkSection
    ? "border-zinc-700/60"
    : "border-zinc-200/60";
  const bgBlur = isScrolled
    ? isDarkSection
      ? "bg-black-1/80 backdrop-blur-md"
      : "bg-white/80 backdrop-blur-md"
    : "bg-transparent";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        bgBlur,
        isScrolled && `border-b ${borderColor}`,
      )}
    >
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-6 lg:px-10">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-x-3"
        >
          <Image
            src={
              isDarkSection ? "/devix_logo.white.png" : "/devix_logo.dark.png"
            }
            alt="Devix"
            width={32}
            height={38}
            quality={100}
          />
          <span
            className={cn(
              "font-display text-xl font-semibold tracking-tight transition-colors duration-300",
              textColor,
            )}
          >
            DEVIX
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-x-8 md:flex">
          {NavMenu.map((menu) => {
            const isActive = activeSection === menu.id;
            const isHash = menu.id.startsWith("#");
            const href = isHash ? "/" : menu.id;

            return (
              <Link
                key={menu.id}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                href={href as any}
                onClick={(e) => handleNavClick(e, menu.id)}
                className={cn(
                  "relative text-[13px] font-medium tracking-[0.15em] uppercase transition-colors duration-300",
                  isActive
                    ? isDarkSection
                      ? "text-white"
                      : "text-black-1"
                    : isDarkSection
                      ? "text-zinc-400 hover:text-white"
                      : "hover:text-black-1 text-zinc-500",
                )}
              >
                {menu.title}
                {/* Active indicator */}
                <m.span
                  className="bg-accent absolute -bottom-1 left-0 h-[1px]"
                  initial={false}
                  animate={{ width: isActive ? "100%" : "0%" }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  style={{ display: "block" }}
                />
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA */}
        <Link
          href="/"
          onClick={(e) => handleNavClick(e, "#cta")}
          className={cn(
            "hidden items-center border px-5 py-2.5 text-[13px] font-medium tracking-[0.15em] uppercase transition-all duration-300 md:inline-flex",
            isDarkSection
              ? "hover:text-black-1 border-white/30 text-white hover:bg-white"
              : "border-black-1/20 text-black-1 hover:bg-black-1 hover:text-white",
          )}
        >
          Get in touch
        </Link>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Toggle menu"
          className="z-[60] flex h-8 w-8 cursor-pointer flex-col items-center justify-center gap-[5px] md:hidden"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          <m.span
            animate={
              mobileMenuOpen ? { rotate: 45, y: 3.5 } : { rotate: 0, y: 0 }
            }
            transition={{ duration: 0.25 }}
            className={cn(
              "block h-[1.5px] w-6 transition-colors duration-300",
              mobileMenuOpen
                ? "bg-white"
                : isDarkSection
                  ? "bg-white"
                  : "bg-black-1",
            )}
          />
          <m.span
            animate={
              mobileMenuOpen ? { rotate: -45, y: -3.5 } : { rotate: 0, y: 0 }
            }
            transition={{ duration: 0.25 }}
            className={cn(
              "block h-[1.5px] w-6 transition-colors duration-300",
              mobileMenuOpen
                ? "bg-white"
                : isDarkSection
                  ? "bg-white"
                  : "bg-black-1",
            )}
          />
        </button>
      </div>

      {/* Mobile overlay */}
      <m.div
        initial={false}
        animate={mobileMenuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "bg-black-1 fixed inset-0 top-0 z-50 flex flex-col items-center justify-center gap-y-8 md:hidden",
          mobileMenuOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        {NavMenu.map((menu, index) => {
          const isActive = activeSection === menu.id;
          const isHash = menu.id.startsWith("#");
          const href = isHash ? "/" : menu.id;

          return (
            <m.div
              key={menu.id}
              initial={{ opacity: 0, y: 20 }}
              animate={
                mobileMenuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={{
                duration: 0.4,
                delay: index * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <Link
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                href={href as any}
                onClick={(e) => handleNavClick(e, menu.id)}
                className={cn(
                  "font-display inline-block text-3xl font-light tracking-tight transition-colors",
                  isActive ? "text-accent" : "text-zinc-400 hover:text-white",
                )}
              >
                {menu.title}
              </Link>
            </m.div>
          );
        })}
        <m.div
          initial={{ opacity: 0 }}
          animate={mobileMenuOpen ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Link
            href="/"
            onClick={(e) => handleNavClick(e, "#cta")}
            className="hover:text-black-1 mt-4 inline-block border border-white/30 px-8 py-3 text-sm tracking-[0.2em] text-white uppercase transition-all duration-300 hover:bg-white"
          >
            Get in touch
          </Link>
        </m.div>
      </m.div>
    </header>
  );
}

export default memo(Header);
