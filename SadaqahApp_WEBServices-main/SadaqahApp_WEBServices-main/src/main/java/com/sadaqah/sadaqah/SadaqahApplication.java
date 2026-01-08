package com.sadaqah.sadaqah;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.sadaqah.sadaqah.model.Category;
import com.sadaqah.sadaqah.repo.ICategoryRepo;



@SpringBootApplication

public class SadaqahApplication {
	 

	public static void main(String[] args) {
		SpringApplication.run(SadaqahApplication.class, args);
	}

	

}
