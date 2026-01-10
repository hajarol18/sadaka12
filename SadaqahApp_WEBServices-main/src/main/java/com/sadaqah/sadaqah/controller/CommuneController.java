package com.sadaqah.sadaqah.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sadaqah.sadaqah.model.Commune;

import com.sadaqah.sadaqah.service.CommuneService;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/v1")
public class CommuneController {

    @Autowired
    private CommuneService communeService; // Orthographe corrigée

    @GetMapping("/communes")
    public List<Commune> getCommunes() {
        try {
        	System.out.println("[CommuneController] /communes appelé");
        	List<Commune> result = communeService.getCommunes();
        	System.out.println("[CommuneController] /communes: " + (result != null ? result.size() : "null") + " communes");
        	if (result == null) {
        		System.err.println("[CommuneController] ERREUR: result est null!");
        		return new java.util.ArrayList<Commune>();
        	}
        	return result;
        } catch (Exception e) {
        	System.err.println("[CommuneController] ERREUR dans /communes: " + e.getMessage());
        	System.err.println("[CommuneController] Type d'erreur: " + e.getClass().getName());
        	e.printStackTrace();
        	// Retourner une liste vide au lieu de lancer l'exception pour éviter 500
        	return new java.util.ArrayList<Commune>();
        }
    }
}