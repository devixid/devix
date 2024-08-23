declare namespace JSX {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  import React = require("react");

  interface IntrinsicAttributes extends React.JSX.IntrinsicAttributes {
    className?: string;
  }
}
