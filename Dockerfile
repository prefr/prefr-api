FROM ubuntu:latest

# update and install java
RUN echo "deb http://archive.ubuntu.com/ubuntu precise main universe" > /etc/apt/sources.list

RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install -y --no-install-recommends openjdk-7-jdk

ADD ./target/universal/stage /opt/app

EXPOSE 9000

WORKDIR /opt/app/

ENTRYPOINT ["bin/prefr"]

CMD ["-mem","128","-Dconfig.file=conf/docker.conf"]