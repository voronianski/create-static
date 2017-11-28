# create-static

> Create static html pages with ESNext, SCSS and Nunjucks.

## Install

```bash
npm i create-static --save-dev
```

## Usage

### CLI

```bash
Usage: create-static -s ./path/to/src -o ./path/to/dist

Options:
  --source, -s   path to source folder containing all promo folders
  --output, -o   path to dist folder with resulted builds
  --help, -h     print help
  --version, -v  print version
```

### Code

```js
const createClient = require('create-static');
const source = './path/to/src';
const output = './path/to/dist';

createClient.run({ source, output })
  .then(() => {
    console.log('Success!');
  })
  .catch(err => {
    console.log(err);
  });
```

### Source structure

Every folder in source folder should have following structure:

- `index.html` - required, html powered by nunjucks template engine
- `content.yml` - optional, data to render inside html
- `index.js` - optional, javascript powered by [browserify](https://github.com/browserify/browserify) and [babelify](https://github.com/babel/babelify) (uses `es2015` and `stage-0` presets)
- `indes.scss` - optional, css powered by [node-sass](https://github.com/sass/node-sass)
- `assets` - optional, folder to store all static files, it will be copied into build

```bash
.
|____dist
|____src
| |____page-1
| | |____index.html # required
| | |____index.js
| | |____index.scss
| |____page-2
| | |____assets
| | | |____icon.png
| | | |____some-webfont.woff
| | |____index.html # required
| | |____index.scss
| |____page-3
| | |____content.yml
| | |____index.html # required
| | |____index.scss
# as many folders as you want...
```

```bash
create-static -s ./src -o ./dist
# will output all ready to use files in `dist` folder
```

---

**MIT Licensed**
