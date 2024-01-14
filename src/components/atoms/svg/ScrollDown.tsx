"use client";

import { type SVGMotionProps, motion } from "framer-motion";

interface AnimatedSVGProps extends SVGMotionProps<SVGSVGElement> {}

export default function ScrollDownSVG({
  fill = "none",
  height = "286",
  width = "55",
  ...props
}: AnimatedSVGProps) {
  return (
    <motion.svg
      fill={fill}
      height={height}
      width={width}
      viewBox="0 0 55 286"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <motion.path
        d="M47.8636 149.5L47.1649 148.785L47.1649 148.785L47.8636 149.5ZM46.3636 286L52.9851 276.54L41.4819 275.536L46.3636 286ZM25.4157 0.818449C32.5733 22.125 42.2343 55.1298 47.9566 84.8888C50.8185 99.7727 52.6872 113.805 52.7761 125.139C52.8206 130.807 52.4194 135.764 51.4914 139.8C50.5604 143.849 49.1211 146.874 47.1649 148.785L48.5623 150.215C50.9061 147.926 52.4678 144.478 53.4405 140.248C54.4161 136.005 54.8212 130.878 54.7761 125.123C54.6858 113.612 52.792 99.444 49.9206 84.5112C44.1762 54.6369 34.4872 21.5416 27.3115 0.181551L25.4157 0.818449ZM47.1649 148.785C36.8764 158.834 22.6823 156.647 12.8249 150.586C7.90131 147.558 4.22659 143.654 2.73281 140.047C1.99066 138.255 1.8106 136.599 2.20048 135.168C2.58523 133.756 3.55896 132.438 5.37413 131.36L4.35306 129.64C2.16823 130.937 0.813835 132.65 0.270851 134.642C-0.267 136.616 0.0255916 138.737 0.885004 140.812C2.59435 144.94 6.63838 149.129 11.7773 152.289C22.0449 158.603 37.3508 161.166 48.5623 150.215L47.1649 148.785ZM5.37413 131.36C8.88925 129.273 13.1252 129.931 17.7315 133.393C22.3452 136.861 27.1355 143.028 31.4745 151.458C40.1419 168.297 46.8636 193.886 46.8636 224H48.8636C48.8636 193.614 42.0853 167.703 33.2527 150.542C28.8417 141.972 23.8819 135.514 18.9332 131.794C13.977 128.069 8.83794 126.977 4.35306 129.64L5.37413 131.36ZM46.8636 224C46.8636 252.083 46.5268 268.265 46.1474 276.991L48.1455 277.078C48.5268 268.309 48.8636 252.092 48.8636 224H46.8636Z"
        fill="#000"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        transition={{ duration: 1 }}
        viewport={{ amount: 1, once: true }}
      />
    </motion.svg>
  );
}
