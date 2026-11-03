// Eleventy turns the files in src/ into the finished website in _site/.
export default function (eleventyConfig) {
  // Copy these folders/files to the site as-is
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");
  eleventyConfig.addPassthroughCopy("src/robots.txt");

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
  };
}
