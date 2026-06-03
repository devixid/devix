import { WindowScrollPosition } from "@/types";

interface ScrollToPositionProps {
  targetX: number;
  targetY: number;
  scrollPosition?: WindowScrollPosition;
  smooth: boolean;
}

export const scrollToPosition = ({
  targetX,
  targetY,
  smooth = true,
}: ScrollToPositionProps) => {
  window.scrollTo({
    top: targetY,
    left: targetX,
    behavior: smooth ? "smooth" : "auto",
  });
};
