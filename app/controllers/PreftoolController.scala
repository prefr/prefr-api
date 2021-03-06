package controllers

import play.api.mvc.{ Controller, Action }
import model.{ Paper, BallotBox }
import play.api.libs.json.Json
import helper.{ IdHelper, Schulze }
import scala.concurrent.{ Future, ExecutionContext }
import ExecutionContext.Implicits.global
import java.util.Date
import play.api.Logger

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
        val result = Schulze.getSchulzeRanking(b.papers.getOrElse(Seq()))
        val prefResult: Seq[String] = result.zipWithIndex.map {
          case (e, i) => e.mkString((i + 1) + ". ", "\n" + (i + 1) + ". ", "")
        }
        Ok(prefResult.mkString("\n"))
    }
  }

  def importPapers() = Action(parse.tolerantText) {
    request =>

      val sanitised = request.body
        .replace(" ", "")
        .replace("///", ";")
        .replace("//", ";")
        .replace("/", ";")
        .replace(";;", ";")
        .replace(",,", ",")
        .replace("\n;", "\n")
        .replace(";\n", "\n")

      val papers = sanitised.split("\n").map {
        ranking =>

          val js = "[[\"" +
            ranking
            .replace(",", "\",\"")
            .replace(";", "\"],[\"") + "\"]]"

          Logger.debug("ORG " + ranking)
          Logger.debug("JSON " + js)

          val jsObject = Json.obj("ranking" -> Json.parse(js))

          jsObject.asOpt[Paper](Paper.inputReads)
      }.toSeq

      if (papers.forall(_.isDefined)) {

        val p = papers.map {
          _.get
        }
        val res = Schulze.getSchulzeRanking(p)

        val bb = new BallotBox(
          IdHelper.generateBallotId(),
          None,
          None,
          Some(p),
          None,
          None,
          IdHelper.generateAdminSecret(),
          new Date()
        )
        BallotBox.col.insert(bb)
        Ok(bb.toJson)
      } else {
        BadRequest("Could not parse input")
      }
  }
}