package model

import play.api.libs.json._
import play.api.libs.functional.syntax._
import traits.Model

/**
 * User: Björn Reimer
 * Date: 11/23/13
 * Time: 6:54 PM
 */
case class Ballot(
                   ranking: Seq[String],
                   name: Option[String],
                   email: Option[String]
                   )

object Ballot extends Model[Ballot] {

  def inputReads = (
    (__ \ 'ranking).read[Seq[String]] and
      (__ \ 'name).readNullable[String] and
      (__ \ 'email).readNullable[String]
    )(Ballot.apply _)

  def outputWrites = Writes[Ballot] {
    b =>
      Json.obj("ranking" -> Json.arr(b.ranking)) ++
        toJsonOrEmpty("name", b.name) ++
        toJsonOrEmpty("email", b.email)
  }
}
