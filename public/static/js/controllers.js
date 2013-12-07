var schulzeDoodleControllers = angular.module('schulzeDoodleControllers', []);
 

schulzeDoodleControllers.controller(

	'BallotBoxCtrl', 
	[
		'$scope', 
		'$routeParams',
		function ($scope, $routeParams) {
			$scope.box_id = $routeParams.box_id			
		}
	]
)

schulzeDoodleControllers.controller(

	'BallotPaperCtrl', 
	[
		'$scope', 
		'$routeParams',
		function ($scope, $routeParams) {
			$scope.paper_id = $routeParams.paper_id			
		}
	]
)


schulzeDoodleControllers.directive('ballotbox',		HTMLballotbox)
schulzeDoodleControllers.directive('ballotpaper',	HTMLballotpaper)


