package com.sadaqah.sadaqah.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sadaqah.sadaqah.model.Categorie_Famille;
import com.sadaqah.sadaqah.repo.IFamilleRepo;


@Service
public class FamilleService {
	@Autowired
	private IFamilleRepo familleRepo; 
	

    public Iterable<Categorie_Famille> getFamilles() {
        return familleRepo.findAll();
    }

    public void deleteFamille(final Long id) {
    	familleRepo.deleteById(id);
    }
 
    public Categorie_Famille saveFamille(Categorie_Famille config) {
    	Categorie_Famille savedConfig = familleRepo.save(config);
		return savedConfig;
    }

}
