var schulzeDoodleControllers = angular.module('schulzeDoodleControllers', []);
 
schulzeDoodleControllers.controller(
	'BallotBoxCtrl', 
	[
		'$scope', 
		'$http',
		function ($scope, $http) {
			$scope.ballots 		=	[
										{
											participant	:	"user1",
											ranking		:	[["A"], ["B", "C"]]
										},
										{
											participant	:	"user2",
											ranking		:	[["B"], ["C", "A"]]
										}
									]

			$scope.newBallot	=	function() {
										ballot	=	{
														participant	:	"unnamed",
														ranking		:	[]
													}									
										$scope.ballots.push(ballot)
									}

			$scope.submit		=	function(){
										$http.post('/api/get_schulze_rank', {
											"ballots"	:	$scope.ballots
										})
									}
		}
	]
)

schulzeDoodleControllers.controller(
	'BallotListItemCtrl', 
	[
		'$scope', 
		function($scope) {
			$scope.edit			=	false
			$scope.toggleEdit	=	function(){
										$scope.edit	=	!$scope.edit
									}
		}
	]
)

schulzeDoodleControllers.controller(
	'BallotCtrl', 
	[
		'$scope', 
		'$routeParams',
		function($scope, $routeParams) {
			$scope.ballotId = $routeParams.ballotId;
		}
	]
)