package model


import java.util.Date
import helper.IdHelper
import play.api.libs.functional.syntax._
import play.api.libs.json._
import play.modules.reactivemongo.json.collection.JSONCollection
import play.modules.reactivemongo.ReactiveMongoPlugin
import play.api.Play.current

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
                      result: Option[Seq[String]],
                      createDate: Date
                      ) {
  def toJson: JsValue = {
    Json.toJson(this)(BallotBox.outputWrites)
  }
}

object BallotBox {

  def col: JSONCollection = ReactiveMongoPlugin.db.collection[JSONCollection]("ballotBoxes")

  implicit val defaultFormat: Format[BallotBox] = Json.format[BallotBox]

  def inputReads = (
    Reads.pure[String](IdHelper.generateBallotId()) and
      (__ \ 'subject).readNullable[String] and
      (__ \ 'options).readNullable[Seq[BallotOption]] and
      (__ \ 'papers).readNullable[Seq[Paper]] and
      Reads.pure[Option[Seq[String]]](Some(Seq("A","B","C"))) and
      Reads.pure[Date](new Date)
    )(BallotBox.apply _)

  def outputWrites = Writes[BallotBox] {
    b =>
      Json.obj("id" -> b.id) ++
        Json.obj("subject" -> JsString(b.subject.getOrElse(""))) ++
        Json.obj("options" -> b.options.getOrElse(Seq()).map {_.toJson}) ++
        Json.obj("papers" -> b.papers.getOrElse(Seq()).map {_.toJson}) ++
        Json.obj("result" -> b.result) ++
        Json.obj("createDate" -> b.createDate)
  }

}

