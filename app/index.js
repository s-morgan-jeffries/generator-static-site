'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');
var _ = require('lodash');
_.mixin(require('underscore.string').exports());
var pd = require(path.resolve(__dirname, '../lib/processDirectory.js'));

var AngularModuleGenerator = yeoman.generators.Base.extend({
  init: function () {
    this.pkg = require('../package.json');
//    this.moduleName = _.slugify(_.humanize(path.basename(process.cwd())));

    this.on('end', function () {
      if (!this.options['skip-install']) {
        this.installDependencies();
      }
    });
  },

  askFor: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay('Welcome to the marvelous AngularModule generator!'));
    var moduleName = _.slugify(_.humanize(path.basename(process.cwd())));

    var prompts = [
//      {
//        type: 'confirm',
//        name: 'someOption',
//        message: 'Would you like to enable this option?',
//        default: true
//      }
      {
        type: 'input',
        name: 'moduleName',
        message: 'What is the name of your module?',
        default: moduleName
      }
      ,
      {
        type: 'input',
        name: 'gitHubUsername',
        message: 'What is your GitHub username (used to set the repository in package.json)?',
        default: ''
      }
    ];

    this.prompt(prompts, function (props) {
      this.moduleName = props.moduleName;
      this.gitHubUsername = props.gitHubUsername;
      done();
    }.bind(this));
  },

  app: function () {
    var generatorRootDir = path.resolve(__dirname, '..');
    var templateDir = path.join(generatorRootDir, '/template');
    var yoTemplateDir = path.join(generatorRootDir, 'app/template');
    var self = this;
    var processDirectory = pd.processDirFactory({
      topLevelDir: templateDir,
      yoTemplateDir: yoTemplateDir,
      copyFx: self.copy.bind(self),
      templateFx: self.template.bind(self),
      mkdirFx: self.mkdir.bind(self)
    });
    processDirectory(templateDir);
  },

  projectfiles: function () {
  }
});

module.exports = AngularModuleGenerator;
