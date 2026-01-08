package com.sadaqah.sadaqah.controller;

import java.util.List;

import javax.persistence.Table;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sadaqah.sadaqah.service.UtilisateurService;

import com.sadaqah.sadaqah.model.Utilisateur;

@RestController
@CrossOrigin
@RequestMapping("api/v1/")
public class UtilisateurController {
	
	@Autowired
	private UtilisateurService utilisateurSrvice;
	
	@GetMapping("/utilisateurs")
	public List<Utilisateur> getUtilisateurs(){
		return utilisateurSrvice.getUtilisateurs();
		
	}
	
	@PostMapping("/utilisateur")
	public boolean addUtilisateur(@RequestBody Utilisateur utilisateur) {
		return utilisateurSrvice.addUtilisateur(utilisateur);
	}
	
	@GetMapping("/utilisateur/connect")
	public Long connect(@RequestParam("userName") String userName,@RequestParam("passWord") String passWord) {
		return utilisateurSrvice.connect(userName, passWord);
	}
		
	}


