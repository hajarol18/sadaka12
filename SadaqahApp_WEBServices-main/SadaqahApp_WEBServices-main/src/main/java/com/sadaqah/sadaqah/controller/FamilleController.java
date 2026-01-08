package com.sadaqah.sadaqah.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sadaqah.sadaqah.model.Categorie_Famille;
import com.sadaqah.sadaqah.service.FamilleService;

@CrossOrigin
@RestController
@RequestMapping("/api/v1/")

public class FamilleController {
	@Autowired
	private FamilleService familleService; 
	
	//Retourner les familles de categories 
	@GetMapping(value="/fcategories")
	public Iterable<Categorie_Famille> getFamilles() {
        return familleService.getFamilles();
	}
	
	//Gestion des categories
	//ajouter une famille 
	@PostMapping(value="/fcategorie")
	public Categorie_Famille createFamille(@RequestBody Categorie_Famille famille) {
		return familleService.saveFamille(famille);
	}
	
	//supprimer une famille de categories
	@DeleteMapping("/fcategorie/{id}")
	public void deleteFamille(@PathVariable("id") final Long id) {
		familleService.deleteFamille(id);
	}
	

}
