FROM ubuntu:trusty

# update and install java
RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install -y --no-install-recommends openjdk-7-jdk

ADD ./target/universal/stage /opt/app

EXPOSE 9000

WORKDIR /opt/app/

ENTRYPOINT ["bin/prefr","-Dconfig.file=/opt/app/conf/docker.conf","-mem","128"]
