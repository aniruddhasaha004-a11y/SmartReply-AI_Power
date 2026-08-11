# Build Stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Run Stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/target/smartreply-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080

# Environment defaults
ENV MONGODB_URI=mongodb://mongodb:27017/smartreply
ENV GEMINI_API_KEY=""
ENV JWT_SECRET=dGhpcy1pcy1hLXZlcnktc2VjdXJlLWFuZC1sb25nLXNlY3JldC1rZXktZm9yLXNtYXJ0cmVwbHktYXBwbGljYXRpb24td2hpY2gtaXMtdXNlZC1mb3Itand0LXNpZ25pbmc=
ENV FRONTEND_URL=http://localhost:5173

ENTRYPOINT ["java", "-jar", "app.jar"]
