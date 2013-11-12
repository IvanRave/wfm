module.exports = function (grunt) {
    'use strict';

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('assemble');

    // By default = devSite
    var isProd = grunt.option('prod') ? true : false,
        // Request url
        requrl = grunt.option('requrl') || 'http://wfm-client.azurewebsites.net',
        // Build language: en, ru, es etc.
        lang = grunt.option('lang') || 'en';

    var trgt = isProd ? 'dst' : 'dev';
        
    // Project configuration
    grunt.config.init({
        // Metadata
        pkg: grunt.file.readJSON('package.json'),
        src: 'src',
        // Use for <% template in JSON keys
        trgt: trgt,
        lang: lang,
        bowerFolder: 'bower_components',
        // Banner for scripts comments: author, licence etc.
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
          '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
          '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
          ' Licensed <%= pkg.license %> */\n',
        uniqueString: '<%= pkg.version %>',
        connect: {
            main: {
                options: {
                    open: true, // Or need url string
                    keepalive: true,
                    port: 43212,
                    base: '<%= trgt %>'
                }
            }
        },
        jshint: {
            gruntfile: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: 'Gruntfile.js'
            },
            app: {
                options: {
                    jshintrc: '<%= src %>/js/.jshintrc'
                },
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= src %>/js/',
                    src: ['app/**/*.js', 'rqr-*.js']
                }]
            }
        },
        clean: {
            main: ['<%= trgt %>']
        },
        copy: {
            main: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= src %>/',
                    dest: '<%= trgt %>/',
                    // Copy all files besides templates and app scripts (which assembled separately)
                    src: ['**/*', '!tpl/**/*', '!js/app/**/*', '!js/rqr-*.js']
                }]
            },
            bower_js: {
                files: [{
                    expand: true,
                    dot: true,
                    flatten: true,
                    cwd: '<%= bowerFolder %>/',
                    dest: '<%= trgt %>/js/',
                    src: ['jquery/jquery.js', 'moment/moment.js', 'angular/angular.js', 
                        'bootstrap/dist/js/bootstrap.js', 'requirejs/require.js']
                }]
            },
            bower_css: {
                files: [{
                    expand: true,
                    dot: true,
                    flatten: true,
                    cwd: '<%= bowerFolder %>/',
                    dest: '<%= trgt %>/css/',
                    src: ['bootstrap/dist/css/bootstrap.css', 'bootstrap/dist/css/bootstrap-theme.css']
                }]
            },
            bower_fonts: {
                files: [{
                    expand: true,
                    dot: true,
                        flatten: true,
                    cwd: '<%= bowerFolder %>/',
                    dest: '<%= trgt %>/fonts/',
                    src: ['bootstrap/dist/fonts/*']
                }]
            }
        },
        assemble: {
            options: {
                engine: 'handlebars',
                // Main properties
                // TODO: Change "en" to <%= lang %> parameters - it doesn't work yet for second time of using
                data: ['<%= src %>/tpl/data/syst.json', '<%= src %>/tpl/data/lang/en/lang.json', 'package.json'],
                // Build configuration properties
                conf: {
                    // Request url (begin of the path)
                    // if exists - other domain (CORS requests - for local testing and side programs)
                    // if empty - the same domain (simple requests)
                    // Example {{requrl}}/api/values
                    requrl: requrl,
                    isProd: isProd,
                    defPage: 'index.html'
                }
            },
            html: {
                options: {
                    layout: '<%= src %>/tpl/layouts/default.hbs',
                    partials: ['<%= src %>/tpl/partials/*.hbs']
                },
                files: [{
                    expand: true,
                    cwd: '<%= src %>/tpl/pages/',
                    src: '**/*.hbs',
                    dest: '<%= trgt %>'
                }]
            },
            readme: {
                options: {
                    ext: '.md'
                },
                files: {
                    './README': 'README.md.hbs'
                }
            },
            // Assemble js files after copy in dest directory
            js: {
                options: {
                    ext: '.js'
                },
                files: [{
                    expand: true,
                    cwd: '<%= src %>/js/',
                    src: ['app/**/*.js', 'rqr-*.js'],
                    dest: '<%= trgt %>/js/'
                }]
            }
        },
        requirejs: {
            workspace: {
                options: {
                    baseUrl: '<%= trgt %>/js/',
                    name: 'app/workspace/project',
                    out: '<%= trgt %>/js/app/workspace/project-bundle-<%= pkg.version %>.min.js',
                    mainConfigFile: '<%= trgt %>/js/require-config.js',
                    optimize: 'uglify2',
                    // http://requirejs.org/docs/optimization.html#sourcemaps
                    generateSourceMaps: true,
                    preserveLicenseComments: false,
                    ////useSourceUrl: true,
                    //  wrap: true, // wrap in closure
                    // jQuery automatically excluded if it's loaded from CDN
                    exclude: ['jquery']
                }
            }
        },
        // For development: run tasks when change files
        watch: {
            jshint_gruntfile: {
                files: ['<%= jshint.gruntfile.src %>'],
                tasks: ['jshint:gruntfile']
            },
            jshint_app: {
                options: {
                    spawn: false
                },
                files: ['<%= src %>/js/app/**/*.js', '<%= src %>/js/rqr-*.js'],
                tasks: ['jshint:app']
            },
            copy_main: {
                options: {
                    cwd: '<%= src %>/',
                    spawn: false
                },
                files: ['**/*', '!tpl/**/*', '!js/app/**/*', '!js/rqr-*.js'],
                tasks: ['copy:main']
            },
            // Update all template pages when change template data
            assemble_data: {
                files: ['<%= src %>/tpl/data/syst.json', '<%= src %>/tpl/data/lang/en/lang.json', 'package.json'],
                tasks: ['assemble:html', 'assemble:js']
            },
            assebmle_readme: {
                files: ['README.md.hbs', 'package.json'],
                tasks: ['assemble:readme']
            },
            assemble_html: {
                files: ['<%= src %>/tpl/**/*.hbs'],
                tasks: ['assemble:html']
            },
            assemble_js: {
                options: {
                    spawn: false
                },
                files: ['<%= src %>/js/app/**/*.js', '<%= src %>/js/rqr-*.js'],
                tasks: ['assemble:js']
            }

            // livereload server: http://127.0.0.1:35729/livereload.js
            ////livereload: {
            ////    options: { livereload: true },
            ////    files: ['<%= trgt %>/**/*']
            ////}
        }
    });

    // Default task

    var tasks = [
      // 1. Check and test
     'jshint:gruntfile',
     'jshint:app',

      // 2. Clean
     'clean:main',
     
      // 3. Copy plain and assembled files
     'copy:main', // Copy main files
     'copy:bower_js',
     'copy:bower_css',
     'copy:bower_fonts',
     'assemble:js', // After copy all files to destination - replace all {{value}} - rewrite the same files
     'assemble:html', // Copy other files: Assemble and copy templates files
     'assemble:readme' // Use main data to build readme for project description
    ];

    // 4. Bundle and minify for production
    if (isProd) {
        // Bundle with r.js app/workspace/project.js
        tasks.push('requirejs:workspace');
    }

    grunt.registerTask('default', tasks);

    // Change file src in dynamic file view
    // <param>fileArrPath: path to files object: http://gruntjs.com/api/grunt.config
    // <param>filepath: watched file (currently changed)
    function changeFileSrc(fileArrPath, filepath) {
        var changedFileArr = grunt.config.get(fileArrPath).map(function (file) {
            file.src = filepath.replace(file.cwd.replace(/\//g, '\\'), '');
            return file;
        });

        grunt.config.set(fileArrPath, changedFileArr);
    }

    grunt.event.on('watch', function (action, filepath, targetEvent) {
        // Copy only changed file
        if (targetEvent === 'copy_main') {
            changeFileSrc(['copy', 'main', 'files'], filepath);
        }
        else if (targetEvent === 'assemble_js') {
            changeFileSrc(['assemble', 'js', 'files'], filepath);
        }
        else if (targetEvent === 'jshint_app'){
            changeFileSrc(['jshint', 'app', 'files'], filepath);
        }
        ////grunt.log.writeln(targetEvent + ': ' + filepath + ' has ' + action);
    });
};