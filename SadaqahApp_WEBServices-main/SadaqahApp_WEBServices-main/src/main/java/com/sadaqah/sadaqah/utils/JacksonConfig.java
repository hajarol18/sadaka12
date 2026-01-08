package com.sadaqah.sadaqah.utils;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.n52.jackson.datatype.jts.JtsModule;

@Configuration
public class JacksonConfig {
	@Bean
	public JtsModule JtsModule() {
		return new JtsModule();
	}
}
