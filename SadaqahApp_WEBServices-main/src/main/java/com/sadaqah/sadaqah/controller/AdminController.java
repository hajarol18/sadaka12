package com.sadaqah.sadaqah.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sadaqah.sadaqah.service.AdminService;
import com.sadaqah.sadaqah.model.Admin;

@CrossOrigin
@RestController
@RequestMapping("/api/v1/")
public class AdminController {
	
	
	@Autowired
	private AdminService adminService;
	
	@GetMapping("/admins")
	public List<Admin> getAdmins(){
		return adminService.getAdmins();
	}
	
	

	
}
