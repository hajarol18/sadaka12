package com.sadaqah.sadaqah.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;




import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sadaqah.sadaqah.model.Category;
import com.sadaqah.sadaqah.service.CategoryService;



@CrossOrigin
@RestController
@RequestMapping("/api/v1/")
public class CategoryController {
	
	@Autowired
	private CategoryService categoryService; 
	
	//retourne la liste de toutes les categories
	@GetMapping("/categories")
	public Iterable<Category> getCategories() {
		try {
			System.out.println("[CategoryController] /categories appelé");
			Iterable<Category> result = categoryService.getCategories();
			System.out.println("[CategoryController] /categories: résultat obtenu");
			if (result == null) {
				System.err.println("[CategoryController] ERREUR: result est null!");
				return new ArrayList<Category>();
			}
			return result;
		} catch (Exception e) {
			System.err.println("[CategoryController] ERREUR dans /categories: " + e.getMessage());
			System.err.println("[CategoryController] Type d'erreur: " + e.getClass().getName());
			e.printStackTrace();
			// Retourner une liste vide au lieu de lancer l'exception pour éviter 500
			return new ArrayList<Category>();
		}
	}
	//retourne la liste de toutes les categories d'une famille 
	@GetMapping("/categories/{famille}")
	public List<Object> getCategoriesParFamille(@PathVariable("famille") final Long famille) {
	    return categoryService.getCategorisParFamille(famille);
	}
	
	
	//Gestion des categories 
	@PostMapping("/categorie")
	public Category createCategory(@RequestBody Category category) {
		return categoryService.saveCategory(category);
	}
	
	
	@DeleteMapping("/categorie/{id}")
	public void deleteClient(@PathVariable("id") final Long id) {
		categoryService.deleteCategory(id);
	}

}
