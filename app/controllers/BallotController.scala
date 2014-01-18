package controllers

import play.api.mvc.{Action, Controller}
import play.modules.reactivemongo.MongoController
import play.api.libs.json.{Json, JsError}
import model.BallotBox

import scala.concurrent.ExecutionContext
import ExecutionContext.Implicits.global
/**
 * User: Björn Reimer
 * Date: 1/18/14
 * Time: 3:46 PM
 */
object BallotController extends Controller with MongoController {

  def createBallotBox = Action(parse.tolerantJson) {
    request => {

      request.body.validate[BallotBox](BallotBox.inputReads).map {
        ballotBox => BallotBox.col.insert(ballotBox)
          Ok(ballotBox.toJson)
      }.recoverTotal(e => BadRequest(JsError.toFlatJson(e)))
    }
  }

  def getBalloxBox(id: String) = Action.async {

    BallotBox.col.find(Json.obj("id" -> id)).one[BallotBox].map {
      case None => NotFound
      case Some(b) => Ok(b.toJson)

    }

  }

}
