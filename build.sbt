import play.PlayScala
import NativePackagerKeys._ // with auto plugins this won't be necessary soon

name := "prefr"

version := "0.1"

scalaVersion := "2.11.6"

resolvers += "Sonatype Snapshots" at "https://oss.sonatype.org/content/repositories/snapshots/"

resolvers += "Releases" at "http://repo.typesafe.com/typesafe/releases/"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

libraryDependencies ++= Seq(
  "org.reactivemongo" %% "play2-reactivemongo" % "0.10.5.0.akka23"
)


dockerBaseImage := "java:8-jre"

maintainer := "Prefr"

//packageName in Docker := "reimerei/prefr"

dockerRepository in Docker := Some("reimerei")

dockerExposedPorts in Docker := Seq(9000)
