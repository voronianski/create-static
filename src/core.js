const env = process.env.NODE_ENV || 'development';

const path = require('path');
const fs = require('fs-extra');
const YAML = require('yamljs');
const walkdir = require('walkdir');
const waterfall = require('async/waterfall');
const parallelLimit = require('async/parallelLimit');
const sass = require('node-sass');
const nunjucks = require('nunjucks');
const babelify = require('babelify');
const browserify = require('browserify');
const envify = require('envify/custom');

function run (opts = {}) {
  return new Promise((resolve, reject) => {
    const sourcePath = path.resolve(opts.source);

    if (!fs.existsSync(sourcePath)) {
      return reject('There is no such source folder!');
    }

    const outputPath = path.resolve(opts.output);

    if (!fs.existsSync(outputPath)) {
      return reject('There is no such output folder!');
    }

    const sourcePaths = walkdir.sync(sourcePath, {max_depth: 1});
    const dirPaths = sourcePaths.filter(p => fs.lstatSync(p).isDirectory());
    const dirTasks = dirPaths.map(p => {
      const tasks = [
        parseContent(p),
        compileCSS(p),
        compileJS(p),
        copyAssets(p),
        renderTemplate(p),
        outputHTML(p)
      ];

      return done => {
        waterfall(tasks, err => done(err));
      };
    });

    parallelLimit(dirTasks, 20, err => {
      err ? reject(err) : resolve();
    });

    // FUNCTIONS
    function parseContent (p) {
      return done => {
        const slug = path.basename(p);
        const yamlPath = path.join(p, './content.yml');

        if (!fs.existsSync(yamlPath)) {
          return done(null, { slug });
        }

        let data;

        try {
          data = YAML.load(yamlPath);
        } catch (err) {
          done(err);
        }

        done(null, Object.assign({ slug }, data));
      };
    }

    function renderTemplate (p) {
      return (store, done) => {
        nunjucks.configure(p);

        const html = nunjucks.render('index.html', store);

        done(null, Object.assign(store, { html }));
      };
    }

    function compileCSS (p) {
      return (store, done) => {
        const scssPath = path.join(p, './index.scss');

        if (!fs.existsSync(scssPath)) {
          return done(null, store);
        }

        const sassOpts = {
          file: scssPath,
          compressed: true,
          includePaths: [
            path.join(sourcePath, '../node_modules')
          ]
        };

        sass.render(sassOpts, (err, result) => {
          if (err) {
            return done(err);
          }

          const cssPath = './index.css';
          const fullCssPath = path.join(outputPath, env, store.slug, cssPath);

          fs.outputFile(fullCssPath, result.css, (err) => {
            if (err) {
              return done(err);
            }

            done(null, Object.assign(store, {
              css: cssPath,
              cssFull: fullCssPath
            }));
          });
        });
      };
    }

    function compileJS (p) {
      return (store, done) => {
        const jsNextPath = path.join(p, './index.js');

        if (!fs.existsSync(jsNextPath)) {
          return done(null, store);
        }

        const jsPath = './index.js';
        const fullJsPath = path.join(outputPath, env, store.slug, jsPath);
        const presets = ['babel-preset-es2015', 'babel-preset-stage-0'].map(require.resolve);

        browserify(jsNextPath)
          .transform(babelify, { presets })
          .transform(envify({ NODE_ENV: env }))
          .bundle((err, buf) => {
            if (err) {
              return done(err);
            }

            fs.outputFile(fullJsPath, buf.toString('utf-8'), err => {
              if (err) {
                return done(err);
              }

              done(null, Object.assign(store, {
                js: jsPath,
                jsFull: fullJsPath
              }));
            });
          });
      };
    }

    function outputHTML () {
      return (store, done) => {
        const htmlFilePath = path.join(outputPath, env, store.slug, './index.html');

        fs.outputFile(htmlFilePath, store.html, done);
      };
    }

    function copyAssets (p) {
      return (store, done) => {
        const assetsFromPath = path.join(p, './assets');

        if (!fs.existsSync(assetsFromPath)) {
          return done(null, store);
        }

        const assetsToPath = path.join(outputPath, env, store.slug, './assets');

        fs.copy(assetsFromPath, assetsToPath, err => {
          if (err) {
            return done(err);
          }

          done(null, Object.assign(store, {
            assets: assetsToPath
          }));
        });
      };
    }
  });
}

module.exports = { run };
