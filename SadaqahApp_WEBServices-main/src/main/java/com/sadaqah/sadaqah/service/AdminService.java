package com.sadaqah.sadaqah.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sadaqah.sadaqah.model.Admin;
import com.sadaqah.sadaqah.repo.IAdmin;

@Service
public class AdminService {
	
	@Autowired
	private IAdmin adminRepo; 
	
	public List<Admin> getAdmins(){
		return adminRepo.findAll();
	}

}
