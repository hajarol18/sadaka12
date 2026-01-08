package com.sadaqah.sadaqah.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.DateFormat;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.json.JSONArray;
import org.locationtech.jts.geom.Point;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.sadaqah.sadaqah.model.Annonce;
import com.sadaqah.sadaqah.model.Category;
import com.sadaqah.sadaqah.model.Utilisateur;
import com.sadaqah.sadaqah.service.AnnonceService;
import com.sadaqah.sadaqah.service.CategoryService;

@CrossOrigin
@RestController
//@RequestMapping("/api/v1/")
public class AnnonceController {
	
	@Autowired
	private AnnonceService annonceService; 
	
	
	//upload Annonce image
	@PostMapping("/upload_annonce_image")
	  public boolean pictureupload(@RequestParam("id") long id
			  ,@RequestParam("file") MultipartFile file) {
	      return annonceService.pictureupload(id,file);
	  }
	
	
	//toutes annonces 
	@GetMapping("/annonces")
	public List<Annonce> findAll() {
		//annonceService.findAnnonce().get(i).getGeom().getY()
        return  annonceService.findAnnonce();
    }
	
	//annonce par id 
	@GetMapping("/annonce/{id}")
	public Optional<Annonce> findById(@PathVariable("id") Long id) {
	    return  annonceService.findAnnonceById(id);
	}
	
	
	//annonces par utilisateur  
	@GetMapping("/annonces/user/{id}")
	public List<Annonce> findAnnoncesParUser(@PathVariable("id") Long id) {
		return  annonceService.findAnnoncesParUser(id);
	}
		
	//annonces par commune 
	@GetMapping("/annonces/commune/{id}")
	public List<Annonce> findAnoncesWithinCommune(@PathVariable("id") Long id) {
        return  annonceService.findAnnonceWithinCommune(id);
    }
	
	//annonces par categorie
	@GetMapping("/annonces/categorie/{id}")
	public List<Annonce> findAnoncesWithinCategorie(@PathVariable("id") Long id) {
        return  annonceService.findAnnonceWithinCategorie(id);
    }
	
	
	
	//ajouter une nouvelle annonce
	@PostMapping ("/annonce")
	public Annonce addAnnonce(@RequestParam("coordinates") List<Double> coordinates,@RequestParam("titre") String titre,
			@RequestParam("desc") String desc, @RequestParam("categorie") Long categorie, @RequestParam("commune") Long commune,
			@RequestParam("donnateur") Long donnateur,@RequestParam("photo") String photo) {
        return annonceService.addAnnonce(coordinates,titre,desc, categorie, commune,donnateur,photo);
	
	}
	
	//modifier une annonce
	@PutMapping ("/annonce/update/{id}")
	public Annonce updateAnnonce(@PathVariable("id") Long id, @RequestParam("coordinates") List<Double> coordinates,@RequestParam("titre") String titre,
			@RequestParam("desc") String desc, @RequestParam("categorie") Long categorie, @RequestParam("commune") Long commune,
			@RequestParam("photo") String photo) {
	   return annonceService.updateAnnonce(id,coordinates,titre,desc, categorie, commune,photo);
	};
	
	//supprimer une annonce (status = annulee)
	@PutMapping("/annonce/delete/{id}")
	public void deleteAnnonce(@PathVariable("id") Long id) {
		annonceService.deleteAnnonce(id);
	};
	
	//approuver une annonce (status = approuvée)
	@PutMapping("/annonce/approve/{id}")
	public void approuverAnnonce(@PathVariable("id") Long id) {
		annonceService.approuverAnnonce(id);
	};
	
	//rejeter une annonce (status = rejetée)
	@PutMapping("/annonce/rejecte/{id}")
	public void rejeterAnnonce(@PathVariable("id") Long id) {
		annonceService.rejeterAnnonce(id);
	};
	
	//don attribuée 
	@PutMapping("/annonce/attribute/{id}")
	public void attributeAnnonce(@PathVariable("id") Long id) {
		annonceService.masquerAnnonce(id);
	};
	
	
	//*****************utilite !!!!!!!!***********//
	@GetMapping("/annonces/near")
	public List<Annonce> findAllHospitalsByDistanceFromUser(@RequestParam("userlocation") List<Double> userLocation) {
        //this extraction can also be implemented in return method
        double userLongitude = userLocation.get(0);
        double userLatitude = userLocation.get(1);

        return annonceService.findAnnoncesNearUser(userLongitude, userLatitude);
    }
	
	
}
