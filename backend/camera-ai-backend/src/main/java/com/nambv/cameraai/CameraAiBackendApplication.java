package com.nambv.cameraai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CameraAiBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(CameraAiBackendApplication.class, args);
	}
}