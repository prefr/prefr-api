package model

import java.util.Date
import helper.{ Schulze, IdHelper }
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
    result: Seq[Seq[String]],
    adminSecret: String,
    lastResultCalculation: Date,
    createDate: Date) {
  def toJson: JsObject = {
    Json.toJson(this)(BallotBox.outputWrites).as[JsObject]
  }

  def toResultJson: JsObject = {
    Json.toJson(this)(BallotBox.resultWrites).as[JsObject]
  }

  def update(update: BallotBoxUpdate): Future[LastError] = {

    val subjectJson = if (update.subject.isDefined) {
      Json.obj("subject" -> update.subject.get)
    }
    else {
      Json.obj()
    }

    val optionsJson = if (update.options.isDefined) {
      Json.obj("options" -> update.options.get)
    }
    else {
      Json.obj()
    }

    val query = Json.obj("id" -> this.id)
    val set = Json.obj("$set" -> (subjectJson ++ optionsJson))

    BallotBox.col.update(query, set)
  }

  def calculateResult: Future[Option[BallotBox]] = {
    val query = Json.obj("id" -> id)
    val result = Schulze.getSchulzeRanking(this.papers.getOrElse(Seq()))
    val set2 = Json.obj("$set" -> Json.obj("result" -> result, "lastResultCalculation" -> new Date))
    BallotBox.col.update(query, set2).flatMap {
      lastError =>
        if (lastError.updatedExisting) {
          BallotBox.col.find(query).one[BallotBox]
        }
        else {
          Future(None)
        }
    }
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
    Reads.pure[Seq[Seq[String]]](Seq()) and
    Reads.pure[String](IdHelper.generateAdminSecret()) and
    Reads.pure[Date](new Date) and
    Reads.pure[Date](new Date)
  )(BallotBox.apply _)

  def outputWrites = Writes[BallotBox] {
    b =>
      Json.obj("id" -> b.id) ++
        Json.obj("subject" -> JsString(b.subject.getOrElse(""))) ++
        Json.obj("options" -> b.options.getOrElse(Seq()).map {
          _.toJson
        }) ++
        Json.obj("papers" -> b.papers.getOrElse(Seq()).map {
          _.toJson
        }) ++
        Json.obj("createDate" -> b.createDate)
  }

  def resultWrites = Writes[BallotBox] {
    b =>
      Json.obj("id" -> b.id) ++
        Json.obj("result" -> b.result) ++
        Json.obj("lastResultCalculation" -> b.lastResultCalculation)
  }

}

case class BallotBoxUpdate(adminSecret: String,
                           subject: Option[String],
                           options: Option[Seq[BallotOption]])

object BallotBoxUpdate {
  implicit val format = Json.format[BallotBoxUpdate]
}

