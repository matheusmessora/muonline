module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-cdn');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-filerev');
    grunt.loadNpmTasks('grunt-usemin');


    // Define the configuration for all the tasks
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),


        clean: {
            build: {
                src: ["dist", "tmp", ".tmp"]
            }
        },

        useminPrepare: {
            html: 'head.html',
            dest: '.tmp'

        },

        usemin: {
            html: 'dist/head.html',
            options: {
                assetsDirs: '.tmp'
            }
        },

        //        htmlmin: {
        //            dist: {
        //                options: {
        //                    collapseWhitespace: true,
        //                    collapseBooleanAttributes: true,
        //                    removeCommentsFromCDATA: true,
        //                    removeOptionalTags: true
        //                },
        //                files: [{
        //                    expand: true,
        //                    cwd: '.',
        //                    src: ['*.html', '**/*.html'],
        //                    dest: 'dist/'
        //                }]
        //            }
        //        },
        //
        //        uglify: {
        //            build: {
        //                files: [{
        //                    expand: true,
        //                    cwd: 'tmp/',
        //                    src: '**/*.js',
        //                    dest: 'dist/app/js'
        //                }]
        //            }
        //        },
        //
        //        concat: {
        //            js: {
        //                src: 'app/**/*.js',
        //                dest: 'tmp/js/app.js'
        //            },
        //        },

        filerev: {
            build: {

                options: {
                    encoding: 'utf8',
                    algorithm: 'md5',
                    length: 8
                }
            }
        },

        cdn: {
            options: {
                cdn: 'https://s3-sa-east-1.amazonaws.com/muonline/'
            },
            dist: {

            }
        }
    });

    // A very basic default task.
    grunt.registerTask('dist', [
        'clean',
        'useminPrepare',
        'concat:generated',
        'cssmin:generated',
        'uglify:generated',
        'filerev',
        'usemin'
    ]);
};
