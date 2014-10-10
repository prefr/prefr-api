package model

import java.util.Date
import helper.{ Schulze, IdHelper }
import play.api.Logger
import play.api.libs.functional.syntax._
import play.api.libs.json._
import play.modules.reactivemongo.json.collection.JSONCollection
import play.modules.reactivemongo.ReactiveMongoPlugin
import play.api.Play.current
import scala.concurrent.{ ExecutionContext, Future }
import reactivemongo.core.commands.LastError
import ExecutionContext.Implicits.global

/**
 * User: Björn Reimer
 * Date: 11/23/13
 * Time: 6:51 PM
 */
case class BallotBox(
    id: String,
    subject: Option[String],
    options: Option[Seq[BallotOption]],
    papers: Option[Seq[Paper]],
    details: Option[String],
    locked: Option[Date],
    adminSecret: String,
    createDate: Date) {

  def toJson: JsObject = {
    Json.toJson(this)(BallotBox.outputWrites).as[JsObject]
  }

  def toJsonWithResult: JsObject = {
    val result = Schulze.getSchulzeRanking(this.papers.getOrElse(Seq()))
    this.toJson ++ Json.obj("result" -> result)
  }

  def update(update: BallotBoxUpdate): Future[LastError] = {

    val subjectJson = if (update.subject.isDefined) {
      Json.obj("subject" -> update.subject.get)
    } else {
      Json.obj()
    }

    val detailsJson = if (update.details.isDefined) {
      Json.obj("details" -> update.details.get)
    } else {
      Json.obj()
    }

    val optionsJson = if (update.options.isDefined) {
      Json.obj("options" -> update.options.get)
    } else {
      Json.obj()
    }

    val query = Json.obj("id" -> this.id)
    val set = Json.obj("$set" -> (subjectJson ++ optionsJson ++ detailsJson))

    Logger.debug("SET: " + set)

    BallotBox.col.update(query, set)
  }

  def lock(): Future[LastError] = {
    val query = Json.obj("id" -> this.id)
    val set = Json.obj("$set" -> Json.obj("locked" -> new Date))
    BallotBox.col.update(query, set)
  }

  def updatePaper(paperId: String, update: PaperUpdate): Future[Boolean] = {
    if (update.ranking.isDefined || update.participant.isDefined) {
      val query = Json.obj("id" -> this.id, "papers.id" -> paperId)

      val setRanking = update.ranking match {
        case None          => Json.obj()
        case Some(ranking) => Json.obj("papers.$.ranking" -> ranking)
      }
      val setParticipant = update.participant match {
        case None       => Json.obj()
        case Some(part) => Json.obj("papers.$.participant" -> part)
      }
      val set = Json.obj("$set" -> (setRanking ++ setParticipant))
      BallotBox.col.update(query, set).map(_.updatedExisting)
    } else {
      Future(true)
    }
  }

  def deletePaper(paperId: String): Future[Boolean] = {
    val query = Json.obj("id" -> this.id)
    val set = Json.obj("$pull" -> Json.obj("papers" -> Json.obj("id" -> paperId)))
    BallotBox.col.update(query, set).map(_.updatedExisting)
  }
}

object BallotBox {

  def col: JSONCollection = ReactiveMongoPlugin.db.collection[JSONCollection]("ballotBoxes")

  implicit val defaultFormat: Format[BallotBox] = Json.format[BallotBox]

  def inputReads = (
    Reads.pure[String](IdHelper.generateBallotId()) and
    (__ \ 'subject).readNullable[String] and
    (__ \ 'options).readNullable[Seq[BallotOption]] and
    (__ \ 'papers).readNullable[Seq[Paper]](Reads.seq(Paper.inputReads)) and
    (__ \ 'details).readNullable[String] and
    Reads.pure[Option[Date]](None) and
    Reads.pure[String](IdHelper.generateAdminSecret()) and
    Reads.pure[Date](new Date)
  )(BallotBox.apply _)

  def outputWrites = Writes[BallotBox] {
    b =>
      Json.obj("id" -> b.id) ++
        Json.obj("subject" -> JsString(b.subject.getOrElse(""))) ++
        Json.obj("details" -> JsString(b.details.getOrElse(""))) ++
        Json.obj("options" -> b.options.getOrElse(Seq()).map(_.toJson)) ++
        Json.obj("papers" -> b.papers.getOrElse(Seq()).map(_.toJson)) ++
        Json.obj("createDate" -> b.createDate) ++
        b.locked.map(l => Json.obj("locked" -> l)).getOrElse(Json.obj())
  }
}

case class BallotBoxUpdate(adminSecret: String,
                           subject: Option[String],
                           details: Option[String],
                           options: Option[Seq[BallotOption]])

object BallotBoxUpdate {
  implicit val format = Json.format[BallotBoxUpdate]
}

