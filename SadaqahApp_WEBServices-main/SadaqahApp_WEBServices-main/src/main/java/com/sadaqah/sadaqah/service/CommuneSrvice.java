package com.sadaqah.sadaqah.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sadaqah.sadaqah.model.Categorie_Famille;
import com.sadaqah.sadaqah.model.Category;
import com.sadaqah.sadaqah.model.Commune;
import com.sadaqah.sadaqah.repo.ICommune;

@Service
public class CommuneSrvice {
	@Autowired
	private ICommune communeRepo; 
	
	public List<Commune> getCommunes() {
        return communeRepo.getCommunes();
    }
	

}
