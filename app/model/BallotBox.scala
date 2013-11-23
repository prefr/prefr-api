package model

import _root_.helper.IdHelper
import play.api.libs.json._
import model.Ballot
import java.util.Date
import model.Ballot
import model.Ballot
import model.Ballot

import java.util.Date
import play.api.libs.json._
import helper.IdHelper
import play.api.libs.functional.syntax._
import scala.concurrent.{ExecutionContext, Future}
import play.api.Logger
import ExecutionContext.Implicits.global
import traits.Model


import play.api.libs.json._

/**
 * User: Björn Reimer
 * Date: 11/23/13
 * Time: 6:51 PM
 */
case class BallotBox(
                      id: String,
                      ballots: Seq[Ballot],
                      title: Option[String]
                      )

object BallotBox extends Model[BallotBox]{

  def inputReads = (
    Reads.pure[String](IdHelper.generateBallotId()) and
      (__ \ 'ballots).read[Seq[Ballot]] and
      (__ \ 'title).readNullable[String]
    )(BallotBox.apply _)

  def outputWrites = Writes[BallotBox] {
    b =>
      Json.obj("id" -> b.id) ++
        Json.obj("ballots" -> Json.toJson(b.ballots)) ++
        toJsonOrEmpty("title", b.title)
  }

}

