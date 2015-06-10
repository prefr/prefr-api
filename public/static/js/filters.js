var prefrFilters = angular.module('prefrFilters', []);

prefrFilters


.filter('removed', function() {
  return    function(items, invert) {

                items = items || []

                return  items.filter(function(item){
                            return  invert
                                    ?   item.removed
                                    :   !item.removed
                        })
            }
})



.filter('dummyLast', function() {
  return    function(items) {
                return  items.sort(function(a,b){
                            return  !a
                        })
            }
})

.filter('empty', function() {
  return    function(items) {
                return      (items.length && item.length == 0)
                        ||  Object.keys(items).length == 0
            }
})

