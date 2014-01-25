package helper

import model.Paper
import play.api.Logger
import play.api.libs.json.{JsObject, Json}

/**
 * User: Björn Reimer
 * Date: 11/23/13
 * Time: 8:52 PM
 */

object Schulze {

  // creates matrix defining the number of voters who prefer candidate i to candidate j
  def createPreferenceMatrix(papers: Seq[Paper], candidates: Seq[String]): Seq[Seq[Int]] = {

    // get preference matrix for each paper
    val Seq = papers.map(getPreferences(_, candidates))

    // add them all up
    Seq.reduce((all, next) => {
      all.zip(next).map(x => x._1.zip(x._2).map(y => y._1 + y._2))
    })
  }

  // get matrix for single paper
  def getPreferences(paper: Paper, candidates: Seq[String]): Seq[Seq[Int]] = {

    def findPosition(candidate: String): Int = {

      val pos = paper.ranking.indexWhere(_.contains(candidate))

      if (pos < 0) {
        // when not present return as last
        paper.ranking.size + 1
      } else {
        pos
      }
    }


    def singleOption(option: String): Seq[Int] = {

      // find position of this option
      val pos = findPosition(option)

      // compare this position to that of the other options
      candidates.foldLeft(Seq[Int]())((Seq, c) => {
        if (findPosition(c) <= pos) {
          Seq :+ 0
        } else {
          Seq :+ 1
        }
      })
    }

    // loop over all options and find the relative positions
    candidates.foldLeft(Seq[Seq[Int]]())((Seq, c) => {
      Seq :+ singleOption(c)
    })
  }

  def determineStrongestPaths(d: Seq[Seq[Int]]): Seq[Seq[Int]] = {
    // Pseudo-code:
    // Input: d[i,j], the number of voters who prefer candidate i to candidate j.
    // Output: p[i,j], the strength of the strongest path from candidate i to candidate j.
    //
    //  for i from 1 to C
    //     for j from 1 to C
    //        if (i ≠ j) then
    //           if (d[i,j] > d[j,i]) then
    //              p[i,j] := d[i,j]
    //           else
    //              p[i,j] := 0
    //
    //  for i from 1 to C
    //     for j from 1 to C
    //        if (i ≠ j) then
    //           for k from 1 to C
    //              if (i ≠ k and j ≠ k) then
    //                 p[j,k] := max ( p[j,k], min ( p[j,i], p[i,k] )

    // Disclaimer: this is not done with functional programming to make sure that the algorithm is followed exactly
    val C = d.length
    var i = 0
    var j = 0
    var k = 0
    val p: Array[Array[Int]] = Array.ofDim[Int](C, C)

    for (i <- 0 to (C - 1)) {
      for (j <- 0 to (C - 1)) {
        if (i != j) {
          if (d(i)(j) > d(j)(i)) {
            p(i)(j) = d(i)(j)
          } else {
            p(i)(j) = 0
          }
        }
      }
    }

    for (i <- 0 to (C - 1)) {
      for (j <- 0 to (C - 1)) {
        if (i != j) {
          for (k <- 0 to (C - 1)) {
            if (i != k && j != k) {
              p(j)(k) = Math.max(p(j)(k), Math.min(p(j)(i), p(i)(k)))
            }
          }
        }
      }
    }
    // return as immutable
    p.map(_.toSeq).toSeq
  }

  def determineRanking(p: Seq[Seq[Int]]): Seq[Int] = {

    var i = 0
    var j = 0
    val C = p.length
    val r = Array.ofDim[Int](C)


    // find number of strongest Paths for each candidate
    for (i <- 0 to (C - 1)) {
      for (j <- 0 to (C - 1)) {
        Logger.debug("i:" + i + " j:" + j + " r:" + p(i)(j))
        if (i != j) {
          if (p(i)(j) > p(j)(i)) {
            r(i) += 1
            Logger.debug(r(i).toString)
          }
        }
      }
    }

    r.toSeq
  }

  def getSchulzeRanking(papers: Seq[Paper]): Seq[JsObject] = {

    // check if seq is empty
    if (papers.length < 1) {
      Seq()
    } else {

      // get all available candidates
      val candidates = getCandidates(papers)

      // create matrix with preferences
      val matrix: Seq[Seq[Int]] = createPreferenceMatrix(papers, candidates)

      // get ranking using the matrix
      val strongestPaths = determineStrongestPaths(matrix)

      val ranking = determineRanking(strongestPaths)

      val result = ranking.zip(candidates).map {
        case (r: Int, tag: String) => Json.obj("tag" -> tag, "numberOfStrongestLinks" -> r)
      }

      val sortedResult = result.sortWith((js1, js2) => {
        (js1 \ "numberOfStrongestLinks").as[Int] > (js2 \ "numberOfStrongestLinks").as[Int]
      })


      Logger.debug("MATRIX: " + matrix.toString())
      Logger.debug("CANDIDATES: " + candidates.toString)
      Logger.debug("PATHS: " + strongestPaths)
      //    Logger.debug("RESULT: " + result)
      Logger.debug("SORTED RESULT: " + sortedResult)

      sortedResult
    }
  }

  // parses a set of papers for all unique options
  def getCandidates(papers: Seq[Paper]): Seq[String] = {

    def getUniqueOptions(existingOptions: Seq[String], paper: Paper): Seq[String] = {
      paper.ranking.flatten.foldLeft(existingOptions)((options, option) =>
        if (options.contains(option)) {
          options
        }
        else {
          options :+ option
        }
      )
    }

    papers.foldLeft[Seq[String]](Seq())(getUniqueOptions)
  }


}
