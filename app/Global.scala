/**
 * User: Björn Reimer
 * Date: 5/25/13
 * Time: 4:27 PM
 */

import play.api.Play
import play.api.mvc.{EssentialAction, WithFilters, EssentialFilter}

import scala.concurrent.ExecutionContext.Implicits.global
import play.api.http.HeaderNames._


object AccessControllFilter extends EssentialFilter {
  // wrap action to modify the headers of every request
  def apply(action: EssentialAction): EssentialAction = EssentialAction {
    request =>
      val accessControllEnabled = Play.configuration.getString("headers.accessControl.enable")
      accessControllEnabled match {
        case Some("true") =>
          action.apply(request).map(_.withHeaders(
            ACCESS_CONTROL_ALLOW_METHODS -> "GET, POST, DELETE, PUT, OPTIONS",
            ACCESS_CONTROL_ALLOW_ORIGIN -> "*")//,
//            ACCESS_CONTROL_ALLOW_HEADERS -> "Authorization, Content-type, X-File-Name, X-Max-Chunks, X-File-Size, X-File-Type, X-Index, X-TwoFactorToken")
          )
        case _ => action.apply(request)
      }
  }
}

object Global extends WithFilters(AccessControllFilter) {

  override def onStart(app: play.api.Application) = {
  }

  override def onStop(app: play.api.Application) = {
  }

}

