package helper

import model.Paper
import play.api.Logger

/**
 * User: Björn Reimer
 * Date: 11/23/13
 * Time: 8:52 PM
 */

object Schulze {

  // cretes matrix defining the number of voters who prefer candidate i to candidate j

  def createCandidateMatrix(ballots: List[Paper], candidates: List[String]): List[List[Int]] = {
    // get preference matrix for each ballot
    val list = ballots.map(getPreferences(_, candidates))

    // add them all up
    list.reduce((all, next) => {
      all.zip(next).map(x => x._1.zip(x._2).map(y => y._1 + y._2))
    })
  }

  // get matrix for single ballot
  def getPreferences(ballot: Paper, candidates: List[String]): List[List[Int]] = {

    def findPosition(candidate: String): Int = {

      val pos = ballot.ranking.indexWhere(_.contains(candidate))

      if (pos < 0) {
        // when not present return as last
        ballot.ranking.size + 1
      } else {
        pos
      }
    }


    def singleCandidate(candidate: String): List[Int] = {

      // find position of this candidate
      val pos = findPosition(candidate)

      // compare this position to that of the other candidates
      candidates.foldLeft(List[Int]())((List, c) => {
        if (findPosition(c) <= pos) {
          List :+ 0
        } else {
          List :+ 1
        }
      })
    }

    // loop over all candidates and find the relative positions
    candidates.foldLeft(List[List[Int]]())((List, c) => {
      List :+ singleCandidate(c)
    })
  }

  def getRanking(ballots: List[Paper]): List[String] = {

    // get all available candidates
    val candidates = getCandidates(ballots)

    // create matrix with preferences
    val matrix: List[List[Int]] = createCandidateMatrix(ballots, candidates)
    Logger.debug(matrix.toString())

    candidates
  }

  // parses List of ballots for all available options
  def getCandidates(ballots: List[Paper]): List[String] = {

    def getUniqueElements(existingOptions: List[String], ballot: Paper): List[String] = {
      ballot.ranking.flatten.foldLeft(existingOptions)((options, option) =>
        if (options.contains(option)) {
          options
        }
        else {
          options :+ option
        }
      )
    }

    ballots.foldLeft[List[String]](List())(getUniqueElements)
  }


}
