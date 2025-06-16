FROM tomcat:9.0.106-jdk17-temurin-noble

ENV JAVA_OPTS="-Xmx4096m -Xms4096m"

COPY ./hti-iz-web/target/iztool.war /usr/local/tomcat/webapps/iztool.war
COPY ./dockerConfigs/webapp/context.xml /usr/local/tomcat/conf/context.xml
COPY ./dockerConfigs/webapp/server.xml /usr/local/tomcat/conf/server.xml

CMD ["catalina.sh", "run"]