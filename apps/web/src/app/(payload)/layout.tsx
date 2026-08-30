import config from "@payload-config";
import "@payloadcms/next/css";
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts";
import type { ServerFunctionClient } from "payload";
import type { ReactNode } from "react";

import { importMap } from "./admin/importMap.js";
import "./payload.css";

const serverFunction: ServerFunctionClient = async (args) => {
  "use server";
  return handleServerFunctions({ ...args, config, importMap });
};

export const metadata = {
  description: "Administration des contenus publics NEXT GEN CARE",
  robots: { follow: false, index: false },
  title: "Administration — NEXT GEN CARE"
};

export default function PayloadLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  );
}
