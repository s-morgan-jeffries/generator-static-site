'use strict';

var fs = require('fs'),
  path = require('path'),
  _ = require('lodash');

_.str = require('underscore.string');

//var pd = require('./lib/processDirectory.js');

var log = console.log.bind(console);

//var rootDir = path.resolve(__dirname, '..');
//var yoTemplateDir = path.join(rootDir, 'app/templates');
var targetRootDir = process.cwd();
var templatePattern = '_%_';

var pd = module.exports = {};

var not = function(f) {
  return function() {
    return !f.apply(null, arguments);
  };
};

var isDirectory = pd.isDirectory = function(p) {
  return fs.statSync(p).isDirectory();
};

var isFile = pd.isFile = function(p) {
  return fs.statSync(p).isFile();
};


var hasTemplatePattern = function(p) {
  return _.str.startsWith(path.basename(p), templatePattern);
};

var isSrcFile = function(p) {
  return isFile(p) && !hasTemplatePattern(p);
};

var isTemplateFile = function(p) {
  return isFile(p) && hasTemplatePattern(p);
};

var stripTemplatePattern = function(p) {
  var d = path.dirname(p);
  var f = path.basename(p);
  f = hasTemplatePattern(p) ? f.substr(templatePattern.length) : f;
  return path.join(d, f);
};

// Predicate to check for existence of target
var dirExists = pd.dirExists = function(p) {
//  log(p + ' exists: ' + fs.existsSync(p));
  return fs.existsSync(p);
};

var readDirectory = pd.readDirectory = function(p) {
  return _.map(fs.readdirSync(p), function(f) {
    return path.join(p, f);
  });
};

//var readDir = pd.readDir = function(p) {
//  return _.map(fs.readdirSync(p), function(f) {
//    return {
//      path: path.join(p, f),
//      stats: fs.statSync(p)
//    };
//  });
//};

var processDirFactory = pd.processDirFactory = function(config) {

  var topLevelDir = config.topLevelDir;
  var yoTemplateDir = config.yoTemplateDir;

  var relativeToTopLevel = function(p) {
    return path.relative(topLevelDir, p);
  };

  var relativeToYoTemplate = function(p) {
    return path.relative(yoTemplateDir, p);
  };

  var pathToTargetPath = function(p) {
    return path.resolve(targetRootDir, relativeToTopLevel(p));
  };

  var targetDirExists = function(p) {
    return dirExists(pathToTargetPath(p));
  };

  var copyFx = function(p) {
    config.copyFx(relativeToYoTemplate(p), relativeToTopLevel(p));
  };

  var templateFx = function(p) {
    config.templateFx(relativeToYoTemplate(p), relativeToTopLevel(stripTemplatePattern(p)));
  };

  var mkdirFx = function(p) {
    config.mkdirFx(relativeToTopLevel(p));
  };

// Start with a top-level directory
  return function processDirectory(p) {
//    // Check to see if it already exists in the target location, and create it if it does not
//    var targetDir;
    // Read the contents of the directory
    var contents = readDirectory(p);
    // Map a copy function over all the files
    // Filter source files
    var srcFiles = _.filter(contents, isSrcFile);
    _.map(srcFiles, copyFx);
    // Filter template files
    var templateFiles = _.filter(contents, isTemplateFile);
    _.map(templateFiles, templateFx);
    // Filter directories
    var directories = _.filter(contents, isDirectory);
//    log(directories);
//    log(_.filter(directories, not(targetDirExists)));
//    log(_.filter(directories, targetDirExists));
//    var firstDir = directories[0];
//    log(firstDir);
//    log('\texists: ' + dirExists(firstDir));
//    log('\ttarget exists: ' + targetDirExists(firstDir));
//    log('\ttarget does not exist: ' + not(targetDirExists)(firstDir));
    // For each directory, check to see if it exists in the target location, and create it if it does not
    _.map(_.filter(directories, not(targetDirExists)), mkdirFx);
    // Recursively map this function over all the directories
    _.map(directories, processDirectory);
  };
};