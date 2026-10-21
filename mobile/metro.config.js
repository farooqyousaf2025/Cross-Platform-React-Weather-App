const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

// shared/ holds the weather logic used by both the web app and this app.
// The repository root's node_modules is intentionally not added to the resolver:
// it contains React 18 for the web app and would collide with React 19 here.
config.watchFolders = [path.resolve(projectRoot, '..', 'shared')];

module.exports = config;
