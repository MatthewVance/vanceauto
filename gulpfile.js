// Load plugins via gulp-load-plugins
var gulp = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    plugins = gulpLoadPlugins(),
    // Load postcss plugins seperately
    cssmqpacker = require('css-mqpacker'),
    postcssSorting = require('postcss-sorting'),
    autoprefixer = require('autoprefixer'),
    cssnano = require('cssnano'),
    runSequence = require('run-sequence'),
    // Load non gulp modules
    del = require('del'),
    uglifySaveLicense = require('uglify-save-license'),
    stylish = require('jshint-stylish'),
    mainBowerFiles = require('main-bower-files'),
    path = require('path'),
    // Use fs to keep JSON from being cached (for nunjucks)
    //https://stackoverflow.com/questions/26315911/providing-data-models-to-use-in-gulp-nunjucks-templates
    //https://stackoverflow.com/questions/35456748/gulp-nunjucks-html-gulp-data-not-compiling-on-watch/35623576#35623576
    //
    fs = require('fs');

// Copy non-njk files to public folder
gulp.task('copy-html', function() {
  return gulp.src(['./src/pages/**/*.{html,xml,txt,!njk}'])
    .pipe(gulp.dest('./dist/'));
});

// Nunjucks
//To make the file accessible to all templates/pages/partials/macros/etc. I'm using gulp-nunjucks-render's manageEnv setting as follows:
gulp.task('build-html', ['copy-html'], function() {
  return gulp.src('./src/pages/**/*.njk')
    // Adding data to Nunjucks
    .pipe(plugins.data(function() {
      return require('./src/templates/models/vehicles.json')
    }))
    .pipe(plugins.nunjucksRender({
      ext: '.html',
      path: ['./src/templates/'],
      watch:false,
      manageEnv:function(env){
          var data = JSON.parse(fs.readFileSync('./src/templates/models/vehicles.json'));
          env.addGlobal('data',data);
      }
    }))
    .pipe(gulp.dest('./dist/'));
});

// Lint JS
gulp.task('lint-js', function() {
  return gulp.src('./src/js/**/*.js')
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter(stylish));
});

// Format CSS
gulp.task('format-css', function () {
  return gulp.src('./src/styles/**/*.css')
    .pipe(plugins.stylefmt())
    .pipe(gulp.dest('./src/styles/'));
});

// Lint CSS
gulp.task('lint-css', ['format-css'], function lintCssTask() {
  return gulp.src('./src/**/*.css')
    .pipe(plugins.stylelint({
      failAfterError: true,
      //reportOutputDir: './src/reports/lint',
      reporters: [
        {formatter: 'verbose', console: true},
      ],
      debug: false
    }));
});

// Prepare CSS
gulp.task('styles', ['build-html'], function() {
  var processors = [
    postcssSorting(),
    cssmqpacker(),
    autoprefixer({browsers: ['last 2 versions']}),
    cssnano(),
  ];
  return gulp.src(['./src/styles/global.css', './src/styles/**/*.css'])
    .pipe(plugins.concat('main.css'))
    .pipe(plugins.postcss(processors))
    .pipe(plugins.rename({suffix: '.min'}))
    .pipe(gulp.dest('./tmp'));
});

// Combine external CSS to prepare it for removing unused styles
gulp.task('concat-css', ['styles'], function() {
  return gulp.src(['./bower_components/bootswatch/paper/bootstrap.min.css','./tmp/main.min.css'])
    .pipe(plugins.concat('combined.css'))
    .pipe(plugins.rename({suffix: '.min'}))
    .pipe(gulp.dest('./tmp'));
  });

  // Remove unused CSS
  // Optimize fonts in bootswatch Paper
  gulp.task('uncss', ['concat-css'], function () {
    return gulp.src('./tmp/combined.min.css')
      .pipe(plugins.replace('@import url("https://fonts.googleapis.com/css?family=Roboto:300,400,500,700");', ''))
      .pipe(plugins.replace('../fonts/glyphicons-halflings-regular', 'https://cdnjs.cloudflare.com/ajax/libs/bootswatch/3.3.7/fonts/glyphicons-halflings-regular'))
      .pipe(plugins.uncss({
        html: ['./dist/**/*.html'],
        ignore: [
          /\w\.in/,
          ".fade",
          ".collapse",
          ".collapsing",
          /(#|\.)navbar(\-[a-zA-Z]+)?/,
          /(#|\.)(open)/,
          ".in",
        ]
      }))
      .pipe(gulp.dest('./tmp'));
  });

// Cache-bust CSS and create manifest of renamed CSS files
// Note any vendor used CSS is not cache-busted by this
gulp.task('rev-css', ['uncss'], function () {
  return gulp.src('./tmp/combined.min.css')
    .pipe(plugins.rev())
    .pipe(gulp.dest('./dist/css/'))
    .pipe(plugins.rev.manifest() )
    .pipe(gulp.dest( './manifests/css' ) );
});

// JS
gulp.task('js-compress', function () {
  return gulp.src('./src/js/**/*.js')
    .pipe(plugins.uglify({
      preserveComments: 'license'
    }))
    .pipe(plugins.rename({suffix: '.min'}))
    .pipe(gulp.dest('./tmp'));
});

// Cache-bust JS and create manifest of renamed JS files
// Note any vendor used JS is not cache-busted by this
gulp.task('rev-js', ['js-compress'], function () {
  return gulp.src('./tmp/**/*.js')
    .pipe(plugins.rev())
    .pipe(gulp.dest('./dist/js/'))
    .pipe(plugins.rev.manifest() )
    .pipe(gulp.dest( './manifests/js' ) );
});

// Update html files with renamed files
gulp.task('replace', ['rev-js','rev-css'], function() {
  return gulp.src(['./manifests/**/*.json','./dist/**/*.html'])
  .pipe(plugins.revCollector())
  .pipe(gulp.dest('./dist/'));
});

// Resize Home
gulp.task('resize-home', function () {
  return gulp.src('./src/images/h/**/*.jpg')
      .pipe(plugins.responsive({
      // Resize all JPG images to three different sizes: 200, 500, and 630 pixels
      '**/*.jpg': [{
        width: 2400,
        rename: { suffix: '-2400' },
      }, {
      }, {
        width: 2354,
        rename: { suffix: '-2354' },
      }, {
        width: 2240,
        rename: { suffix: '-2240' },
      }, {
        width: 2049,
        rename: { suffix: '-2049' },
      }, {
      }, {
        width: 1856,
        rename: { suffix: '-1856' },
      }, {
      }, {
        width: 1415,
        rename: { suffix: '-1415' },
      }, {
      }, {
        width: 1200,
        rename: { suffix: '-1200' },
      }, {
      }, {
        width: 1163,
        rename: { suffix: '-1163' },
      }, {
      }, {
        width: 815,
        rename: { suffix: '-815' },
      }, {
      }, {
        width: 686,
        rename: { suffix: '-686' },
      }, {
      }, {
        width: 300,
        rename: { suffix: '-300' },
      }, {
        // Compress, strip metadata, and rename original image
        rename: { suffix: '' },
      }],
    }, {
      // Global configuration for all images
      // The output quality for JPEG, WebP and TIFF output formats
      quality: 65,
      // Use progressive (interlace) scan for JPEG and PNG output
      progressive: true,
      // Strip all metadata
      withMetadata: false,
      // Do not enlarge the output image
      withoutEnlargement: true
    }))
    .pipe(gulp.dest('./dist/images/'))
    .pipe(plugins.webp({
      method: 6
    }))
    .pipe(gulp.dest('./dist/images/'));
});

// Resize
gulp.task('resize', function () {
  return gulp.src('./src/images/i/**/*.jpg')
      .pipe(plugins.responsive({
      // Resize all JPG images to three different sizes: 200, 500, and 630 pixels
      '**/*.jpg': [{
        width: 1920,
        rename: { suffix: '-1920' },
      }, {
        width: 1727,
        rename: { suffix: '-1727' },
      }, {
        width: 1397,
        rename: { suffix: '-1397' },
      }, {
      }, {
        width: 960,
        rename: { suffix: '-960' },
      }, {
      }, {
        width: 320,
        rename: { suffix: '-320' },
      }, {
        // Compress, strip metadata, and rename original image
        rename: { suffix: '' },
      }],
    }, {
      // Global configuration for all images
      // The output quality for JPEG, WebP and TIFF output formats
      quality: 65,
      // Use progressive (interlace) scan for JPEG and PNG output
      progressive: true,
      // Strip all metadata
      withMetadata: false,
      // Do not enlarge the output image
      withoutEnlargement: true
    }))
    .pipe(gulp.dest('./dist/images/'))
    .pipe(plugins.webp({
      method: 6
    }))
    .pipe(gulp.dest('./dist/images/'));
});

// Copy basic images files
gulp.task('copy-images', function() {
  return gulp.src(['./src/images/*.{png,ico,jpg}'])
    .pipe(gulp.dest('./dist/images'));
});

// Sitemap
gulp.task('sitemap', function () {
  return gulp.src(['./dist/**/*.html','!./dist/exceptions/*','!./dist/google*.html'], {
    read: false
  })
    .pipe(plugins.sitemap({
      siteUrl: 'https://vanceauto.com',
      getLoc(siteUrl, loc, entry) {
        return loc.replace(/\.\w+$/, ''); // Removes the file extension
      }
  }))
    .pipe(gulp.dest('./dist/'));
});

// HTML
gulp.task('compress-html', function () {
  return gulp.src(['./dist/**/*.html','!./dist/vendor/'])
    .pipe(plugins.htmlmin({
      collapseWhitespace: true,
      conservativeCollapse: true,
      preserveLineBreaks: true,
      removeRedundantAttributes: true,
      removeComments: true,
      removeEmptyAttributes: true,
      sortAttributes: true,
      sortClassName: true
    }))
    .pipe(gulp.dest('./dist/'))
});

// Compress
gulp.task('compress', ['compress-html'],  function () {
    return gulp.src(['./dist/**/*.{css,js,html,txt,xml}'])
        .pipe(plugins.zopfli({
          append: false //don't append .gz since this is for CloudFront
        }))
        .pipe(gulp.dest('./dist/'));
});

// Bower
gulp.task('bower', function() {
  const jsFilter = plugins.filter('**/*.js', {restore: true});
  const cssFilter = plugins.filter('**/*.css', {restore: true});

    return gulp.src(mainBowerFiles(/* options */), { base: './bower_components' })
      .pipe(jsFilter)
      .pipe(plugins.zopfli({
        append: false //don't append .gz since this is for CloudFront
      }))
      .pipe(gulp.dest('./dist/vendor/'))
      .pipe(jsFilter.restore)
      .pipe(cssFilter)
      .pipe(plugins.zopfli({
        append: false //don't append .gz since this is for CloudFront
      }))
      .pipe(gulp.dest('./dist/vendor/'))
});

//Remove html extension
gulp.task('clean-urls', function () {
    return gulp.src(['./dist/**/*.html','!./dist/google*.html','!./dist/vendor/'])
      .pipe(plugins.rename(function (path) {
        path.extname = "";
        return path;
      }))
      .pipe(gulp.dest('./dist/'));
});

// Remove files with html extension
gulp.task('rm-html', ['clean-urls'], function() {
  return del(['./dist/**/*.html','!./dist/google*.html','!./dist/vendor/']);
});

// Clean tmp only
gulp.task('clean-tmp', function() {
  return del('./tmp/');
});

// Clean all
gulp.task('build-clean', function() {
  return del(['./dist/*']);
});

gulp.task('build-dev', function(callback) {
  runSequence('build-clean',
              'format-css',
              'replace',
              'sitemap',
              ['clean-tmp','bower','rm-html'],
              callback);
});

gulp.task('build', function(callback) {
  runSequence('build-clean',
              'format-css',
              'replace',
              ['resize', 'resize-home','copy-images'],
              'sitemap',
              'compress',
              ['clean-tmp','bower','rm-html'],
              callback);
});
