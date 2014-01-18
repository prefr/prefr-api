package model

import play.api.libs.json.{JsValue, Format, Json}

/**
 * User: Björn Reimer
 * Date: 1/18/14
 * Time: 3:24 PM
 */
case class BallotOption(
                         tag: String,
                         title: String,
                         details: String
                         )  {
  def toJson: JsValue = Json.toJson(this)
}

object BallotOption {

  implicit val defaultFormat: Format[BallotOption] = Json.format[BallotOption]

}
