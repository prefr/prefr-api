var schulzeDoodle   =   angular.module(
                            'schulzeDoodle',
                            [
                                'ngRoute',
                                'schulzeDoodleControllers'
                            ]
                        )

schulzeDoodle.config([
    '$routeProvider',
    function($routeProvider) {
        $routeProvider
        .when(
            '/ballot_box/:box_id',
            {
                templateUrl :   'static/partials/ballot_box/index.html',
                controller  :   'BallotBoxCtrl'
            }
        )
        .when(
            '/ballot_paper/:paper_id', 
            {
                templateUrl :   'static/partials/polling_booth.html',
                controller  :   'BallotPaperCtrl'
            }
        )
        .when(
            '/evaluate/:box_id',
            {
                templateUrl :   'static/partials/evalation.html',
                controller  :   'EvaluationCtrl'
            }
        )
        .otherwise({
            redirectTo: '/ballot_box/1'
        })
    }
])


schulzeDoodle.service(
    'Ballot',
    [
        '$http',
        function($http) {

            this.getBallotBox       =   function(box_id) {
                                            //dummy:
                                            return  {
                                                        id      :   1,
                                                        subject :   "Beispiel",
                                                        options :   [this.getOption("A"), this.getOption("B"), this.getOption("C")], 
                                                        papers  :   [this.getBallotPaper(1), this.getBallotPaper(2)]
                                                    }
                                        }

            this.getBallotPaper     =   function(paper_id) {
                                            //dummy:
                                            papers  =   {
                                                            1   :   {
                                                                        id          :   1,
                                                                        participant :   "user1",
                                                                        ranking     :   [["A"], ["B", "C"]]
                                                                    },

                                                            2   :   {
                                                                        id          :   2,
                                                                        participant :   "user2",
                                                                        ranking     :   [["B"], ["C", "A"]]
                                                                    }
                                                        }
                                            return(papers[paper_id])
                                        }

            this.getOption          =       function(option_id) {
                                            //dummy:
                                            return  {
                                                        title   :   option_id,
                                                        details :   "Beschreibung"
                                                    }
                                        }

            this.addBallotPaper     =   function(ballot_paper) {
                                            return(angular.extend(ballot_paper, {id: Math.floor(Math.random()*100)}))
                                        }

            this.getSchulzeRanking  =   function(box_id) {
                                            return ["A", "C", "B"]
                                        }
        }
    ]
)



