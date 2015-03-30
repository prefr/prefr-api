angular.module('services',[])
.factory('BallotOption',[

    //no dependencies

    function(){
        function BallotOption(data){
            this.title      = undefined
            this.details    = undefined
            this.tag        = undefined

            this.importData = function(data){

                data = data || {}
                this.title      = typeof data.title     == 'string'   ? data.title    : this.title
                this.details    = typeof data.details   == 'string'   ? data.details  : this.details
                this.tag        = data.tag      || this.tag

                this.backup     =   {
                                        title:      String(this.title || ''),
                                        details:    String(this.details || ''),
                                        tag:        String(this.tag)
                                    }

                return this
            }

            this.exportData = function(){
                return  {
                            tag:        this.tag        || '',
                            title:      this.title      || '',
                            details:    this.details    || ''
                        }
            }

            this.diff = function(){
                var diff = {}

                if(this.tag != this.backup.tag)
                    diff.tag = this.tag || ''

                if(this.title != this.backup.title)
                    diff.title = this.title || ''

                if(this.details != this.backup.details)
                    diff.details = this.details || ''

                if(this.removed)
                    diff.removed = true

                return  Object.keys(diff).length > 0 
                        ?   diff
                        :   null
            }

            this.apply = function(){
                this.importData(this.exportData())
            }

            this.revert = function(){
                this.importData(this.backup)
            }

            this.importData(data)


        }

        return BallotOption
    }
])
.factory('BallotPaper', [

    'BallotOption',

    function(BallotOption){
        function BallotPaper(data){

            var self = this

            this.id             = undefined
            this.participant    = undefined
            this.ranking        = undefined

            this.importData = function(data, skip_backup){

                data = data || {} 

                this.id             = 'id'             in data ? data.id           : this.id
                this.participant    = 'participant'    in data ? data.participant  : this.participant || ''
                this.removed        = 'removed'        in data ? data.removed      : this.removed || false
                this.ranking        = 'ranking'        in data ? JSON.parse(JSON.stringify(data.ranking))      : this.ranking || ''


                if(!skip_backup){

                    this.backup         =   {
                                                participant :   String(this.participant),
                                                ranking:        JSON.parse(JSON.stringify(this.ranking)),
                                                removed:        this.removed
                                            }


                    this.backup_zero    =   this.backup_zero ||     {
                                                                        participant :   String(this.participant),
                                                                        ranking:        JSON.parse(JSON.stringify(this.ranking)),
                                                                        removed:        this.removed
                                                                    }
                }

                return this
            }

            this.exportData = function(){
                return  {
                            id:             this.id,
                            participant:    this.participant,
                            ranking:        this.ranking,
                        }
            }

            this.addOption = function(tag){
                if(this.ranking.length == 0)
                    this.ranking.push([])

                var ranked_options  = this.getRankedOptions(),
                    status_quo_rank = this.ranking.filter(function(rank){ return rank.indexOf("0") != -1 })[0]


                if(ranked_options.indexOf(tag) == -1){
                    status_quo_rank.length
                    ?   status_quo_rank.push(tag)
                    :   this.ranking[this.ranking.length-1].push(tag)   
                }
                
                return this
            }

            this.removeOption = function(tag){
                this.ranking.forEach(function(rank, index){
                    var pos = rank.indexOf(tag)
                    if(pos != -1)
                        rank.splice(pos, 1)         

                    if(rank.length == 0)
                        self.ranking.splice(index, 1)
                })


                return this
            }           

            this.diff = function(zero){
                var diff = {},
                    backup = zero ? this.backup_zero : (this.id ? this.backup : {})

                if(this.participant != backup.participant)
                    diff.participant = this.participant

                if(JSON.stringify(this.ranking) != JSON.stringify(backup.ranking))
                    diff.ranking = this.ranking

                return  Object.keys(diff).length > 0 
                        ?   diff
                        :   null
            }

            this.getRankedOptions = function(){
                console.log(this.ranking)
                console.log(this.ranking.reduce(function(options, rank){
                            return Array.concat(options, rank) 
                        }, []))
                return  this.ranking.reduce(function(options, rank){
                            return Array.concat(options, rank) 
                        }, [])
            }

            this.revert = function(){
                this.importData(this.backup_zero, true)
            }

            this.lock = function(){
                this.locked = true
            }

            this.unlock = function(){
                this.locked = false
            }


            this.importData(data)
        }

        return BallotPaper
    }
])
.factory('Ballot',[

    'BallotPaper',
    'BallotOption',

    function(BallotPaper, BallotOption){
        function Ballot(data){
            var self            = this

            this.id             = undefined
            this.subject        = undefined
            this.details        = undefined
            this.locked         = undefined
            this.options        = []
            this.papers         = []
            this.backup         = {}

            this.getOptionByTag = function(tag){
                return this.options.filter(function(option){ return option.tag == tag })[0]    
            }

            this.getPaperById = function(id){
                return this.papers.filter(function(paper){ return paper.id == id })[0]     
            }

            this.importOptions = function(data){
                this.options =  data.map(function(option_data){
                                    var option = self.getOptionByTag(option_data.tag) || new BallotOption(option_data)

                                    return option.importData(option_data)
                                })

                this.backup.options = data

                return this
            }

            this.importPapers = function(data){
                this.papers  =  data.map(function(paper_data){
                                    var paper = self.getPaperById(paper_data.id) || new BallotPaper(paper_data)

                                    return paper.importData(paper_data)
                                })

                return this
            }

            this.importSettings = function(data){                
                this.id      = data.id      || this.id      || ''

                this.subject =  data.subject != undefined
                                ?   data.subject 
                                :   this.subject || ''

                this.details =  data.details != undefined
                                ?   data.details 
                                :   this.details || ''

                this.locked  = data.locked  || this.locked  || false

                this.backup.subject = String(this.subject)
                this.backup.details = String(this.details)

                return this
            }


            this.importData = function(data){

                this
                .importSettings(data)
                .importOptions(data.options || [])
                .importPapers(data.papers || [])


            }

            this.exportData = function(){
                return  {
                            id:         this.id,
                            subject:    this.subject,
                            details:    this.details,
                            options:    this.options.map(function(option){
                                            return  option.removed
                                                    ?   undefined
                                                    :   option.exportData()
                                        }).filter(function(item){ return !!item}),
                            papers:     this.papers.map(function(paper){
                                            return  paper.removed
                                                    ?   undefined
                                                    :   paper.exportData()
                                        }).filter(function(item){ return !!item})
                        }
            }

            this.diff    = function(){
                var diff = {}

                if(this.subject != this.backup.subject )
                    diff.subject = this.diff

                if(this.details != this.backup.details)
                    diff.details = this.details

                var options_diff =  this.options.map(function(option){
                                        return option.diff()
                                    }).filter(function(item){ return item })

                if(options_diff.length > 0)
                    diff.options = options_diff

                return  Object.keys(diff).length > 0
                        ?   diff
                        :   null
            }


            this.getNextAvailableTag = function(){
                var base_tags   =   "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
                    taken_tags  =   this.options.map(function(option){
                                        return option.tag
                                    })
                    i           =   0,
                    next_tag    =   'A'

                function number2Tag(x){
                    return (x > 26) ? number2Tag(Math.floor(x/26)-1) + base_tags[x % 26] : base_tags[x % 26]
                }

                while(taken_tags.indexOf(next_tag) != -1){
                    next_tag =  number2Tag(i)                    
                    i++
                }

                return next_tag

            }

            this.newOption  =   function(){
                if(this.locked)
                    return false

                var new_option = new BallotOption( {tag : self.getNextAvailableTag()} )
                this.options.push(new_option)
                return new_option
            }

            this.newPaper   = function(data){    
                if(this.locked)
                    return false

                var ranking     = [this.options.map(function(option){ return option.tag })]
                    new_paper   = new BallotPaper(data || { ranking :  ranking })
                this.papers.unshift(new_paper) 
                return new_paper
            }

            this.removeOption = function(option){    
                if(this.locked)
                    return false


                var tag = option.tag || option

                this.options.forEach(function(option){
                    if(option.tag == tag)
                        option.removed = true
                })

            }

            this.restoreOption = function(option){
                if(this.locked)
                    return false

                var tag = option.tag || option

                this.options.forEach(function(){
                    if(option.tag == tag)
                        delete option.removed
                })
            }

            this.removePaper = function(paper){
                if(this.locked)
                    return false

                paper.removed = true
            }

            this.restorePaper = function(paper){
                if(this.locked)
                    return false

                paper.removed = false
            }

            this.paperCount = function(){
                return this.papers.filter(function(paper){ return !paper.removed }).length
            }

            this.optionCount = function(){
                return this.options.filter(function(option){ return !option.removed }).length
            }

            this.revert = function(){                
                this.importSettings(this.backup)     
                this.options = []
                this.importOptions(this.backup.options) 
            }


            this.importData(data)
        }

        return Ballot
    }
])
.service('api', [

    '$http',

    function($http){
        return {

            getBallot: function(box_id){
                return  $http.get('/api/ballotBox/'+box_id)
                        .then(function(result){
                            return result.data
                        })
            },

            saveBallot: function(ballot){
                return $http.post('/api/ballotBox', ballot.exportData())
                        .then(function(result){
                            return result.data
                        })                    
            },

            updateBallot: function(ballot, adminSecret){
                var data = ballot.exportData() 

                data.adminSecret = adminSecret              

                return  $http.put('/api/ballotBox/'+data.id, data)
                        .then(function(result){
                            return result.data
                        })
            },

            savePaper: function(ballot, paper){ //paper may just be diff data
                var data        =   paper.diff 
                                    ?   paper.diff() || paper.exportData()
                                    :   paper,
                    api_call    =   paper.id
                                    ?   $http.put('/api/ballotBox/'+ballot.id+'/paper/'+paper.id, data)
                                    :   $http.post('/api/ballotBox/'+ballot.id+'/paper', data)

                return  api_call
                        .then(function(result){
                            return result.data
                        })
            }


        }
    }
])
.service('Storage', [

    '$window',
    '$rootScope',

    function($window, $rootScope){
        var scope       = $rootScope.$new()

        scope.data = JSON.parse($window.localStorage.getItem("prefr") || '{}')


        if(typeof($window.localStorage) !== "undefined") {
            scope.$watch(function(){
                $window.localStorage.setItem("prefr", JSON.stringify(scope.data))
            })
        }

        return scope.data
    }
])

