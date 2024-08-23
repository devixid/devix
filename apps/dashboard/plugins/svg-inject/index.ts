/// <reference types="ts-node" />

/**
 * Vite plugin to inject SVGs into JSX components.
 *
 * this plugin is modified from https://github.com/neki-dev/vite-plugin-svg-inject
 * @copyright neki-dev (https://github.com/neki-dev)
 * @license MIT
 *
 * modified by: @andrianfaa (https://github.com/andrianfaa)
 */

import { promises as fs } from "fs";
import path from "path";
import type { Plugin } from "vite";

const isValidSVGPath = (filePath: string) => /\.svg(\.tsx)?$/.test(filePath);

export default (): Plugin => ({
  enforce: "pre",
  name: "svg-injection",
  resolveId: (filePath, importer) => {
    if (!isValidSVGPath(filePath)) return null;

    const svgPath = filePath.replace(/\.svg$/, ".svg.tsx");

    return path.join(path.dirname(importer || ""), svgPath);
  },
  load: async (filePath) => {
    if (!isValidSVGPath(filePath)) return null;

    const svgPath = filePath.replace(/\.svg\.tsx$/, ".svg");
    const svgBuffer = await fs.readFile(svgPath);
    const svg = String(svgBuffer).replace(/^(<svg.*?)>/i, "$1 {...props}>");

    return `
        import React from "react";

        export default (props?: React.SVGProps<SVGSVGElement>) => ${svg};
      `;
  },
});
