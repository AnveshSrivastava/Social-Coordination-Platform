# Multi-stage build for optimized image size
# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn
COPY pom.xml .

# Copy source code
COPY src src

# Build the application
RUN ./mvnw clean package -DskipTests -q

# Stage 2: Runtime (lightweight base image)
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Copy the built JAR from builder stage
COPY --from=builder /app/target/social-coordination-platform-*.jar app.jar

# Expose port (default for development)
EXPOSE 8080

# Set environment variable for Render compatibility
ENV PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD java -cp app.jar org.springframework.boot.loader.JarLauncher || exit 1

# Run the application with PORT env variable support
ENTRYPOINT ["java", "-jar", "app.jar", "--server.port=${PORT}"]
