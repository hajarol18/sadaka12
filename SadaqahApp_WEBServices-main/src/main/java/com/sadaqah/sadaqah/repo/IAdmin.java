package com.sadaqah.sadaqah.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sadaqah.sadaqah.model.Admin;

@Repository
public interface IAdmin extends JpaRepository<Admin, Long> {

}
