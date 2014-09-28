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
                this.title      = data.title    || this.title   || ''
                this.details    = data.details  || this.details || ''
                this.tag        = data.tag      || this.tag     || ''

                this.backup     =   {
                                        title:      String(this.title),
                                        details:    String(this.details)
                                    }

                return this
            }

            this.exportData = function(){
                return  {
                            title:      String(data.title),
                            details:    String(data.details),
                            tag:        String(data.tag)
                        }
            }

            this.diff = function(){
                var diff = {}

                if(this.tag != this.backup.tag)
                    diff.tag = this.tag

                if(this.tile != this.backup.title)
                    diff.title = this.title

                if(this.details != this.backup.details)
                    diff.details = this.details

                if(this.removed)
                    diff.removed = true

                return  Object.keys(diff).length > 0 
                        ?   diff
                        :   null
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

            this.importData = function(data){

                data = data || {} 

                this.id          = data.id          || this.id
                this.participant = data.participant || this.participant || ''
                this.ranking     = data.ranking     || this.ranking || ''
                this.removed     = data.removed     || this.removed || false

                this.backup      =  {
                                        removed:        !!data.removed,
                                        participant :   String(data.participant),
                                        ranking:        angular.extend([], data.ranking)
                                    }

                return this
            }

            this.exportData = function(){
                return  {
                            id:             this.id,
                            participant:    this.participant,
                            ranking:        this.ranking
                        }
            }

            this.addOption = function(tag){
                if(this.ranking.length == 0)
                    this.ranking.push([])
                this.ranking[this.ranking.length-1].push(tag)
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

            this.diff = function(){
                var diff = {}

                if(this.participant != this.backup.participant)
                    diff.participant = this.participant

                if(JSON.stringify(this.ranking) != JSON.stringify(this.backup.ranking))
                    diff.ranking = this.ranking

                if(this.removed != this.backup.removed)
                    diff.removed = true

                return  Object.keys(diff).length > 0 
                        ?   diff
                        :   null
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
            this.options        = []
            this.papers         = []
            this.removedOptions = []
            this.removedPapers  = []

            this.getOptionByTag = function(tag){
                return this.options.filter(function(option){ return option.tag == tag })[0]    
            }

            this.getPaperById = function(id){
                return this.papers.filter(function(paper){ return paper.id == id })[0]     
            }

            this.importData = function(data){
                this.id      = data.id      || this.id
                this.subject = data.subject || this.subject


                this.options =  data.options.map(function(option_data){
                                    var option = self.getOptionByTag(option_data.tag) || new BallotOption(option_data)

                                    return option.importData(option_data)
                                })

                this.papers  =  data.papers.map(function(paper_data){
                                    var paper = self.getPaperById(paper_data.id) || new BallotPaper(paper_data)

                                    return paper.importData(paper_data)
                                })

                this.backup =   {
                                    subject: data.subject
                                }
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
                return  {
                            id:             this.id,

                            subject:        this. backup.subject == this.subject 
                                            ?   undefined
                                            :   this.subject,

                            options:        this.options.map(function(option){
                                                return option.diff()
                                            }),

                            papers:         this.papers.map(function(paper){
                                                return paper.diff()
                                            }),

                        }
            }

            this.getNextAvailableTag = function(){
                var base_tags   =   "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
                    taken_tags  =   this.options.map(function(option){
                                        return option.tag
                                    })
                                    .concat(
                                        this.removedOptions.map(function(removed_option){
                                        return removed_option.tag
                                    })
                                    ),
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
                var new_option = new BallotOption( {tag : self.getNextAvailableTag()} )
                this.options.push(new_option)
                this.papers.forEach(function(paper){
                    paper.addOption(new_option.tag)
                })
                return new_option
            }

            this.newPaper   = function(){                 
                var ranking     = [this.options.map(function(option){ return option.tag })]
                    new_paper   = new BallotPaper({ ranking :  ranking })
                this.papers.push(new_paper) 
                return new_paper
            }

            this.removeOption = function(option){                

                var tag = option.tag || option

                this.options.forEach(function(option){
                    if(option.tag == tag)
                        option.removed = true
                })

                this.papers.forEach(function(paper){
                    paper.removeOption(tag)
                })
            }

            this.restoreOption = function(option){
                var tag = option.tag || option

                this.options.forEach(function(){
                    if(option.tag == tag)
                        delete option.removed
                })

                this.papers.forEach(function(paper){
                    paper.addOption(tag)
                })
            }

            this.removePaper = function(paper){
                paper.removed = true
            }

            this.restorePaper = function(paper){
                delete paper.removed
            }

            this.importData(data)
        }

        return Ballot
    }
])
.factory('walkthrough', [

    '$rootScope',

    function($rootScope){
        var self = [],
            current_path,
            current_step

        self.register = function(path, step, element){
            self[path]          =   self[path] || []
            self[path][step]    =   element

            if(path == current_path && step == current_step)
                self[path] && self[path][step] && self[path][step].show()

            element.hide()
        }

        self.goto = function(path, step){
            self[current_path] && self[current_path][current_step] && self[current_path][current_step].hide()

            current_path = path || current_path
            current_step = step

            self[current_path] && self[current_path][current_step] && self[current_path][current_step].show()

        }

        self.gotoFn = function(path, step){
            return  function(){
                        self.goto(path, step)
                    }
        }

        $rootScope.walkthrough = self

        return self
    }
])

