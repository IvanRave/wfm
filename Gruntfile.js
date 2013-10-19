module.exports = function (grunt) {
    'use strict';

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('assemble');
    grunt.loadNpmTasks('grunt-requirejs');

    // dst folder
    var trg = grunt.option('trg') || 'dst',
        requrl = grunt.option('requrl') || 'http://wfm.azurewebsites.net';
    // Project configuration
    grunt.config.init({
        // Metadata
        pkg: grunt.file.readJSON('package.json'),
        target: trg, // Use for <% template in JSON keys
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
          '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
          '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
          ' Licensed <%= pkg.license %> */\n',
        uniqueString: '<%= pkg.version %>',
        folder: {
            src: 'src' // Source
        },
        connect: {
            main: {
                options: {
                    open: true, // Or need url string
                    keepalive: true,
                    port: 12345,
                    base: '<%= target %>'
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
                    jshintrc: '<%= folder.src %>/scripts/app/.jshintrc'
                },
                // all js files in js folder
                src: ['<%= folder.src %>/scripts/app/**/*.js']
            }
        },
        clean: {
            main: ['<%= target %>']
        },
        copy: {
            main: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= folder.src %>/',
                    dest: '<%= target %>/',
                    // Copy all files besides templates
                    src: ['**/*', '!tpl/**/*', '!scripts/app/**/*']
                }]
            }
        },
        assemble: {
            options: {
                engine: 'handlebars',
                // Main properties
                data: ['assemble_store/data/*.json', 'package.json'],
                // Build configuration properties
                conf: {
                    // Request url (begin of the path)
                    // if exists - other domain (CORS requests - for local testing and side programs)
                    // if empty - the same domain (simple requests)
                    // Example {{requrl}}/api/values
                    requrl: requrl
                }
            },
            html: {
                options: {
                    layout: '<%= folder.src %>/tpl/layouts/default.hbs',
                    partials: ['<%= folder.src %>/tpl/partials/*.hbs']
                },
                files: [{
                    expand: true,
                    cwd: '<%= folder.src %>/tpl/pages/',
                    src: '**/*.hbs',
                    dest: '<%= target %>'
                }]
            },
            readme: {
                options: {
                    ext: '.md'
                },
                files: {
                    './README': 'assemble_store/tpl/README.md.hbs'
                }
            },
            // Assemble js files after copy in dest directory
            js: {
                options: {
                    ext: '.js'
                },
                files: [{
                    expand: true,
                    cwd: '<%= folder.src %>/scripts/app/',
                    src: '**/*.js',
                    dest: '<%= target %>/scripts/app/'
                }]
            }
        },
        requirejs: {
            workspace: {
                options: {
                    baseUrl: '<%= target %>/scripts/',
                    name: 'app/workspace/project',
                    out: '<%= target %>/scripts/app/workspace/project-bundle-<%= pkg.version %>.min.js',
                    mainConfigFile: '<%= target %>/scripts/require-config.js',
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
        watch: {
            jshint_gruntfile: {
                files: ['<%= jshint.gruntfile.src %>'],
                tasks: ['jshint:gruntfile']
            },
            copy_main: {
                options: {
                    cwd: '<%= folder.src %>/',
                    spawn: false
                },
                files: ['!tpl/', '!scripts/app/', '**/*'],
                tasks: ['copy:main']
            },
            assemble_html: {
                files: ['assemble_store/**/*', 'package.json', '<%= folder.src %>/tpl/**/*.hbs'],
                tasks: ['assemble:html']
            },
            assemble_readme: {
                files: ['assemble_store/**/*', 'package.json'],
                tasks: ['assemble:readme']
            },
            assemble_js: {
                options: {
                    spawn: false
                },
                files: ['assemble_store/**/*', 'package.json', '<%= folder.src %>/scripts/app/**/*.js'],
                tasks: ['assemble:js']
            }


            // livereload server: http://127.0.0.1:35729/livereload.js
            ////livereload: {
            ////    options: { livereload: true },
            ////    files: ['<%= target %>/**/*']
            ////}
        }
    });

    // Default task
    grunt.registerTask('default',
    [
      // 1. Check and test
     'jshint:gruntfile',
      ////'jshint: app', // TODO: fix jshint errors

      // 2. Clean
     'clean:main',

      // 3. Copy plain and assembled files
     'copy:main', // Copy main files
     'assemble:html', // Copy other files: Assemble and copy templates files
     'assemble:readme', // Use main data to build readme for project description
     'assemble:js', // After copy all files to destination - replace all {{value}} - rewrite the same files

      // 4. Bundle and minify
     'requirejs:workspace', // Bundle with r.js app/workspace/project.js
    ]);

    ////grunt.event.on('watch', function (action, filepath, target) {
    ////    grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
    ////});


    // Change file src in dynamic file view
    // <param>fileArrPath: path to files object: http://gruntjs.com/api/grunt.config
    // <param>filepath: watched file (currently changed)
    function changeFileSrc(fileArrPath, filepath) {
        var changedFileArr = grunt.config.get(fileArrPath).map(function (file) {
            file.src = filepath.replace(file.cwd.replace(/\//g, '\\'), '');
            grunt.log.writeln('SRSRSRSRS: ' + file.src);
            return file;
        });

        grunt.config.set(fileArrPath, changedFileArr);
    }

    grunt.event.on('watch', function (action, filepath, target) {
        // Copy only changed file
        if (target === 'copy_main') {
            changeFileSrc(['copy', 'main', 'files'], filepath);
        }
        else if (target === 'assemble_js') {
            changeFileSrc(['assemble', 'js', 'files'], filepath);
        }
    });

    // Clean entire target directory
    // 'clean:main',
};