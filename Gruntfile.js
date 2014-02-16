module.exports = function (grunt) {
    'use strict';

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('assemble');
    grunt.loadNpmTasks('grunt-bump');

    // By default = devSite
    var isProd = grunt.option('prod') ? true : false,
        // Build language: en, ru, es etc.
        lang = grunt.option('lang') || 'en',
        cmtmsg = grunt.option('cmtmsg') || 'fix(project): optimize';
        
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
            js: {
                options: {
                    jshintrc: '<%= src %>/js/.jshintrc'
                },
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= src %>/js/',
                    src: ['**/*.js']
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
                    // Copy all files besides templates and scripts (which assembled separately)
                    src: ['**/*', '!tpl/**/*', '!js/**/*']
                }]
            },
            bower_js: {
                files: [{
                    expand: true,
                    dot: true,
                    flatten: true,
                    cwd: '<%= bowerFolder %>/',
                    dest: '<%= trgt %>/js/',
                    src: ['jquery/dist/jquery.js', 'bootstrap/dist/js/bootstrap.js']
                    // 'moment/moment.js', 'angular/angular.js'
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
                    src: ['bootstrap/dist/fonts/*', 'wfm-fonts/fonts/*']
                }]
            }
        },
        assemble: {
            options: {
                engine: 'handlebars',
                // Main properties
                // TODO: Change "en" to <%= lang %> parameters - it doesn't work yet for second time of using
                data: ['<%= src %>/tpl/data/syst.json', '<%= bowerFolder %>/wfm-dict/lang/en/lang.json', 'package.json'],
                // Build configuration properties
                conf: {
                    defPage: '' //index.html - for w8 app or other mobile
                }
            },
            html: {
                options: {
                    layout: '<%= src %>/tpl/layouts/default.hbs',
                    partials: ['<%= src %>/tpl/partials/*.hbs'],
                    marked: {
                        gfm: true
                    }
                },
                files: [{
                    expand: true,
                    cwd: '<%= src %>/tpl/pages/',
                    src: '**/*.hbs',
                    dest: '<%= trgt %>'
                }]
            },
            // Assemble js files
            js: {
                options: {
                    ext: '.js'
                },
                files: [{
                    expand: true,
                    cwd: '<%= src %>/js/',
                    src: ['**/*.js'],
                    dest: '<%= trgt %>/js/'
                }]
            }
        },
        bump: {
          options: {
            files: ['package.json', 'bower.json'],
            updateConfigs: ['pkg'],
            commit: true,
            commitMessage: cmtmsg,
            commitFiles: ['-a'],
            createTag: true,
            tagName: 'v%VERSION%',
            tagMessage: 'Version %VERSION%',
            push: true,
            pushTo: 'origin'
          }
        },
        // For development: run tasks when change files
        watch: {
            jshint_gruntfile: {
                files: ['<%= jshint.gruntfile.src %>'],
                tasks: ['jshint:gruntfile']
            },
            jshint_js: {
                options: {
                    spawn: false
                },
                files: ['<%= src %>/js/**/*.js'],
                tasks: ['jshint:js']
            },
            copy_main: {
                options: {
                    cwd: '<%= src %>/',
                    spawn: false
                },
                files: ['**/*', '!tpl/**/*', '!js/**/*'],
                tasks: ['copy:main']
            },
            // Update all template pages when change template data
            assemble_data: {
                files: ['<%= src %>/tpl/data/syst.json', '<%= bowerFolder %>/wfm-dict/lang/en/lang.json', 'package.json'],
                tasks: ['assemble:html', 'assemble:js']
            },
            assemble_html: {
                files: ['<%= src %>/tpl/**/*.hbs'],
                tasks: ['assemble:html']
            },
            assemble_js: {
                options: {
                    spawn: false
                },
                files: ['<%= src %>/js/**/*.js'],
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
     'jshint:js',

      // 2. Clean
     'clean:main',
     
      // 3. Copy plain and assembled files
     'copy:main', // Copy main files
     'copy:bower_js',
     'copy:bower_css',
     'copy:bower_fonts',
     'assemble:js', // After copy all files to destination - replace all {{value}} - rewrite the same files
     'assemble:html' // Copy other files: Assemble and copy templates files
    ];

    // TODO: Bundle and minify for production

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
        else if (targetEvent === 'jshint_js'){
            changeFileSrc(['jshint', 'js', 'files'], filepath);
        }
        ////grunt.log.writeln(targetEvent + ': ' + filepath + ' has ' + action);
    });
};