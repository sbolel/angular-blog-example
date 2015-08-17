myApp.homeModule.directive('blogEntry', function () {
  'use strict';
  return {
    scope: {
      entry: '='
    },
    controller: 'BlogEntryController',
    templateUrl: 'src/home/blog-entry-template.html'
  };
});