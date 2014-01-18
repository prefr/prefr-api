package controllers

import play.api.mvc.{Action, Controller}
import play.api.libs.json.{Json, JsError, JsValue}
import model.BallotBox
import helper.Schulze

/**
 * User: Björn Reimer
 * Date: 11/23/13
 * Time: 8:24 PM
 */

object directSchulze extends Controller {

//  def direct() = Action(parse.tolerantJson) {
//
//    request =>
//      val jsBody: JsValue = request.body
//
//      jsBody.validate[BallotBox].fold (
//            invalid = {e => BadRequest(JsError.toFlatJson(e))},
//            valid = b => {
//              val ranking = Schulze.getRanking(b.ballots.toList)
//
//              Ok(Json.toJson(b))
//            }
//      )
//  }
}
