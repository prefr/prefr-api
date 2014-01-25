package controllers

import play.api.mvc.{Action, Controller}
import play.modules.reactivemongo.MongoController
import play.api.libs.json.{Json, JsError}
import model.{Paper, BallotBox}

import scala.concurrent.{Future, ExecutionContext}
import ExecutionContext.Implicits.global
import helper.Schulze
import java.util.Date

/**
 * User: Björn Reimer
 * Date: 1/18/14
 * Time: 3:46 PM
 */
object BallotController extends Controller with MongoController {

  def createBallotBox = Action(parse.tolerantJson) {
    request => {

      request.body.validate[BallotBox](BallotBox.inputReads).map {
        ballotBox => {

          val ranking = Schulze.getSchulzeRanking(ballotBox.papers.getOrElse(Seq()))
          val ballotBoxWithResult = ballotBox.copy(result = ranking, lastResultCalculation = new Date)

          BallotBox.col.insert(ballotBoxWithResult)

          Ok(ballotBoxWithResult.toJson)
        }
      }.recoverTotal(e => BadRequest(JsError.toFlatJson(e)))
    }
  }

  def getBalloxBox(id: String) = Action.async {

    BallotBox.col.find(Json.obj("id" -> id)).one[BallotBox].map {
      case None => NotFound
      case Some(b) => Ok(b.toJson)

    }

  }

  def addVote(id: String) = Action.async(parse.tolerantJson) {

    request =>
      request.body.validate[Paper].map {
        paper => {
          // Add paper to ballot
          val query = Json.obj("id" -> id)
          val set = Json.obj("$push" -> Json.obj("papers" -> paper))

          BallotBox.col.update(query, set).map {
            lastError => if (lastError.updatedExisting) {

              // update result
              BallotBox.col.find(query).one[BallotBox].map {
                case None => NotFound
                case Some(ballotBox) => {
                  val result = Schulze.getSchulzeRanking(ballotBox.papers.getOrElse(Seq()))
                  val set2 = Json.obj("$set" -> Json.obj("result" -> result, "lastResultCalculation" -> new Date))
                  BallotBox.col.update(query, set2)
                }
              }
              Ok
            } else {
              NotFound
            }
          }
        }
      }.recoverTotal(e => Future(BadRequest(JsError.toFlatJson(e))))

  }


}
