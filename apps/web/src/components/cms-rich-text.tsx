import { RichText } from "@payloadcms/richtext-lexical/react";

import type { Page } from "../cms/payload-types";

export function CmsRichText({ data }: { data: Page["body"] }) {
  return <RichText className="cms-rich-text" data={data} />;
}
