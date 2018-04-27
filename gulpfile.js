/*
Author: Serge Harb
Gulpfile.js file:

Steps:

1. Install gulp globally:
npm install --global gulp
and use 'npm init' command to create package.json file

2. Type the following after navigating in your project folder:
npm install gulp gulp-util gulp-strip-json-comments gulp-sass gulp-uglify gulp-rename gulp-autoprefixer gulp-imagemin gulp-cache gulp-minify-css gulp-notify gulp-concat gulp-plumber browser-sync del --save-dev

3. To install foundation:
npm install foundation-sites --save

4. Move this file in your project folder

5. Setup your vhosts or just use static server (see 'Prepare Browser-sync for localhost' below)

6. Type 'Gulp' and start developing, enjoy!
*/

/* Needed gulp config */
const gulp = require('gulp');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const minifycss = require('gulp-minify-css');
const concat = require('gulp-concat');
const imagemin = require('gulp-imagemin');
const cache = require('gulp-cache');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const browserSync = require('browser-sync');
const strip_comments = require('gulp-strip-json-comments');
const del = require('del');
const reload = browserSync.reload;
require('dotenv').config();

const publicSrc = './public';

/* Vendor Scripts task */
gulp.task('vendor-scripts', () => {
  return gulp.src([
      /* Add your Vendor scripts here, they will be combined in this order */
      './node_modules/socket.io-client/dist/socket.io.js',
      './node_modules/vue/dist/vue.min.js',
      `${publicSrc}/libs/**/*.js`
    ])
    .pipe(concat({ path: 'vendor.js' }))
    .pipe(gulp.dest(`${publicSrc}/dist/scripts`))
    .pipe(uglify())
    .pipe(gulp.dest(`${publicSrc}/dist/scripts`))
    // .pipe(notify({ message: 'Vendor Scripts task complete' }));
});

/* AppScripts JavaScript task */
gulp.task('appscripts', () => {
  return gulp.src([
      /* Add your JS files here, they will be combined in this order */
      `${publicSrc}/src/scripts/*.js`
    ])
    .pipe(concat({ path: 'app.js' }))
    .pipe(gulp.dest(`${publicSrc}/dist/scripts`))
    .pipe(uglify())
    .pipe(gulp.dest(`${publicSrc}/dist/scripts`))
    // .pipe(notify({ message: 'Appscripts task complete' }));
});

/* Sass task */
gulp.task('sass', () => {
  setTimeout(function () {
    gulp.src([
        `${publicSrc}/libs/**/*.scss`,
        `${publicSrc}/src/scss/*.scss`,
      ])
      .pipe(sass())
      .pipe(strip_comments())
      .pipe(autoprefixer({ browsers: ['last 2 versions', 'ie >= 9', 'and_chr >= 2.3'] }))
      .pipe(concat({ path: 'main.css' }))
      .pipe(gulp.dest(`${publicSrc}/dist/styles`))
      .pipe(minifycss())
      .pipe(gulp.dest(`${publicSrc}/dist/styles`))
      // .pipe(notify({ message: 'Sass task complete' }))
      /* Reload the browser CSS after every change */
      .pipe(reload({ stream: true }));
  }, 50);
});

/* Images task */
gulp.task('images', () => {
  return gulp.src(`${publicSrc}/src/images/**/*`)
    .pipe(cache(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))
    .pipe(gulp.dest(`${publicSrc}/dist/images`));
  // .pipe(notify({ message: 'Images task complete' }));
});

/* Clean task */
gulp.task('clean', () => {
  return del([`${publicSrc}/dist/styles`, `${publicSrc}/dist/scripts`, `${publicSrc}/dist/images`]);
});

/* Reload task */
gulp.task('bs-reload', () => {
  browserSync.reload();
});

/* Prepare Browser-sync for localhost */
gulp.task('browser-sync', () => {
  browserSync.init([`${publicSrc}/dist/styles/*.css`, `${publicSrc}/dist/scripts/*.js`], {
    port: process.env.CLIENT_PORT,
    /* For a static server you would use this: */
    server: {
      baseDir: `${publicSrc}`
    },

    open: true,
    notify: false
  });
});

/* Watch scss, ts, js, php, html files, doing different things with each. */
gulp.task('default', ['clean', 'sass', 'vendor-scripts', 'appscripts', 'images', 'browser-sync'], () => {
  /* Watch scss, run the sass task on change. */
  gulp.watch([`${publicSrc}/libs/**/*.scss`, `${publicSrc}/src/scss/*.scss`], ['sass']);
  /* Watch vendor js files, run the vendor scripts task on change. */
  // gulp.watch(['assets/scripts/**/*.js'], ['vendor-scripts']);
  /* Watch appscripts js files, run the appscripts js scripts task on change. */
  gulp.watch([`${publicSrc}/src/libs/**/*.js`, `${publicSrc}/src/scripts/**/*.js`], ['appscripts']);
  /* Watch images, run the images task on change. */
  gulp.watch([`${publicSrc}/src/images/**/*`], ['images']);
  /* Watch .html and .php files, run the bs-reload task on change. */
  gulp.watch([`${publicSrc}/**/*.html`], ['bs-reload']);
});

gulp.task('production', ['clean', 'sass', 'vendor-scripts', 'appscripts', 'images'], () => {});