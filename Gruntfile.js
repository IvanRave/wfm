module.exports = function (grunt) {
    'use strict';
    // dev or dst
    var target = grunt.option('trg') || 'dev';
    // Project configuration
    grunt.initConfig({
        // Metadata
        pkg: grunt.file.readJSON('package.json'),
        target: target, // Use for <% template in JSON keys
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
          '<%= grunt.template.today("yyyy-mm-dd") %>\n' +          
          '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
          ' Licensed <%= pkg.license %> */\n',
        uniqueString: '<%= pkg.version %>',
        folder: {
            src: 'src', // Source
            dev: 'dev', // Development
            dst: 'dst' // Distributive
        },
        env: {
            options: {
                // Shared options hash
            },
            all: {
                NODE_ENV: target
            }
        },
        preprocess: {
            all: {
                files: [{
                    expand: true,
                    cwd: '<%= target %>/',
                    src: '**/index.html',
                    dest: '<%= target %>'
                }]
            }
        },
        // Task configuration
        clean: {
            all: [target]
        },
        jshint: {
            gruntfile: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: 'Gruntfile.js'
            },
            appScripts: {
                options: {
                    jshintrc: '<%= folder.src %>' + '/js/.jshintrc'
                },
                // all js files in js folder
                src: ['<%= folder.src %>/js/**/*.js']
            }
        },
        // js files concat and minify in Uglify
        // Concat other file types
        concat: {
            options: {
                separator: ';',
                banner: '<%= banner %>'
                //// process: function(src, filepath) {
                //// return '// Source: ' + filepath + '\n' +
                //// src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
                //// },
                //// stripBanners: true
            },
            dst: {
                // // src: ['<%= folder.src %>/js/menu/controllers.js', '<%= folder.src %>/js/app.js'],
                // // dest: '<%= folder.dst %>/js/bundle-<%= uniqueString %>.js',
                // // nonull: true
            },
            dev: {}
        },
        uglify: {
            script_main_dst: {
                options: {
                    // // banner: '<%= banner %>',
                    // sourceMap: '<%= folder.dst %>/js/bundle-<%= uniqueString %>.min.js.map',
                    // sourceMappingURL: 'bundle-<%= uniqueString %>.min.js.map',
                    // sourceMapPrefix: 2
                },
                files: {
                    '<%= folder.dst %>/js/bundle-<%= uniqueString %>.min.js': ['<%= folder.dst %>/js/menu/controllers.js', '<%= folder.dst %>/js/app.js']
                }
            },
            script_main_dev: {},
            google_search_tool_dst: {
                options: {
                    // sourceMap: '<%= folder.dst %>/js/google-search-tool.min.js.map',
                    // sourceMappingUrl: 'google-search-tool.min.js'
                },
                files: {
                    '<%= folder.dst %>/js/google-search-tool.min.js': '<%= folder.dst %>/js/google-search-tool.js'
                }
            },
            google_search_tool_dev: {}
        },
        copy: {
            all: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= folder.src %>/',
                    dest: target,
                    src: [
                      '*.{ico,png,txt,xml}',
                      'CNAME',
                      'google*.html',
                      '.htaccess',
                      // copy all LESS, SASS and CSS to use Source maps
                      'css/**/*.*',
                      // copy all source js files to use Source map
                      'js/**/*.js',
                      // copy all html templates
                      'js/**/*.html',
                      // images 
                      'img/**/*.*',
                      // fonts
                      'fonts/**/*.*'
                    ]
                }]
            }
        },
        htmlmin: {
            index_dst: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                    // // process: function(src, filepath) {},
                },
                files: [{
                    expand: true,
                    cwd: '<%= target %>/',
                    src: '**/index.html',
                    dest: '<%= target %>/'
                }]
            },
            index_dev: {}
        },
        less: {
            dst: {
                options: {
                    yuicompress: true
                },
                files: {
                    '<%= folder.dst %>/css/site.min.css': '<%= folder.dst %>/css/site.less',
                    '<%= folder.dst %>/css/bootstrap.min.css': '<%= folder.dst %>/css/bootstrap.less'
                }
            },
            dev: {
                options: {
                    yuicompress: false
                },
                files: {
                    '<%= folder.dev %>/css/site.css': '<%= folder.dev %>/css/site.less',
                    '<%= folder.dev %>/css/bootstrap.css': '<%= folder.dev %>/css/bootstrap.less'
                }
            }
        },
        assemble: {
            options: {
                data: 'src/tpl/data.json',
                layout: 'src/tpl/layouts/default.hbs',
                partials: ['src/tpl/partials/*.hbs']
                ////flatten: true
            },
            all: {
                files: [{
                    expand: true,
                    cwd: 'src/tpl/pages/',
                    src: '**/*.hbs',
                    dest: '<%= target %>'
                }]
            }
        },
        bower: {
            dev: {
                options: {
                    targetDir: 'dev/js/'
                }
            },
            dst: {
                options: {
                    targetDir: 'dst/js/'
                }
            }
        },
        // // watch: {
        // // files: ['**.*.js'],
        // // tasks: ['jshint']
        // // },
        qunit: {
            all: {
                options: {
                    urls: [
                      'test/test.html'
                      // http://localhost:9001/
                    ]
                }
            }
        },
        connect: {
            all: {
                options: {
                    open: true,
                    keepalive: true,
                    port: 9001,
                    base: target
                }
            }
        },
        'gh-pages': {
            options: {
                base: '<%= folder.dst %>'
            },
            src: ['**']
        }
    });

    // grunt.event.on('watch', function(action, filepath, target) {
    // grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
    // });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-less');
    //// grunt.loadNpmTasks('grunt-contrib-handlebars');
    //// grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('assemble');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-preprocess');
    // for dev
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-connect');
    // for dst
    grunt.loadNpmTasks('grunt-gh-pages');

    // Default task
    grunt.registerTask('default',
    ['jshint',
     'qunit',
     'clean:all',
     'copy:all',
     'bower:' + target,
     'uglify:script_main_' + target,
     'uglify:google_search_tool_' + target,
     'less:' + target,
     'assemble:all',
     'env',
     'preprocess',
     'htmlmin:index_' + target
    ]);

    ////grunt.registerTask('test', ['connect', 'qunit']);

    // grunt gh-pages run separately
};