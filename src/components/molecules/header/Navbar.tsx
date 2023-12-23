"use client";

import { NavMenuInterface, NavbarProps } from "@/interface";
import { cn } from "@/utils";
import { Image } from "@nextui-org/react";
import { motion } from "framer-motion";
import { memo, useState } from "react";
import { Text } from "@/components/atoms";
import { HiBars2 } from "react-icons/hi2";

function Navbar({ ...props }: NavbarProps) {
  const [isNavbarOpen, setIsNavbarOpen] = useState<boolean>(false);

  const NavMenu: Array<NavMenuInterface> = [
    {
      title: "Home",
      id: "#main-content",
    },
    {
      title: "Services",
      id: "#services",
    },
    {
      title: "Team",
      id: "#team",
    },
    {
      title: "Portofolio",
      id: "#portfolio",
    },
  ];

  return (
    <motion.nav
      {...props}
      className={cn(
        `flex w-1/4 flex-col items-center justify-between ${
          isNavbarOpen ? "h-2/4" : "h-14"
        } rounded-br-lg bg-black-1 px-5 py-2 transition-all duration-1000`,
      )}
    >
      <div className="flex w-full items-center justify-between">
        <Image
          src="/devix_logo.white.png"
          alt="devix_logo"
          className="h-10"
        />
        <button
          type="button"
          aria-label="menu-button"
          className="z-10 bg-transparent"
          onClick={() => {
            setIsNavbarOpen((prevState) => !prevState);
          }}
        >
          <HiBars2 className="text-3xl text-white" />
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
        {NavMenu.map((menu) => {
          return (
            <li
              key={Math.floor(Math.random() * 230498234)}
              className="text-white"
            >
              <a href={menu.id}>{menu.title}</a>
            </li>
          );
        })}
      </motion.ul>
    </motion.nav>
  );
}

export default memo(Navbar);
