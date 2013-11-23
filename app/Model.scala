import play.api.libs.json._
import play.api.libs.json.Reads._
import java.text.SimpleDateFormat
//import org.mindrot.jbcrypt.BCrypt
import java.util.{TimeZone, Date}
//import play.modules.reactivemongo.json.collection.JSONCollection
import scala.concurrent.{ExecutionContext, Future}
import ExecutionContext.Implicits.global

/**
 * User: Björn Reimer
 * Date: 6/25/13
 * Time: 6:46 PM
 */
trait Model[A] {

//  implicit val collection: JSONCollection
//  implicit val mongoFormat: Format[A]

  def inputReads: Reads[A]

  def outputWrites: Writes[A]

  /**
   * Helper
   */

  def toJson(model: A): JsValue = {
    Json.toJson[A](model)(outputWrites)
  }

  def toJsonCustomWrites(model: A, writes: Writes[A]): JsValue = {
    Json.toJson[A](model)(writes)
  }

  def toJsonOrEmpty(key: String, value: Option[String]): JsObject = {
    value match {
      case Some(s) => Json.obj(key -> JsString(s))
      case None => Json.obj()
    }
  }

  def toJsonArrayOrEmpty(key: String, value: Option[Seq[String]]): JsObject = {
    value match {
      case Some(s) => Json.obj(key -> JsArray(s.map(JsString(_))))
      case None => Json.obj()
    }
  }

  val defaultDateFormat: SimpleDateFormat = new SimpleDateFormat("dd.MM.yyyy HH:mm:ss")
  defaultDateFormat.setTimeZone(TimeZone.getTimeZone("Europe/Berlin"))

  def addCreated(date: Date): JsObject = {
    Json.obj("created" -> defaultDateFormat.format(date))
  }

  def addLastUpdated(date: Date): JsObject = {
    Json.obj("lastUpdated" -> defaultDateFormat.format(date))
  }

//  val hashPassword: Reads[String] = Reads[String] {
//    js => js.asOpt[String] match {
//      case None => JsError("No password")
//      case Some(pass) => JsSuccess(BCrypt.hashpw(pass, BCrypt.gensalt()))
//    }
//  }
}
