package com.sadaqah.sadaqah.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
	
	/**
	 * Connexion admin
	 * @param userName nom d'utilisateur ou email
	 * @param passWord mot de passe
	 * @return ID de l'admin si connexion réussie, 0 sinon
	 */
	@GetMapping("/admin/connect")
	public Long connect(@RequestParam("userName") String userName, @RequestParam("passWord") String passWord) {
		System.out.println("[AdminController] Appel /admin/connect avec:");
		System.out.println("  - userName: " + userName);
		System.out.println("  - passWord: " + (passWord != null ? "***" : "null"));
		Long result = adminService.connect(userName, passWord);
		System.out.println("[AdminController] Résultat: " + result);
		return result;
	}

	
}
