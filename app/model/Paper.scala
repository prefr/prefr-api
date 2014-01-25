package model

import play.api.libs.json._
import java.util.Date
import helper.IdHelper
import play.api.libs.functional.syntax._


/**
 * User: Björn Reimer
 * Date: 11/23/13
 * Time: 6:54 PM
 */
case class Paper(
                  id: String,
                  ranking: Seq[Seq[String]],
                  participant: Option[String],
                  created: Date
                  ) {
  def toJson: JsValue = {
    Json.toJson(this)
  }
}

object Paper {

  implicit val defaultFormat: Format[Paper] = Json.format[Paper]

  def inputReads = (
    ((__ \ 'id).read[String] or Reads.pure[String](IdHelper.generateBallotId())) and
      (__ \ 'ranking).read[Seq[Seq[String]]] and
      (__ \ 'participant).readNullable[String] and
      Reads.pure[Date](new Date)
    )(Paper.apply _)


  //  def inputReads = (
  //    (__ \ 'ranking).read[Seq[Seq[String]]] and
  //      (__ \ 'name).readNullable[String] and
  //      (__ \ 'email).readNullable[String]
  //    )(Paper.apply _)
  //
  //  def outputWrites = Writes[Paper] {
  //    b =>
  //      Json.obj("ranking" -> Json.toJson(b.ranking)) ++
  //        toJsonOrEmpty("name", b.name) ++
  //        toJsonOrEmpty("email", b.email)
  //  }
}
