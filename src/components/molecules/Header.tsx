"use client";

import { m } from "framer-motion";
import {
  memo,
  useState,
  useEffect,
  useCallback,
  useRef,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils";
import { NavMenu } from "@/constants";
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
  const [mounted, setMounted] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const isDarkRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

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
    const headerEl = headerRef.current;
    if (!headerEl) return;

    const updateHeaderOnScroll = () => {
      headerEl.classList.toggle("header-scrolled", window.scrollY > 60);

      const x = window.innerWidth * 0.5;
      const y = 32;
      const prevPointerEvents = headerEl.style.pointerEvents;
      headerEl.style.pointerEvents = "none";
      const element = document.elementFromPoint(x, y);
      headerEl.style.pointerEvents = prevPointerEvents;

      const dark = isDarkColor(getElementBackgroundColor(element));
      if (dark !== isDarkRef.current) {
        isDarkRef.current = dark;
        setIsDarkSection(dark);
      }
    };

    updateHeaderOnScroll();
    window.addEventListener("scroll", updateHeaderOnScroll, { passive: true });
    window.addEventListener("resize", updateHeaderOnScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateHeaderOnScroll);
      window.removeEventListener("resize", updateHeaderOnScroll);
    };
  }, [pathname]);

  const handleNavClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>, targetPath: string) => {
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

  const menuOpenTheme = mobileMenuOpen;
  const useDarkHeaderTheme = menuOpenTheme || isDarkSection;
  const textColor = useDarkHeaderTheme ? "text-white" : "text-black-1";
  return (
    <header
      ref={headerRef}
      data-theme={isDarkSection ? "dark" : "light"}
      className={cn(
        "site-header fixed inset-x-0 top-0",
        mobileMenuOpen ? "z-[110] bg-black-1" : "z-50 bg-transparent",
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
              useDarkHeaderTheme
                ? "/devix_logo.white.png"
                : "/devix_logo.dark.png"
            }
            alt="Devix"
            width={32}
            height={38}
            quality={100}
            priority
            sizes="32px"
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
          className="relative z-[110] flex h-8 w-8 cursor-pointer flex-col items-center justify-center gap-[5px] md:hidden"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          <m.span
            animate={
              mobileMenuOpen ? { rotate: 45, y: 3.5 } : { rotate: 0, y: 0 }
            }
            transition={{ duration: 0.25 }}
            className={cn(
              "block h-[1.5px] w-6 transition-colors duration-300",
              useDarkHeaderTheme ? "bg-white" : "bg-black-1",
            )}
          />
          <m.span
            animate={
              mobileMenuOpen ? { rotate: -45, y: -3.5 } : { rotate: 0, y: 0 }
            }
            transition={{ duration: 0.25 }}
            className={cn(
              "block h-[1.5px] w-6 transition-colors duration-300",
              useDarkHeaderTheme ? "bg-white" : "bg-black-1",
            )}
          />
        </button>
      </div>

      {mounted &&
        createPortal(
          <div
            aria-hidden={!mobileMenuOpen}
            className={cn(
              "fixed inset-0 z-[100] md:hidden",
              mobileMenuOpen ? "pointer-events-auto" : "pointer-events-none",
            )}
          >
            {/* Solid backdrop — no opacity animation so background stays opaque */}
            <div
              className={cn(
                "absolute inset-0 bg-black-1 transition-opacity duration-300",
                mobileMenuOpen ? "opacity-100" : "opacity-0",
              )}
            />

            <div
              className={cn(
                "relative flex h-full flex-col items-center justify-center gap-y-8 px-6 transition-opacity duration-300",
                mobileMenuOpen ? "opacity-100" : "opacity-0",
              )}
            >
              {NavMenu.map((menu, index) => {
                const isActive = activeSection === menu.id;
                const isHash = menu.id.startsWith("#");
                const href = isHash ? "/" : menu.id;

                return (
                  <m.div
                    key={menu.id}
                    initial={false}
                    animate={
                      mobileMenuOpen
                        ? { opacity: 1, y: 0 }
                        : { opacity: 0, y: 20 }
                    }
                    transition={{
                      duration: 0.4,
                      delay: mobileMenuOpen ? index * 0.08 : 0,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <Link
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      href={href as any}
                      onClick={(e) => handleNavClick(e, menu.id)}
                      className={cn(
                        "font-display inline-block text-3xl font-light tracking-tight transition-colors",
                        isActive
                          ? "text-accent"
                          : "text-zinc-400 hover:text-white",
                      )}
                    >
                      {menu.title}
                    </Link>
                  </m.div>
                );
              })}
              <m.div
                initial={false}
                animate={mobileMenuOpen ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.4, delay: mobileMenuOpen ? 0.4 : 0 }}
              >
                <Link
                  href="/"
                  onClick={(e) => handleNavClick(e, "#cta")}
                  className="hover:text-black-1 mt-4 inline-block border border-white/30 px-8 py-3 text-sm tracking-[0.2em] text-white uppercase transition-all duration-300 hover:bg-white"
                >
                  Get in touch
                </Link>
              </m.div>
            </div>
          </div>,
          document.body,
        )}
    </header>
  );
}

export default memo(Header);
