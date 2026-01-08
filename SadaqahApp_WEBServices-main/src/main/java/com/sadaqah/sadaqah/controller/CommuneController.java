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
        // Cette méthode doit exister dans votre CommuneService
        return communeService.getCommunes();
    }
}