package controllers

import play.api.mvc.{ Action, Controller }
import play.modules.reactivemongo.MongoController
import play.api.libs.json.{ Json, JsError }
import model._

import scala.concurrent.{ Future, ExecutionContext }
import ExecutionContext.Implicits.global
import play.api.Logger

/**
 * User: Björn Reimer
 * Date: 1/18/14
 * Time: 3:46 PM
 */
object BallotController extends Controller with MongoController {

  def createBallotBox = Action(parse.tolerantJson(512 * 1024)) {
    request =>
      {
        request.body.validate[BallotBox](BallotBox.inputReads).map {
          ballotBox =>
            {
              BallotBox.col.insert(ballotBox)
              Logger.debug("Created Ballot: " + ballotBox.toJson)
              Ok(ballotBox.toJson ++ Json.obj("adminSecret" -> ballotBox.adminSecret))
            }
        }.recoverTotal(e => BadRequest(JsError.toFlatJson(e)))
      }
  }

  def getBalloxBox(id: String) = Action.async {
    Logger.debug("Get Ballot: " + id)
    BallotBox.col.find(Json.obj("id" -> id)).one[BallotBox].map {
      case None    => NotFound
      case Some(b) => Ok(b.toJson)
    }
  }

  def addPaper(id: String) = Action.async(parse.tolerantJson) {
    request =>
      request.body.validate[Paper](Paper.inputReads).map {
        paper =>
          BallotBox.col.find(Json.obj("id" -> id)).one[BallotBox].flatMap {
            case None => Future(NotFound("ballot box"))
            case Some(ballotBox) =>
              // check if vote is valid
              checkRanking(ballotBox.options.getOrElse(Seq()), paper.ranking) match {
                case false => Future(BadRequest("Invalid options"))
                case true =>
                  // Add paper to ballot
                  val query = Json.obj("id" -> id)
                  val set = Json.obj("$push" -> Json.obj("papers" -> paper))
                  BallotBox.col.update(query, set).map {
                    lastError =>
                      if (lastError.updatedExisting) {
                        Ok(paper.toJson)
                      } else {
                        NotFound("ballot not found")
                      }
                  }
              }
          }
      }.recoverTotal(e => Future(BadRequest(JsError.toFlatJson(e))))
  }

  def modifyBallotBox(id: String) = Action.async(parse.tolerantJson) {
    request =>
      BallotBox.col.find(Json.obj("id" -> id)).one[BallotBox].map {
        case None => NotFound("ballot not found")
        case Some(bb) =>
          request.body.validate[BallotBoxUpdate].map {
            update =>
              // check secret
              update.adminSecret.equals(bb.adminSecret) match {
                case false => Unauthorized("wrong admin secret")
                case true =>
                  if (update.options.isEmpty && update.subject.isEmpty) {
                    Ok("nothing to update")
                  } else {
                    bb.update(update).map {
                      le =>
                        Logger.debug("Modfied Ballot: " + update)
                    }
                    Ok("updated")
                  }
              }
          }.recoverTotal(e => BadRequest(JsError.toFlatJson(e)))
      }
  }

  def getResult(id: String) = Action.async {
    request =>
      BallotBox.col.find(Json.obj("id" -> id)).one[BallotBox].flatMap {
        case None => Future(NotFound("ballot not found"))
        case Some(bb) => bb.calculateResult.map {
          case None => InternalServerError("something went wrong :(")
          case Some(resultBB) =>
            Logger.debug("Ballot result: " + resultBB)
            Ok(resultBB.toResultJson)
        }
      }
  }

  def modifyPaper(id: String, paperId: String) = Action.async(parse.tolerantJson) {
    request =>
      request.body.validate[PaperUpdate](PaperUpdate.format).map {
        paperUpdate =>
          {
            BallotBox.col.find(Json.obj("id" -> id)).one[BallotBox].flatMap {
              case None => Future(NotFound("ballot box id"))
              case Some(ballotBox) =>
                ballotBox.papers.getOrElse(Seq()).find(_.id.equals(paperId)) match {
                  case None => Future(NotFound("invalid paper id"))
                  case Some(paper) =>
                    paperUpdate.ranking.isEmpty || checkRanking(ballotBox.options.getOrElse(Seq()), paperUpdate.ranking.get) match {
                      case false => Future(BadRequest("bad ranking"))
                      case true =>
                        ballotBox.updatePaper(paperId, paperUpdate).map {
                          case false => BadRequest("bad update")
                          case true => Ok("updated")
                        }
                    }
                }
            }
          }
      }.recoverTotal(e => Future(BadRequest(JsError.toFlatJson(e))))
  }


  def checkRanking(ballotOptions : Seq[BallotOption], ranking: Seq[Seq[String]]): Boolean = {
    Logger.info("Checking: " + ballotOptions + ":" + ranking)
    val unique = ranking.flatten.distinct.size == ranking.flatten.size
    val valid = ranking.flatten.forall(option => ballotOptions.exists(_.tag.equals(option)))
    valid && unique
  }

  def deletePaper(id: String, paperId: String) = Action.async{
    BallotBox.col.find(Json.obj("id" -> id)).one[BallotBox].flatMap {
      case None => Future(NotFound("ballot box id"))
      case Some(ballotBox) =>
        ballotBox.deletePaper(paperId).map {
          case false => BadRequest("could not delete")
          case true => Ok("deleted")
        }
    }
  }
}
