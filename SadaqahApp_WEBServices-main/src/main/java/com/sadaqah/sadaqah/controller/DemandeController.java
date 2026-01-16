package com.sadaqah.sadaqah.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
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
	public ResponseEntity<?> save_annonce(@RequestParam("id_annonce") Long idAnnonce,@RequestParam("id_user") Long idUser ) {
		try {
			System.out.println("[DemandeController] Création demande: annonce=" + idAnnonce + ", user=" + idUser);
			boolean result = demandeService.save_annonce(idAnnonce, idUser);
			if (result) {
				Map<String, Object> response = new HashMap<>();
				response.put("success", true);
				response.put("message", "Demande créée avec succès");
				return ResponseEntity.ok(response);
			} else {
				Map<String, Object> response = new HashMap<>();
				response.put("success", false);
				response.put("message", "Échec de la création de la demande");
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
			}
		} catch (IllegalStateException e) {
			// Cooldown activé
			Map<String, Object> response = new HashMap<>();
			response.put("success", false);
			response.put("message", e.getMessage());
			return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(response);
		} catch (IllegalArgumentException e) {
			// L'utilisateur essaie de demander sa propre annonce
			System.err.println("[DemandeController] Erreur: " + e.getMessage());
			Map<String, Object> response = new HashMap<>();
			response.put("success", false);
			response.put("message", e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
		} catch (Exception e) {
			System.err.println("[DemandeController] Erreur lors de la création de la demande: " + e.getMessage());
			e.printStackTrace();
			Map<String, Object> response = new HashMap<>();
			response.put("success", false);
			response.put("message", "Erreur lors de la création de la demande: " + e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}
	
	@DeleteMapping("/demande/{id}")
	public void delete(@PathVariable("id") Long id) {
		demandeService.delete(id);		
	}
	
	// Assigner une quantité à une demande (par le donateur)
	// IMPORTANT: Seul le donateur de l'annonce peut assigner une quantité
	@PutMapping("/demande/{id}/assign")
	public ResponseEntity<?> assignerQuantite(
		@PathVariable("id") Long idDemande,
		@RequestParam("quantite") Long quantite,
		@RequestParam("donnateur_id") Long donnateurId) {
		try {
			System.out.println("[DemandeController] Assignation quantité: demande=" + idDemande + ", quantite=" + quantite + ", donnateur=" + donnateurId);
			boolean result = demandeService.assignerQuantite(idDemande, quantite, donnateurId);
			if (result) {
				Map<String, Object> response = new HashMap<>();
				response.put("success", true);
				response.put("message", "Quantité assignée avec succès");
				return ResponseEntity.ok(response);
			} else {
				Map<String, Object> response = new HashMap<>();
				response.put("success", false);
				response.put("message", "Échec de l'assignation de la quantité");
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
			}
		} catch (IllegalArgumentException e) {
			Map<String, Object> response = new HashMap<>();
			response.put("success", false);
			response.put("message", e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
		} catch (Exception e) {
			System.err.println("[DemandeController] Erreur lors de l'assignation: " + e.getMessage());
			e.printStackTrace();
			Map<String, Object> response = new HashMap<>();
			response.put("success", false);
			response.put("message", "Erreur lors de l'assignation: " + e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

}
