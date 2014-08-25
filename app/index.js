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
    var siteName = _.slugify(_.humanize(path.basename(process.cwd())));

    // See https://github.com/SBoudrias/Inquirer.js for available options
    var prompts = [
      {
        type: 'input',
        name: 'siteName',
        message: 'What is the name of your site?',
        default: siteName
      }
      ,
      {
        type: 'list',
        name: 'cssPreprocessor',
        message: 'What CSS preprocessor would you like to use?',
        choices: ['Stylus', 'Sass'],
        default: 0
      }
      ,
//      {
//        when: function (answers) {
//          return answers.cssPreprocessor === 'Sass';
//        },
//        type: 'confirm',
//        name: 'useCompass',
//        message: 'Do you want to use Compass?',
//        default: false
//      }
//      ,
//      {
//        when: function (answers) {
//          return answers.cssPreprocessor === 'Sass';
//        },
//        type: 'confirm',
//        name: 'useInuit',
//        message: 'Do you want to use Inuit.css?',
//        default: false
//      }
//      ,
//      {
//        type: 'confirm',
//        name: 'useBootstrap',
//        message: 'Do you want to use Bootstrap?',
//        default: false
//      }
//      ,
      {
        when: function (answers) {
          return answers.cssPreprocessor === 'Sass';
        },
        type: 'input',
        name: 'rubyGemSet',
        message: 'What ruby gemset do you want to use for Sass?',
        default: siteName
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
      this.siteName = props.siteName;
      this.useStylus = props.cssPreprocessor === 'Stylus';
      this.useSass = props.cssPreprocessor === 'Sass';
      this.useCompass = !!props.useCompass;
      this.rubyGemSet = props.rubyGemSet;
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
