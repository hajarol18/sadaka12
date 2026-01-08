package com.sadaqah.sadaqah.repo;

import org.springframework.stereotype.Repository;

import com.sadaqah.sadaqah.model.Commune;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;


@Repository
public interface ICommune extends JpaRepository <Commune, Long> {
	@Query(value="SELECT * FROM Commune c", nativeQuery=true)
	List<Commune> getCommunes();

}
