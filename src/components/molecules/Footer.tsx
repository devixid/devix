"use client";

import { motion } from "framer-motion";
import { memo } from "react";
import { Heading, Text } from "@/components/atoms";
import Image from "next/image";
import Link from "next/link";
import { Separator } from "@heroui/react";

interface FooterProps {}

function Footer({ ...props }: FooterProps) {
  const exploreMenus = [
    { name: "Our service", route: "#services" },
    { name: "Portfolio", route: "#portfolio" },
    { name: "Team", route: "#team" },
  ];

  const companyMenus = [
    { name: "About us", route: "#about" },
    { name: "Contact", route: "#cta" },
  ];

  const socialMenus = [
    { name: "Instagram", route: "https://instagram.com" },
    { name: "LinkedIn", route: "https://linkedin.com" },
    { name: "GitHub", route: "https://github.com" },
  ];

  return (
    <motion.footer
      className="flex size-full flex-col items-center justify-between bg-black p-10 text-white"
      {...props}
    >
      <div className="mb-20 flex w-full max-w-5xl flex-col items-start justify-between md:flex-row md:items-center">
        <Image
          src="/devix_logo.white.png"
          alt="devix_logo"
          className="hidden md:block"
          width={90}
          height={105}
        />
        <Image
          src="/devix_logo.white.png"
          alt="devix_logo"
          className="mb-10 block md:hidden"
          width={48}
          height={56}
        />
        <div className="flex w-3/4 flex-col items-start justify-around gap-y-10 md:flex-row md:gap-y-0">
          <div className="flex flex-col">
            <Heading.h4 className="mb-2 text-2xl font-light tracking-tight text-white">
              Explore.
            </Heading.h4>
            <ul className="flex flex-col md:gap-y-4">
              {exploreMenus.map((menu, index) => {
                const keyLoop = `key-${index}`;
                return (
                  <li
                    key={keyLoop}
                    className="text-[18px]"
                  >
                    <Link href={menu.route}>{menu.name}</Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="flex flex-col">
            <Heading.h4 className="mb-2 text-2xl font-light tracking-tight text-white">
              Company.
            </Heading.h4>
            <ul className="flex flex-col md:gap-y-4">
              {companyMenus.map((menu, index) => {
                const keyLoop = `key-${index}`;
                return (
                  <li
                    key={keyLoop}
                    className="text-[18px]"
                  >
                    <Link
                      href={menu.route}
                      className="text-gray"
                    >
                      {menu.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="flex flex-col">
            <Heading.h4 className="mb-2 text-2xl font-light tracking-tight text-white">
              Social Media.
            </Heading.h4>
            <ul className="flex flex-col md:gap-y-4">
              {socialMenus.map((menu, index) => {
                const keyLoop = `key-${index}`;
                return (
                  <li
                    key={keyLoop}
                    className="text-[18px]"
                  >
                    <Link href={menu.route} target={menu.route.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">{menu.name}</Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
      <Separator className="max-w-5xl bg-white text-white" />
      <div className="mt-10 flex w-full max-w-5xl flex-col items-start justify-start text-start">
        <Text.span className="text-start">
          Copyright &copy; {new Date().getFullYear()} Devix Indonesia. All rights reserved.
        </Text.span>
      </div>
    </motion.footer>
  );
}

export default memo(Footer);
