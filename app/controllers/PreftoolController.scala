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

  def getBallots(id: String) = play.mvc.Results.TODO
}