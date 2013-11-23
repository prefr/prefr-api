package model

import play.api.libs.json._
import helper.IdHelper
import play.api.libs.functional.syntax._
import scala.concurrent.{ExecutionContext, Future}
import traits.Model

/**
 * User: Björn Reimer
 * Date: 11/23/13
 * Time: 6:54 PM
 */
case class Ballot(
                   ranking: List[String],
                   name: Option[String],
                   email: Option[String]
                   )

object Ballot extends {

  def inputReads = (
      (__ \ 'ballots).read[List[String]] and
        (__ \ 'name).readNullable[String] and
        (__ \ 'email).readNullable[String]
    )(Ballot.apply _)

//  def outputWrites: Writes[Ballot] =
}
