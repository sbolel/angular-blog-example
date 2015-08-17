#!/usr/bin/env node
'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: {
      release: ['app/release/vendor.js', 'app/release/<%= pkg.name %>.js']
    },

    connect: {
      client: {
        options: {
          port: 9000,
          base: './app',
          livereload: true,
          open: {
            target: 'http://localhost:9000',
            appName: 'Google Chrome',
          }
        }
      }
    },

    cssmin: {
      options: {
        sourceMap: true,
        shorthandCompacting: true
      },
      dev: {
        files: {
          'app/release/app.min.css': ['app/assets/css/app.css', 'app/assets/css/avatar.css', 'app/assets/css/flippy.css']
        }
      },
      vendor: {
        files: {
          'app/release/vendor.min.css': [
            'bower_components/angular-material/angular-material.css',
            'bower_components/ionicons/css/ionicons.css'
          ]
        }
      }
    },

    qunit: {
      files: ['test/**/*.html']
    },

    jshint: {
      files: ['Gruntfile.js', 'app/**/*.js'],
      options: {
        globals: {
          angular: true,
          Firebase: true,
          console: true,
          module: true,
          document: true
        }
      }
    },

    ngAnnotate: {
      options: {
        singleQuotes: true,
      },
      dev: {
        files: {
          'app/release/<%= pkg.name %>.js': [
            'app/src/utils/helpers.js',
            'app/app.js',
            'app/src/utils/server.js',
            'app/src/home/home-module.js',
            'app/src/home/blog-entry-controller.js',
            'app/src/home/blog-entry-directive.js',
            'app/src/form/form-module.js',
            'app/src/form/form-controller.js',
            'app/src/form/form-directive.js',
          ]
        }
      },
      vendor: {
        files: {
          'app/release/vendor.js': [
            'bower_components/angular/angular.js',
            'bower_components/angular-aria/angular-aria.js',
            'bower_components/angular-route/angular-route.js',
            'bower_components/angular-animate/angular-animate.js',
            'bower_components/angular-material/angular-material.js',
            'bower_components/angular-ui-router/release/angular-ui-router.js',
            'bower_components/firebase/firebase.js',
            'bower_components/angularfire/dist/angularfire.js',
            'bower_components/moment/moment.js',
            'bower_components/angular-moment/angular-moment.js',
            'bower_components/angular-material-layout/dist/angular-material-layout.min.js',
            'bower_components/angular-firebase-cms/dist/angular-firebase-cms.min.js',
            'bower_components/underscore/underscore.js'
          ]
        }
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dev: {
        files: {
          'app/release/<%= pkg.name %>.min.js': ['app/release/<%= pkg.name %>.js']
        }
      },
      vendor: {
        files: {
          'app/release/vendor.min.js': ['app/release/vendor.js']
        }
      }
    },

    watch: {
      html: {
        files: ['app/**/*.html'],
        options: {
          livereload: true
        }
      },
      js: {
        files: ['app/**/*.js'],
        options: {
          livereload: true
        }
      },
      bower: {
        files: ['bower.json'],
        tasks:['wiredep']
      }
    },

    wiredep: {
      task: {
        src: ['app/index.html']
      }
    }

  });
  
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-ng-annotate');
  grunt.loadNpmTasks('grunt-wiredep');

  grunt.registerTask('build:dev', ['ngAnnotate:dev', 'uglify:dev', 'clean']);
  grunt.registerTask('build', ['ngAnnotate', 'uglify', 'clean']);
  grunt.registerTask('serve', ['connect', 'watch']);
  grunt.registerTask('default', ['serve']);

};