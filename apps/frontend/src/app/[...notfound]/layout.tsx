import { cn } from "@/utils";
import React, { FC } from "react";

const Layout: FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className={cn("mx-auto flex items-center justify-center")}>
      {children}
    </div>
  );
};

export default Layout;
