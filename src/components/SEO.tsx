import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useMemo } from "react";

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  jsonLd?: Record<string, any>;
}

export const SEO = ({ title, description, image, jsonLd }: SEOProps) => {
  const location = useLocation();

  const canonical = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    return `${window.location.origin}${location.pathname}`;
  }, [location.pathname]);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={canonical} />}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content="summary_large_image" />
      {image && <meta name="twitter:image" content={image} />}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};
