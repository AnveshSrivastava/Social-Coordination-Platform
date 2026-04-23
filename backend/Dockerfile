# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /app

COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn
COPY pom.xml .
COPY src src

RUN ./mvnw clean package -DskipTests

# Stage 2: Runtime (lightweight base image)
FROM eclipse-temurin:17-jdk-jammy

WORKDIR /app

# Copy the built JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose port (default 8080, overridable via PORT env var)
EXPOSE 8080

# Required environment variables (set in deployment platform):
# - SPRING_MONGODB_URI: MongoDB connection string with credentials
# - APP_JWT_SECRET: JWT signing secret (minimum 32 characters)
# - PORT: Server port (default: 8080)

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD java -cp app.jar org.springframework.boot.loader.JarLauncher || exit 1

# Run application with environment variable support
ENTRYPOINT ["java", "-jar", "app.jar"]