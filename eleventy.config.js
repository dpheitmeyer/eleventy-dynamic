const { EleventyEdgePlugin } = require("@11ty/eleventy");

module.exports = function(eleventyConfig) {
	eleventyConfig.addPlugin(EleventyEdgePlugin);
	eleventyConfig.addPassthroughCopy("src/assets/**");

	return {
    	dir: {
        	input: "src",
        	output: "dist"
    	}
	};
};
