Prefr
==============

Voting tool that uses the Schulze Method.

It is hosted on [prefr.org](http://prefr.org)

Build using [Play Framework](http://playframework.com), [mongoDB](http://mongodb.org) and [AngluarJS](http://angularjs.org)

Deploy
-----------

Dependencies:

* openjdk-7 (should work with 6 as well)
* mongodb that listens on localhost:27017 (can be adjusted in application.conf)

Running './sbt start' in the root folder will download all dependencies, build the code and start a Webserver that listens on port 9000.


