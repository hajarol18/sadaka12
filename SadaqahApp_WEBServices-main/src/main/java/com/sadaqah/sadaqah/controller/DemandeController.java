package com.sadaqah.sadaqah.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sadaqah.sadaqah.model.Demande;
import com.sadaqah.sadaqah.service.DemandeService;


@CrossOrigin
@RestController
@RequestMapping("/api/v1/")

public class DemandeController {
	
	@Autowired
	private DemandeService demandeService; 
	
	
	@GetMapping("/demandes/user/{id}") 
	public List<Demande> demandesParUser(@PathVariable("id") Long id){ return
	demandeService.demandesParUser(id); };
	
	@GetMapping("/demandes/annonce/{id}") 
	public List<Demande> demandesParAnnonce(@PathVariable("id") Long id){ 
		return demandeService.demandesParAnnonce(id); };
	 
	
	@PostMapping("/demandea")
	public int save_annonce(@RequestParam("id_annonce") Long idAnnonce,@RequestParam("id_user") Long idUser ) {
		 demandeService.save_annonce(idAnnonce, idUser);
		return 1;
	}
	
	@DeleteMapping("/demande/{id}")
	public void delete(@PathVariable("id") Long id) {
		demandeService.delete(id);		
	}
	
	
	
	//probleme d'objet a passer
	
//	@PostMapping("/demande")
//	public Demande save(@RequestBody Demande demande) {
//		return demandeService.save(demande);
//	};

}
