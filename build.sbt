name := "schulze-ballot"

version := "0.1"

libraryDependencies ++= Seq(
  jdbc,
  anorm,
  cache,
          "org.reactivemongo" %% "play2-reactivemongo" % "0.10.2"
)     

play.Project.playScalaSettings
