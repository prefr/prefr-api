function Ballot($http, $q, $rootScope) {

	$rootScope.$on('paper_update', function(event, paper){
		if(event.targetScope != $rootScope) $rootScope.$broadcast('paper_update', paper)
	})

    this.getBallotBox = function(box_id) {
        //dummy:
        var deferred	=	$q.defer()

    	deferred.resolve(_refactor({
            id      :   1,
            subject :   "Beispiel",
            options :   [{
            				id		:	"A",
                            title   :   "Titel A",
                            details :   "Beschreibung"
                        }, {
            				id		:	"B",
                            title   :   "Titel B",
                            details :   "Beschreibung"
                        }, {
            				id		:	"C",
                            title   :   "Titel C",
                            details :   "Beschreibung"
                        }], 
            papers  :   [
							{
                                id          :   1,
                                box			:	1,
                                participant :   "user1",
                                ranking     :   [["A"], ["B", "C"]]
                            },
                            {
                                id          :   2,
                                box			:	1,
                                participant :   "user2",
                                ranking     :   [["B"], ["C", "A"]]
                            }
                        ]
		}))

        return(deferred.promise)
	}

    this.getBallotPaper = function(paper_id) {
        //dummy:
        var deferred = $q.defer()

        papers  =   {
                        1   :   {
                                    id          :   1,
                                	box_id		:	1,
                                    participant :   "user1",
                                    ranking     :   [["A"], ["B", "C"]]
                                },

                        2   :   {
                                    id          :   2,
                                	box_id		:	1,
                                    participant :   "user2",
                                    ranking     :   [["B"], ["C", "A"]]
                                }
                    }

        deferred.resolve(papers[paper_id])
        return(deferred.promise)
    }

    this.getBallotBoxOptions = function(box_id) {
        //dummy:
        var deferred = $q.defer()

        deferred.resolve(_refactor([
        	{
        		id		:	"A",
            	title   :   "Titel A",
            	details :   "Beschreibung Beschreibung Beschreibung Beschreibung Beschreibung Beschreibung Beschreibung Beschreibung Beschreibung "
            },
        	{
        		id		:	"B",
            	title   :   "Titel B",
            	details :   "Beschreibung Beschreibung Beschreibung Beschreibung Beschreibung Beschreibung Beschreibung Beschreibung Beschreibung Beschreibung Beschreibung "
            },
        	{
        		id		:	"C",
            	title   :   "Titel C",
            	details :   "Beschreibung Beschreibung Beschreibung "
            },
        	{
        		id		:	"D",
            	title   :   "Titel D",
            	details :   "Beschreibung Beschreibung Beschreibung Beschreibung Beschreibung Beschreibung Beschreibung Beschreibung "
            },
        ]))

        return (deferred.promise)
    }

    this.addBallotPaper = function(ballot_paper) {
		var deferred = $q.defer()

        deferred.resolve($.extend(ballot_paper, {id: Math.floor(Math.random()*100)}))	

        return(deferred.promise)
    }

	this.removeBallotPaper = function(paper_id) {
        var deferred = $q.defer()

        deferred.resolve(true)	

        return(deferred.promise)
    }

    this.getSchulzeRanking = function(box_id) {
        return ["A", "C", "B"]
    }                                
}

