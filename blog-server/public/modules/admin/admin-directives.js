angular.module('admin.directives', [])

.directive('cmsList', [function(){
  return {
    // controller: 'cmsController',
    scope: {
      data: '=',
      edit: '='
    },
    templateUrl: 'modules/admin/templates/content-list-template.html'
  };
}])


.directive('cmsItem', [function(){

  var Schema = function(item) {
    if(item.parent === 'events'){
      return {
        dateString: item.dateString,
        timestamp: item.timestamp,
        title: item.title,
        content: content,
        parent: 'blogEntries',
        key: item.key
      };
    } else {

    }
  };

  return {
    // controller: 'cmsController',
    scope: {
      item: '=',
      edit: '='
    },
    controller: function ($scope) {
      $scope.editItem = function (evt) {
        //Call external scope's function
        $scope.edit(evt, $scope.item);
      };
    },
    transclude: true,
    templateUrl: 'modules/admin/templates/content-item-template.html',
    link: function(scope, element, attrs, controllers) {
      var item = new Schema(scope.item);
      scope.keys = item;
    }
  };
}]);

