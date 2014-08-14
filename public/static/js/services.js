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
                this.title      = data.title    || this.title
                this.details    = data.details  || this.details
                this.tag        = data.tag      || this.tag

                return this
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

            this.id             = undefined
            this.participant    = undefined
            this.ranking        = undefined

            this.importData = function(data){
                this.id          = data.id          || this.id
                this.participant = data.participant || this.participant
                this.ranking     = data.ranking     || this.ranking

                return this
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
            var self         = this

            this.id          = undefined
            this.subject     = undefined
            this.options     = []
            this.papers      = []

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
            }

            this.getNextAvailableTag = function(){
                var base_tags   =   "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
                    taken_tags  =   this.options.map(function(option){
                                        return option.tag
                                    }),
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
                    paper.ranking[paper.ranking.length-1].push(new_option.tag)
                })
                return self
            }

            this.newPaper   = function(){ this.papers.unshift(new BallotPaper()) }

            this.removeOption = function(option){
                var tag = option.tag || option
                this.options = this.option.filter(function(option){ return option.tag != tag })
            }

            this.removePaper = function(paper){
                var id = paper.id || paper
                this.papers = this.papers.filter(function(paper){ return paper.id != id })
            }

            this.importData(data)
        }

        return Ballot
    }
])

