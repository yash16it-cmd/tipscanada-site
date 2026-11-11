// Eleventy turns the files in src/ into the finished website in _site/.
export default function (eleventyConfig) {
  // Copy these straight through, untouched
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/styles.css");
  eleventyConfig.addPassthroughCopy("src/script.js");
  eleventyConfig.addPassthroughCopy("src/pathfinder.js");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");
  eleventyConfig.addPassthroughCopy("src/robots.txt");

  // Netlify sets URL to the site address, so share images and the canonical link point at the right host.
  eleventyConfig.addGlobalData("siteUrl", (process.env.URL || "https://www.tipscanada.ca").replace(/\/$/, ""));
  // Search engines stay out until INDEXABLE=true is set at launch.
  eleventyConfig.addGlobalData("indexable", process.env.INDEXABLE === "true");

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
  };
}
