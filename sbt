java -Xms512M -Xmx1024M -Xss1M -XX:+CMSClassUnloadingEnabled -XX:MaxPermSize=384M -jar `dirname $0`/tools/sbt-launch.jar "$@"
