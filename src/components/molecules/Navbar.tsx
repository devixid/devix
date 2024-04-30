"use client";

import { NavbarProps } from "@/interface";
import { cn } from "@/utils";
import { motion } from "framer-motion";
import { memo } from "react";
import { Text } from "@/components/atoms";
import { HiBars2 } from "react-icons/hi2";
import { NavMenu } from "@/constants";
import Image from "next/image";
import { useWindow } from "@/hooks";

function Navbar({ isNavbarOpen, setIsNavbarOpen, ...props }: NavbarProps) {
  const { scrollPosition } = useWindow();
  let navbarDelayAnimation: number = 0;
  let navbarXPosition: number = 0;

  return (
    <motion.nav
      {...props}
      className={cn(
        `${scrollPosition.y >= 917 && scrollPosition.y <= 1620 ? "bg-white" : "bg-black-1"}`,
        "flex w-full flex-col items-center justify-between px-5 py-2 md:w-1/4 md:rounded-br-[25px]",
      )}
      initial={{ height: "64px" }}
      animate={{ height: isNavbarOpen ? "50%" : "64px" }}
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
              `${scrollPosition.y >= 917 && scrollPosition.y <= 1620 ? "text-black" : "text-white"}`,
            )}
          />
          <Text.span className="sr-only">Navbar menu</Text.span>
        </button>
      </div>
      <motion.ul
        className={cn(
          ` ${
            isNavbarOpen
              ? "opacity-1 top-16 rounded-br-lg"
              : "-top-60 rounded-none opacity-0"
          } flex h-[40vh] w-full flex-col items-center justify-evenly transition-all duration-1000`,
        )}
      >
        {NavMenu.map((menu, index) => {
          if (index > 0) {
            navbarDelayAnimation += 0.1;
            navbarXPosition += -10;
          }

          return (
            <motion.li
              key={Math.floor(Math.random() * 230498234)}
              className={cn(
                `${scrollPosition.y >= 917 ? "text-black" : "text-white"}`,
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
              animate={{ x: 0, opacity: 1 }}
            >
              <a href={menu.id}>{menu.title}</a>
            </motion.li>
          );
        })}
      </motion.ul>
    </motion.nav>
  );
}

export default memo(Navbar);
