import { DefaultSeo, type DefaultSeoProps } from "next-seo";
import type { AppProps } from "next/app";

import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const defaultSEO: DefaultSeoProps = {
    title: "Official Devix Website",
    description: "Official Devix Website"
  };

  return (
    <>
      <DefaultSeo {...defaultSEO} />

      <Component {...pageProps} />
    </>
  );
}
