// This file sets up module aliases for the build process
const path = require('path');
const moduleAlias = require('module-alias');

// Add path aliases for better imports
moduleAlias.addAliases({
  '@': path.resolve(__dirname, '..'),
  '@/lib': path.resolve(__dirname, '.'),
  '@/components': path.resolve(__dirname, '../components'),
  '@/app': path.resolve(__dirname, '../app'),
  '@/providers': path.resolve(__dirname, '../providers'),
});

module.exports = moduleAlias; 