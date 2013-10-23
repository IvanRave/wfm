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


    // By default = devSite
    var isProd = grunt.option('prod') ? true : false,
        isIpad = grunt.option('ipad') ? true : false,
        // Request url
        requrl = grunt.option('requrl') || 'http://wfm.azurewebsites.net',
        // Build language: en, ru, es etc.
        lang = grunt.option('lang') || 'en';

    // Target - destination folder plus config, for example: 
    // dev (development)
    // dst (main distribution)
    // devipad (dev for IPad)
    // dstipad (distrib for IPad)
    var trgt = isProd ? 'dst' : 'dev';
    if (isIpad) {
        trgt += "ipad";
    }

    // Project configuration
    grunt.config.init({
        // Metadata
        pkg: grunt.file.readJSON('package.json'),
        // Use for <% template in JSON keys
        trgt: trgt,
        lang: lang,
        // Banner for scripts comments: author, licence etc.
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
                    jshintrc: '<%= folder.src %>/scripts/app/.jshintrc'
                },
                // all js files in js folder
                src: ['<%= folder.src %>/scripts/app/**/*.js']
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
                    cwd: '<%= folder.src %>/',
                    dest: '<%= trgt %>/',
                    // Copy all files besides templates
                    src: ['**/*', '!tpl/**/*', '!scripts/app/**/*']
                }]
            }
        },
        assemble: {
            options: {
                engine: 'handlebars',
                // Main properties
                // TODO: Change "en" to <%= lang %> parameters - it doesn't work yet for second time of using
                data: ['assemble_store/data/syst.json', 'assemble_store/data/lang/en/lang.json', 'package.json'],
                // Build configuration properties
                conf: {
                    // Request url (begin of the path)
                    // if exists - other domain (CORS requests - for local testing and side programs)
                    // if empty - the same domain (simple requests)
                    // Example {{requrl}}/api/values
                    requrl: requrl,
                    isProd: isProd,
                    isIpad: isIpad
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
                    dest: '<%= trgt %>'
                }]
            },
            readme: {
                options: {
                    ext: '.md'
                },
                files: {
                    './README': 'assemble_store/tpl/pages/README.md.hbs'
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
                    dest: '<%= trgt %>/scripts/app/'
                }]
            }
        },
        requirejs: {
            workspace: {
                options: {
                    baseUrl: '<%= trgt %>/scripts/',
                    name: 'app/workspace/project',
                    out: '<%= trgt %>/scripts/app/workspace/project-bundle-<%= pkg.version %>.min.js',
                    mainConfigFile: '<%= trgt %>/scripts/require-config.js',
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
            copy_main: {
                options: {
                    cwd: '<%= folder.src %>/',
                    spawn: false
                },
                files: ['**/*', '!tpl/**/*', '!scripts/app/**/*'],
                tasks: ['copy:main']
            },
            // Update all template pages when change template data
            assemble_data: {
                files: ['assemble_store/data/syst.json', 'assemble_store/data/lang/en/lang.json', 'package.json'],
                tasks: ['assemble:html', 'assemble:js', 'assemble:readme']
            },
            assebmle_readme: {
                files: ['assemble_store/tpl/pages/README.md.hbs'],
                tasks: ['assemble:readme']
            },
            assemble_html: {
                files: ['<%= folder.src %>/tpl/**/*.hbs'],
                tasks: ['assemble:html']
            },
            assemble_js: {
                options: {
                    spawn: false
                },
                files: ['<%= folder.src %>/scripts/app/**/*.js'],
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
      ////'jshint: app', // TODO: fix jshint errors

      // 2. Clean
     'clean:main',

      // 3. Copy plain and assembled files
     'copy:main', // Copy main files
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
        ////grunt.log.writeln(targetEvent + ': ' + filepath + ' has ' + action);
    });
};