package helper

/**
 * User: Björn Reimer
 * Date: 5/22/13
 * Time: 3:08 PM
 */
object IdHelper {

  // Random generator
  val random = new scala.util.Random
  def randomString(n: Int): String = {
    def alphabet: String = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    Stream.continually(random.nextInt(alphabet.size)).map(alphabet).take(n).mkString
  }

  def generateBallotId(): String = {
    randomString(20)
  }

  def generateAdminSecret(): String = {
    randomString(20)
  }
}
