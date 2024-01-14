/// <reference types="react" />

declare module "*.svg" {
  import React = require("react");

  export const ReactComponent: React.PureComponent<
    React.SVGProps<SVGSVGElement>
  >;

  const src: string;
  export default src;
}
