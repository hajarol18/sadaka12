package com.sadaqah.sadaqah.controller;

import java.util.List;
import java.util.Optional;

import org.geolatte.geom.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.sadaqah.sadaqah.model.Annonce;
import com.sadaqah.sadaqah.model.Utilisateur;
import com.sadaqah.sadaqah.service.AnnonceService;
import com.sadaqah.sadaqah.service.UtilisateurService;

@CrossOrigin
@RestController
public class UtilisateurController {

	@Autowired
	private UtilisateurService utilisateurService;
	
	//upload User image
	@PostMapping("/upload_User_image")
	  public boolean pictureupload(@RequestParam("id") long id
			  ,@RequestParam("file") MultipartFile file) {
	      return utilisateurService.pictureuploadUser(id,file);
	  }
	
	
	@GetMapping("/log_in")
	public String findById(@RequestParam("email") String email,@RequestParam ("password") String password) {
	    return  utilisateurService.findUser(email,password);
	}
	
	



	@PostMapping ("/sign_up")
	public Boolean sign_up(@RequestParam("nom") String nom,
			@RequestParam("prenom") String prenom,
			@RequestParam("email") String email,
			@RequestParam("password") String password,
			@RequestParam("telephone") Long telephone, 
			@RequestParam("photo") String photo,
			@RequestParam("Longitude") Double Longitude,
			@RequestParam("Latitude") Double Latitude) {
        return utilisateurService.addUser(nom,prenom,email, password, telephone,photo,Longitude,Latitude);
	
	}


}

