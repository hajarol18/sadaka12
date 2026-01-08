package com.sadaqah.sadaqah.repo;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sadaqah.sadaqah.model.Category;


@Repository
public interface ICategoryRepo extends JpaRepository <Category,Long>{
	
	@Query("SELECT c.id, c.nom, c.famille FROM Category c "+"WHERE c.famille=:famille")
	List<Object> categoriesWithinFamille(@Param("famille") Long famille);

}
