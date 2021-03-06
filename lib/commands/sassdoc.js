const sassdoc = require('sassdoc');
const UI = require('console-ui');
const chalk = require('chalk');

const ui = new UI({
  inputStream: process.stdin,
  outputStream: process.stdout,
  errorStream: process.stderr,
});

module.exports = {
  name: 'sassdoc',
  description: 'Generate documentation for Sass files',
  availableOptions: [
    { name: 'source', type: String, default: './app/styles', aliases: ['src'] },
    { name: 'exclude', type: String, default: '[]', aliases: ['e'] },
    { name: 'dest', type: String, default: './sassdoc', aliases: ['dst'] },
    { name: 'package', type: String, default: './package.json', aliases: ['pkg'] },
    { name: 'theme', type: String, default: 'default', aliases: ['t'] },
    { name: 'autofill', type: String, default: '["requires", "throws", "content"]',
      aliases: ['af'] },
    { name: 'groups', type: String, default: '{"undefined": "general"}', aliases: ['g'] },
    { name: 'verbose', type: Boolean, default: false, aliases: ['v'] },
    { name: 'config', type: String, default: '.sassdocrc', aliases: ['c'] },
  ],
  works: 'insideProject',
  run(args) {
    const sassDocEnv = new sassdoc.Environment(new sassdoc.Logger);
    let options = sassDocEnv.tryParseFile(args.config);
    const cmdOptions = {
      exclude: args.exclude,
      dest: args.dest,
      package: args.package,
      theme: args.theme,
      autofill: args.autofill,
      groups: args.groups,
      verbose: args.verbose,
    };

    if (!options) {
      options = cmdOptions;
    } else {
      Object.keys(cmdOptions).forEach((option) => {
        const defaultOptionValue = this.availableOptions
          .find((element) => element.name === option).default;

        // Override options set in .sassdocrc with user defined cmd options:
        if (cmdOptions[option] !== defaultOptionValue) {
          options[option] = cmdOptions[option];
        }
      });
    }

    const possibleJsonValues = ['exclude', 'autofill', 'groups'];
    possibleJsonValues.forEach((option) => {
      if (typeof options[option] === 'string') {
        options[option] = JSON.parse(options[option]);
      }
    });

    ui.startProgress(chalk.green('Generating Sass documentation...'), chalk.green('.'));
    return sassdoc(args.source, options).then(() => {
      ui.stopProgress();
      ui.writeLine(chalk.green('Sass documentation has been generated.'));
    }, (err) => {
      ui.stopProgress();
      ui.writeError(err);
    });
  },
};
