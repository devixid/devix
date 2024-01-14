import { useCallback, useEffect, useState } from "react";
import type {
  UseWindowReturnTypes,
  WindowPaneSize,
  WindowScrollPosition,
} from "@/types";

const useWindow = (): UseWindowReturnTypes => {
  const [scrollPosition, setScrollPosition] = useState<WindowScrollPosition>({
    x: 0,
    y: 0,
  });
  const [windowPaneSize, setWindowPaneSize] = useState<WindowPaneSize>({
    width: 0,
    height: 0,
  });

  /**
   * Update scroll position when user scrolls down/up
   * @returns {void} void;
   */
  const updateScrollPosition = useCallback(() => {
    if (typeof window === "undefined") return;

    setScrollPosition((prevState) => ({
      ...prevState,
      x: window.scrollX,
      y: window.scrollY,
    }));
  }, []);

  /**
   * Update the pane size when user resizes the window
   * @returns {void} void
   */
  const updatePaneSize = useCallback(() => {
    if (typeof window === "undefined") return;

    setWindowPaneSize((prevState) => ({
      ...prevState,
      height: window.screen?.height || window.innerHeight,
      width: window.screen?.width || window.innerWidth,
    }));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.addEventListener("scroll", updateScrollPosition);
    window.addEventListener("resize", updatePaneSize);

    updatePaneSize();

    // eslint-disable-next-line consistent-return
    return () => {
      window.removeEventListener("scroll", updateScrollPosition);
      window.removeEventListener("resize", updatePaneSize);

      updatePaneSize();
    };
  }, [updatePaneSize, updateScrollPosition]);

  return {
    scrollPosition,
    paneSize: windowPaneSize,
  };
};

export default useWindow;
