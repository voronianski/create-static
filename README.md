# Create Page CLI

> Create small client side projects with ESNext, SCSS and Nunjucks easily.

## Install

```bash
npm i create-client-cli
```

## Usage

```bash
Usage: create-client -s ./path/to/src -o ./path/to/dist

Options:
  --source, -s   path to source folder containing all promo folders
  --output, -o   path to dist folder with resulted builds
  --help, -h     print help
  --version, -v  print version
```

### Source structure

Every folder in source should have this structure but actually the only required file is `index.html`:

```bash
.
|____dist
|____src
| |____page-1
| | |____index.html # required
| | |____index.js
| | |____index.scss
| |____page-2
| | |____index.html # required
| | |____index.scss
| |____page-3
| | |____content.yml
| | |____index.html # required
| | |____index.scss
# as many folders as you want...
```

```bash
create-client -s ./src -o ./dist
# will output all ready to use files in `dist` folder
```

---

**MIT Licensed**
