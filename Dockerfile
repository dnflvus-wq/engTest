# Build stage
FROM gradle:8.5-jdk21 AS build
WORKDIR /app
COPY build.gradle settings.gradle ./
COPY gradle ./gradle
COPY src ./src
RUN gradle build -x test --no-daemon

# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# 업로드 디렉토리 생성
RUN mkdir -p /app/uploads

# JAR 복사
COPY --from=build /app/build/libs/*.jar app.jar

# 포트 노출
EXPOSE 8080

# 환경 변수 기본값
ENV DB_HOST=db
ENV DB_PORT=3306
ENV DB_NAME=engtest
ENV DB_USER=engtest
ENV DB_PASSWORD=engtest123!

# 실행
ENTRYPOINT ["java", "-jar", "app.jar"]
