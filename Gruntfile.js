module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      files: ['public/javascripts/client.js'],
      tasks: ['browserify']
    },
    browserify: {
      dist: {
        files: {
          'public/javascripts/client.bundle.js': ['public/javascripts/client.js'],
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-browserify');
};