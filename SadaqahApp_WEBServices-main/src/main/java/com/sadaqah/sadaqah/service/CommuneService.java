package com.sadaqah.sadaqah.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sadaqah.sadaqah.model.Commune;
import com.sadaqah.sadaqah.repo.ICommune;

@Service
public class CommuneService {
	@Autowired
	private ICommune communeRepo; 
	
	public List<Commune> getCommunes() {
        return communeRepo.getCommunes();
    }
	

}
