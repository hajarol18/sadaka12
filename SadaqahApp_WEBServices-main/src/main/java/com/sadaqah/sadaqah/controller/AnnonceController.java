package com.sadaqah.sadaqah.controller;

import java.text.DateFormat;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.json.JSONArray;
import org.locationtech.jts.geom.Point;
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
import com.sadaqah.sadaqah.utils.Annonce_Fcategorie;
import com.sadaqah.sadaqah.utils.Annonce_Perso;

@CrossOrigin
@RestController
@RequestMapping("/api/v1/")
public class AnnonceController {
	
	@Autowired
	private AnnonceService annonceService;
	
	// Endpoint de test pour vérifier que le backend fonctionne
	@GetMapping("/test")
	public Map<String, String> test() {
		Map<String, String> response = new HashMap<>();
		response.put("status", "OK");
		response.put("message", "Backend fonctionne!");
		response.put("timestamp", new Date().toString());
		return response;
	} 
	
	//toutes annonces approuvées 
	@GetMapping("/annonces")
	public List<Annonce> findAll() {
		try {
			System.out.println("[AnnonceController] /annonces appelé");
			List<Annonce> result = annonceService.findAnnonce();
			System.out.println("[AnnonceController] /annonces: " + (result != null ? result.size() : "null") + " annonces");
			return result;
		} catch (Exception e) {
			System.err.println("[AnnonceController] ERREUR dans /annonces: " + e.getMessage());
			e.printStackTrace();
			throw e; // Re-lancer pour que Spring retourne 500 avec détails
		}
    }
	
	//toutes annonces en cours de traitement  
		@GetMapping("/annonces/encours")
		public List<Annonce> findAnnonces_en_cours_traitement() {
			//annonceService.findAnnonce().get(i).getGeom().getY()
	        return  annonceService.findAnnonces_en_cours_traitement();
	    }
	
	//toutes annonces (tous statuts) - vue admin
	@GetMapping("/annonces/all")
	public List<Annonce> findAllAnnonces() {
		return annonceService.findAllAnnonces();
	}
	
	//toutes annonces for filter
	@GetMapping("/annonces_perso")
	public List<Annonce_Perso> findAnnoncesForFilter() {
		//annonceService.findAnnonce().get(i).getGeom().getY()
	    return  annonceService.findAnnoncesForFilter();
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
	
	//upload Annonce image
	@PostMapping("/upload_annonce_image")
	public boolean pictureupload(@RequestParam("id") long id, @RequestParam("file") MultipartFile file) {
		try {
			System.out.println("[AnnonceController] Upload image annonce ID: " + id);
			System.out.println("[AnnonceController] Nom fichier: " + (file != null ? file.getOriginalFilename() : "null"));
			if (file != null) {
				System.out.println("[AnnonceController] Taille: " + file.getSize());
			}
			boolean result = annonceService.pictureupload(id, file);
			System.out.println("[AnnonceController] Résultat upload: " + result);
			return result;
		} catch (Exception e) {
			System.err.println("[AnnonceController] ERREUR upload image: " + e.getMessage());
			e.printStackTrace();
			return false;
		}
	}
	
	//ajouter une nouvelle annonce
	@PostMapping ("/annonce")
	public int addAnnonce(@RequestParam("coordinates") List<Double> coordinates,@RequestParam("titre") String titre,
			@RequestParam("desc") String desc, @RequestParam("categorie") Long categorie, @RequestParam("commune") Long commune,
			@RequestParam("donnateur") Long donnateur,@RequestParam("photo") String photo) {
         annonceService.addAnnonce(coordinates,titre,desc, categorie, commune,donnateur,photo);
         return 1;
	
	}
	
	//modifier une annonce
	@PutMapping ("/annonce/update/{id}")
	public int updateAnnonce(@PathVariable("id") Long id, @RequestParam("coordinates") List<Double> coordinates,@RequestParam("titre") String titre,
			@RequestParam("desc") String desc, @RequestParam("categorie") Long categorie, @RequestParam("commune") Long commune,
			@RequestParam("photo") String photo) {
	   annonceService.updateAnnonce(id,coordinates,titre,desc, categorie, commune,photo);
	   return 1; 
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
	
	//annonces par date
	@GetMapping("annonce/date")
	public List annonces_par_date() {
		return annonceService.annonces_par_date();
	};
	
	//annonces par famille
		@GetMapping("annonce/famille")
		public List<Annonce_Fcategorie> annonces_par_famille() {
			return annonceService.annonce_par_famille();
		}
	
	
	//*****************utilite !!!!!!!!***********//
	@GetMapping("/annonces/near")
	public List<Annonce> findAllHospitalsByDistanceFromUser(@RequestParam("userlocation") List<Double> userLocation) {
        //this extraction can also be implemented in return method
        double userLongitude = userLocation.get(0);
        double userLatitude = userLocation.get(1);

        return annonceService.findAnnoncesNearUser(userLongitude, userLatitude);
    }
	
	
}
