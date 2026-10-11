import { useEffect } from "react";

/**
 * @file useSEO.js
 * @description Modern React hook for route-level Search Engine Optimization.
 * Dynamically updates document.title and Open Graph description tags
 * as participants and search crawlers navigate between routes.
 *
 * @param {Object} options - SEO metadata options
 * @param {string} options.title - Specific page title
 * @param {string} [options.description] - Custom page meta description
 */
export function useSEO({ title, description }) {
  useEffect(() => {
    if (title) {
      const formattedTitle = `${title} : Imprenditore 5.0 | E-Cell RGPV`;
      document.title = formattedTitle;

      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute("content", formattedTitle);
      }

      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) {
        twitterTitle.setAttribute("content", formattedTitle);
      }
    }

    if (description) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", description);
      }

      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) {
        ogDesc.setAttribute("content", description);
      }

      const twitterDesc = document.querySelector('meta[name="twitter:description"]');
      if (twitterDesc) {
        twitterDesc.setAttribute("content", description);
      }
    }
  }, [title, description]);
}

export default useSEO;
