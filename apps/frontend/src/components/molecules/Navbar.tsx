"use client";

import { Text } from "@/components/atoms";
import { NavMenu } from "@/constants";
import { useWindow } from "@/hooks";
import { NavbarProps } from "@/interface";
import { cn } from "@/utils";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { memo } from "react";
import { HiBars2 } from "react-icons/hi2";

function Navbar({ isNavbarOpen, setIsNavbarOpen, ...props }: NavbarProps) {
  const { scrollPosition } = useWindow();

  return (
    <motion.nav
      {...props}
      className={cn(
        scrollPosition.y >= 917 && scrollPosition.y <= 1620
          ? "bg-white"
          : "bg-black-1",
        "flex w-full flex-col overflow-hidden px-5 py-2 md:w-[450px] md:rounded-br-[25px]",
      )}
      initial={{ height: "64px" }}
      animate={{ height: isNavbarOpen ? "339px" : "64px" }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex w-full items-center justify-between">
        <Image
          src={
            scrollPosition.y >= 917 && scrollPosition.y <= 1620
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
          className="z-10 bg-transparent"
          onClick={() => {
            setIsNavbarOpen((prevState) => !prevState);
          }}
        >
          <HiBars2
            className={cn(
              "text-3xl",
              `${
                scrollPosition.y >= 917 && scrollPosition.y <= 1620
                  ? "text-black"
                  : "text-white"
              }`,
            )}
          />
          <Text.span className="sr-only">Navbar menu</Text.span>
        </button>
      </div>

      <motion.ul
        className={cn(
          isNavbarOpen ? "opacity-1 rounded-br-lg" : "rounded-none opacity-0",
          "flex min-h-[250px] w-full flex-col items-center justify-center gap-8 transition-all duration-1000",
        )}
      >
        {NavMenu.map((menu, index) => {
          const key = `${index}`;
          const navbarXPosition = Number.parseInt(`${(index + 1) * -10}`, 10);
          const navbarDelayAnimation =
            Number.parseFloat(`0.${index + 1}`) - 0.05;

          return (
            <AnimatePresence key={key}>
              {isNavbarOpen && (
                <motion.li
                  className={cn(
                    scrollPosition.y >= 917 && scrollPosition.y <= 1620
                      ? "text-black"
                      : "text-white",
                  )}
                  initial={{
                    x: navbarXPosition,
                    opacity: 0,
                  }}
                  exit={{
                    x: navbarXPosition,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.2,
                    delay: navbarDelayAnimation,
                    type: "spring",
                    stiffness: 150,
                    velocity: 90,
                  }}
                  animate={{ x: 0, opacity: 1 }}
                >
                  <a
                    href={menu.id}
                    onClick={() => {
                      setIsNavbarOpen(false);
                    }}
                  >
                    {menu.title}
                  </a>
                </motion.li>
              )}
            </AnimatePresence>
          );
        })}
      </motion.ul>
    </motion.nav>
  );
}

export default memo(Navbar);
