import { content, siteUrl } from "@/content";
import { homeStructuredData, jsonLd } from "@/content/structured-data";
import { HomeSections } from "@/sections/HomeSections";

export default function Home() {
  return (
    <>
      {siteUrl && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(homeStructuredData(content.site, siteUrl)) }}
        />
      )}
      <HomeSections content={content} />
    </>
  );
}
