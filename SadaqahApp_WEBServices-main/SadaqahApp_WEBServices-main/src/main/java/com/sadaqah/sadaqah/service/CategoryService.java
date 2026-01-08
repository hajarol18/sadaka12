package com.sadaqah.sadaqah.service;

import java.util.List;
import java.util.Optional;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sadaqah.sadaqah.model.Category;
import com.sadaqah.sadaqah.repo.ICategoryRepo;


@Service
public class CategoryService {
	
	@Autowired
	private ICategoryRepo categoryRepo; 
	

    public Iterable<Category> getCategories() {
        return categoryRepo.findAll();
    }
    
    //retourner les annonces appartanannt a une famille
    public List<Object> getCategorisParFamille(Long id){
    	return categoryRepo.categoriesWithinFamille(id);
    }

    public void deleteCategory(final Long id) {
    	categoryRepo.deleteById(id);
    }
 
    public Category saveCategory(Category config) {
        Category savedConfig = categoryRepo.save(config);
		return savedConfig;
    }
    
    
}
