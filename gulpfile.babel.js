'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel');
const gutil = require('gulp-util');
const cleanCSS = require('gulp-clean-css');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const del = require('del');
const sass = require('gulp-sass');
const autoprefix = require('gulp-autoprefixer');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');
const Cache = require('gulp-file-cache');

import browserSync from 'browser-sync';

let cache = new Cache();

const DIR = {
  SRC: 'src',
  DEST: 'dist'
};

const SRC = {
  JS: DIR.SRC + '/js/*.js',
  CSS: DIR.SRC + '/css/*.css',
  SCSS: DIR.SRC + '/scss/*.scss',
  HTML: DIR.SRC + '/*.html',
  RESOURCE: DIR.SRC + '/resource/*',
  STATIC: DIR.SRC + '/static/**/*',
  WEB: 'server/web/**/*.js'
};

const DEST = {
  JS: DIR.DEST + '/js',
  CSS: DIR.DEST + '/css',
  HTML: DIR.DEST + '/',
  RESOURCE: DIR.DEST + '/resource',
  STATIC: DIR.DEST + '/static',
  WEB: 'web'
};


gulp.task('web', () => {
  return gulp.src(SRC.WEB)
    .pipe(cache.filter())
    .pipe(babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(cache.cache())
    .pipe(gulp.dest(DEST.WEB));
});


gulp.task('webpack', () => {
  return gulp.src('src/js/main.js')
    .pipe(webpackStream(webpackConfig, webpack))
    .pipe(gulp.dest(DEST.JS));
});

gulp.task('css', () => {
  return gulp.src(SRC.CSS)
    .pipe(cleanCSS({compatibility: 'ie9'}))
    .pipe(gulp.dest(DEST.CSS));
});

const sassOpt = {
   //Values : nested, expanded, compact, compressed
  outputStyle:"compressed",
  sourceComments:false
}

gulp.task('scss', () => {
  return gulp.src('src/scss/layout.scss')
    .pipe(sourcemaps.init())
    .pipe(sass(sassOpt)
    .on('error', sass.logError))
    .pipe(autoprefix('last 2 versions'))
    .pipe(rename('game.layout.css'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(DEST.CSS));
});

gulp.task('html', () => {
  return gulp.src(SRC.HTML)
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(DEST.HTML))
});

gulp.task('resource', () => {
  return gulp.src(SRC.RESOURCE)
    .pipe(imagemin())
    .pipe(gulp.dest(DEST.RESOURCE));
});

gulp.task('static', () => {
  return gulp.src(SRC.STATIC)
    .pipe(gulp.dest(DEST.STATIC));
});

gulp.task('clean', () => {
  return del([DIR.DEST]).then(paths => {
    console.log('Deleted files and folders:\n', paths.join('\n'));
  });
});


gulp.task('watch', () => {
  let watcher = {
    webpack: gulp.watch(SRC.JS, ['webpack']),
    css: gulp.watch(SRC.CSS, ['css']),
    scss: gulp.watch(SRC.SCSS, ['scss']),
    html: gulp.watch(SRC.HTML, ['html']),
    resource: gulp.watch(SRC.RESOURCE, ['resource']),
    static: gulp.watch(SRC.STATIC, ['static']),
    babel: gulp.watch(SRC.WEB, ['babel'])
  };

  let notify = (event) => {
    gutil.log('File', gutil.colors.yellow(event.path), 'was', gutil.colors.magenta(event.type));
  };

  for(let key in watcher) {
    watcher[key].on('change', notify);
  }
});

gulp.task('browser-sync', () => {
  browserSync.init(null, {
    proxy: "http://localhost:2053",
    files: ["dist/**/*.*"],
    port: 2083
  })
});


let tasks =  [ 'clean', 'webpack', 'css', 'scss', 'html', 'resource', 'static', 'browser-sync'];
gulp.task('default', gulp.series(tasks), () => {
  return gutil.log('Gulp is running');
});
