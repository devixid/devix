import { cn } from "@/utils";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className={cn("mx-auto flex items-center justify-center")}>
      {children}
    </div>
  );
}
