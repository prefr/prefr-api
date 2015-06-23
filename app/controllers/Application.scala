package controllers

import play.api.mvc._

object Application extends Controller {

  def assets(path: String, file: String, foo: String) =
    controllers.Assets.at(path, file)

  def index() = Action {
    request =>
      Ok(views.html.index())
  }

  def getOptions(foo: String) = Action {
    request =>
      Ok("")
  }

}