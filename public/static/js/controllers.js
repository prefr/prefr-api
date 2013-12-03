var schulzeDoodleControllers = angular.module('schulzeDoodleControllers', []);
 

schulzeDoodleControllers.controller(

	'BallotBoxCtrl', 
	[
		'$scope', 
		'$http',
		'$routeParams',
		'Ballot',
		function ($scope, $http, $routeParams, Ballot) {

			angular.extend($scope, Ballot.getBallotBox($routeParams.box_id))

			$scope.addBallot		=	function() {
											paper	=	{
															participant	:	"unnamed",
															ranking		:	[["A", "C"], ["B"]]
														}

											$scope.papers.push(Ballot.addBallotPaper(paper))
										}
			$scope.quickEdit		=	function(paper_id) {
											$scope.quick_edit = paper_id
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
										$scope.quick_edit	=	!$scope.quick_edit
									}
		}
	]
)

schulzeDoodleControllers.controller(

	'BallotPaperCtrl',
	[
		'$scope', 
		'$http',
		'$routeParams',
		'Ballot',
		function ($scope, $http, $routeParams, Ballot) {

			angular.extend($scope, Ballot.getBallotPaper($routeParams.paper_id))

			$scope.addBallot		=	function() {
											paper	=	{
															participant	:	"unnamed",
															ranking		:	[["A", "C"], ["B"]]
														}

											$scope.papers.push(Ballot.addBallotPaper(paper))
										}
			$scope.quickEdit		=	function(paper_id) {
											$scope.quick_edit = paper_id
										}
		}
	]

)

