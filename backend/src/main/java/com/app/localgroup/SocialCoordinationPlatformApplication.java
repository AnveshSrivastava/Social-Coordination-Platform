package com.app.localgroup;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SocialCoordinationPlatformApplication {

    public static void main(String[] args) {

        SpringApplication.run(SocialCoordinationPlatformApplication.class, args);
    }

}
