"use client";

import { NavbarProps } from "@/interface";
import { cn } from "@/utils";
import { motion } from "framer-motion";
import { memo } from "react";
import { Text } from "@/components/atoms";
import { NavMenu } from "@/constants";
import Image from "next/image";

function Navbar({ isNavbarOpen, setIsNavbarOpen, activeSection = "", ...props }: NavbarProps) {
  let navbarDelayAnimation: number = 0;
  let navbarXPosition: number = 0;

  const isDarkSection = activeSection === "#services" || activeSection === "#cta";

  return (
    <motion.nav
      {...props}
      className={cn(
        isNavbarOpen
          ? "bg-black-1"
          : isDarkSection
          ? "bg-white"
          : "bg-black-1",
        "flex w-full flex-col items-center justify-start px-5 py-2 md:w-1/4 md:rounded-br-[25px] overflow-hidden transition-colors duration-300",
      )}
      initial={{ height: "64px" }}
      animate={{ height: isNavbarOpen ? "320px" : "64px" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="flex w-full items-center justify-between h-[48px]">
        <Image
          src={
            !isNavbarOpen && isDarkSection
              ? "/devix_logo.dark.png"
              : "/devix_logo.white.png"
          }
          alt="devix_logo"
          height={48}
          width={40}
          quality={100}
        />
        <button
          type="button"
          aria-label="menu-button"
          className="z-10 bg-transparent flex flex-col gap-1.5 justify-center items-center w-8 h-8 focus:outline-none cursor-pointer"
          onClick={() => {
            setIsNavbarOpen((prevState) => !prevState);
          }}
        >
          <motion.span
            animate={isNavbarOpen ? { rotate: 45, y: 4.5 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "w-6 h-[2px] block transition-colors duration-300",
              !isNavbarOpen && isDarkSection ? "bg-black" : "bg-white"
            )}
          />
          <motion.span
            animate={isNavbarOpen ? { rotate: -45, y: -4.5 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "w-6 h-[2px] block transition-colors duration-300",
              !isNavbarOpen && isDarkSection ? "bg-black" : "bg-white"
            )}
          />
          <Text.span className="sr-only">Navbar menu</Text.span>
        </button>
      </div>
      <motion.ul
        className="flex w-full flex-col items-center gap-5 py-6"
        initial={{ opacity: 0, display: "none" }}
        animate={isNavbarOpen ? { opacity: 1, display: "flex" } : { opacity: 0, transitionEnd: { display: "none" } }}
        transition={{ duration: 0.2 }}
      >
        {NavMenu.map((menu, index) => {
          if (index > 0) {
            navbarDelayAnimation += 0.1;
            navbarXPosition += -10;
          }

          const isActive = activeSection === menu.id;
          return (
            <motion.li
              key={menu.id}
              className={cn(
                "transition-colors duration-200",
                isActive ? "text-white font-semibold underline decoration-2 underline-offset-4" : "text-gray-400 hover:text-white"
              )}
              initial={{
                x: navbarXPosition,
                opacity: 0,
              }}
              transition={{
                duration: 0.5,
                delay: navbarDelayAnimation,
                type: "spring",
                stiffness: 100,
                velocity: 90,
              }}
              animate={isNavbarOpen ? { x: 0, opacity: 1 } : { x: navbarXPosition, opacity: 0 }}
            >
              <a href={menu.id} onClick={() => setIsNavbarOpen(false)}>{menu.title}</a>
            </motion.li>
          );
        })}
      </motion.ul>
    </motion.nav>
  );
}

export default memo(Navbar);
