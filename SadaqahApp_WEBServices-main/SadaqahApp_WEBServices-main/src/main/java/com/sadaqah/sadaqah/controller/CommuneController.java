package com.sadaqah.sadaqah.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sadaqah.sadaqah.model.Annonce;
import com.sadaqah.sadaqah.model.Commune;
import com.sadaqah.sadaqah.service.CommuneSrvice;

@CrossOrigin
@RestController
@RequestMapping("/api/v1/")
public class CommuneController {
	
	@Autowired
	private CommuneSrvice communeService;
	
	@GetMapping("/communes")
	public List<Commune> getCommunes() {
        return communeService.getCommunes();
	}
	

}
