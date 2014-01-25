package controllers

import play.api.mvc.{Controller, Action}
import model.BallotBox
import play.api.libs.json.Json
import helper.Schulze
import scala.concurrent.ExecutionContext
import ExecutionContext.Implicits.global

object PreftoolController extends Controller {
  def getCandidates(id: String) = Action.async {

    BallotBox.col.find(Json.obj("id" -> id)).one[BallotBox].map {
      case None => NotFound
      case Some(b) =>
        val candidates = Schulze.getCandidates(b.papers.getOrElse(Seq()))
        Ok(candidates.mkString("\n"))
    }

  }

  def getBallots(id: String) = Action.async {

    BallotBox.col.find(Json.obj("id" -> id)).one[BallotBox].map {
      case None => NotFound
      case Some(b) =>

        val ballots = b.papers.getOrElse(Seq()).map {
          paper => paper.ranking.map(r => r.mkString(",")).mkString(";")
        }
        Ok(ballots.mkString("\n"))
    }

  }

  def getResult(id: String) = Action.async {

    BallotBox.col.find(Json.obj("id" -> id)).one[BallotBox].map {
      case None => NotFound
      case Some(b) =>
        val result: Seq[String] = b.result.zipWithIndex.map {
          case (e, i) => e.mkString((i+1) + ". ", "\n" + (i+1) + ". ", "")
        }

        Ok(result.mkString("\n"))
    }

  }
}