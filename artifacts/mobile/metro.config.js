const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Exclude pnpm's _tmp_ directories that get created during install
// and cleaned up before Metro starts watching — causes ENOENT crashes.
const originalResolver = config.resolver?.blockList;
config.resolver = {
  ...config.resolver,
  blockList: [
    ...(originalResolver
      ? Array.isArray(originalResolver)
        ? originalResolver
        : [originalResolver]
      : []),
    /_tmp_\d+\//,
    /.*_tmp_\d+.*/,
  ],
};

module.exports = config;
