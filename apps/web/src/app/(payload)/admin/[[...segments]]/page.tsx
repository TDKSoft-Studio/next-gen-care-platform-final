import type { Metadata } from "next";

import config from "@payload-config";
import { generatePageMetadata, RootPage } from "@payloadcms/next/views";

import { importMap } from "../importMap";

interface AdminPageProps {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<Record<string, string | string[]>>;
}

export const dynamic = "force-dynamic";

export const generateMetadata = ({ params, searchParams }: AdminPageProps): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams });

export default function AdminPage({ params, searchParams }: AdminPageProps) {
  return RootPage({ config, params, searchParams, importMap });
}
