import config from "@payload-config";
import { NotFoundPage } from "@payloadcms/next/views";

import { importMap } from "../importMap";

interface AdminNotFoundProps {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<Record<string, string | string[]>>;
}

export default function NotFound({ params, searchParams }: AdminNotFoundProps) {
  return NotFoundPage({ config, importMap, params, searchParams });
}
