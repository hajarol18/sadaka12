package com.sadaqah.sadaqah.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

import com.sadaqah.sadaqah.model.Categorie_Famille;

@Repository
public interface IFamilleRepo extends JpaRepository <Categorie_Famille,Long>{

}
