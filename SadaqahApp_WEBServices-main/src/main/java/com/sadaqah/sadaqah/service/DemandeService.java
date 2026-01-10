package com.sadaqah.sadaqah.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sadaqah.sadaqah.model.Demande;
import com.sadaqah.sadaqah.model.Annonce;
import com.sadaqah.sadaqah.repo.IDemande;
import com.sadaqah.sadaqah.repo.IAnnonce;

@Service
public class DemandeService {
	@Autowired
	private IDemande demandeRepo;
	
	@Autowired
	private IAnnonce annonceRepo;
	
	//demandes par annonce
	public List<Demande>demandesParAnnonce(Long idAnnonce) {
		return demandeRepo.demandesParAnnone(idAnnonce);
	};
	
	//demandes par utilisateur 
	public List<Demande>demandesParUser(Long idUser) {
		return demandeRepo.demandesParUser(idUser);
	};
	
	
	//demandes findAll
	public List<Demande>findAll() {
		return demandeRepo.findAll();
	};
		

	
	//ajouter une demande 
	// IMPORTANT: Selon le cahier des charges:
	// - Un utilisateur peut être donateur ET bénéficiaire (même compte utilisateur)
	// - MAIS il ne peut pas faire de demande sur sa propre annonce
	// - Les admins NE PEUVENT PAS faire de demandes (conflit d'intérêts)
	//   Note: Le blocage des admins se fait côté frontend car les tables Admin et Utilisateur sont séparées
	public boolean save_annonce(Long annonce, Long demandeur) {
		boolean result = false;
		try {
			// Vérifier que l'annonce existe
			Optional<Annonce> annonceOpt = annonceRepo.findById(annonce);
			if (!annonceOpt.isPresent()) {
				System.err.println("[DemandeService] Annonce non trouvée: " + annonce);
				return false;
			}
			
			Annonce annonceObj = annonceOpt.get();
			
			// Vérifier que le demandeur n'est pas le donateur de cette annonce
			// Selon le cahier des charges, un utilisateur ne peut pas demander sa propre annonce
			if (annonceObj.getDonnateur() != null && annonceObj.getDonnateur().getId() != null) {
				Long donnateurId = annonceObj.getDonnateur().getId();
				if (donnateurId.equals(demandeur)) {
					System.err.println("[DemandeService] ❌ ERREUR: Le demandeur (" + demandeur + ") est le donateur (" + donnateurId + ") de l'annonce (" + annonce + ")");
					throw new IllegalArgumentException("Vous ne pouvez pas faire de demande sur votre propre annonce");
				}
			}
			
			// Note: Les admins sont bloqués côté frontend (RequestButton.tsx)
			// car les tables Admin et Utilisateur sont séparées (ID admin != ID utilisateur)
			// Si un admin veut être donateur/bénéficiaire, il doit avoir un compte utilisateur séparé
			
			// Créer la demande (avec date et status par défaut)
			int rowsAffected = demandeRepo.savea(annonce, demandeur);
			if (rowsAffected > 0) {
				result = true;
				System.out.println("[DemandeService] ✅ Demande créée avec succès: annonce=" + annonce + ", demandeur=" + demandeur);
			} else {
				System.err.println("[DemandeService] ❌ Aucune ligne insérée (rowsAffected = 0)");
				result = false;
			}
			return result; 
		} catch(IllegalArgumentException e) {
			// Relancer l'exception pour que le controller puisse la gérer
			throw e;
		} catch(Exception e) {
			System.err.println("[DemandeService] ❌ Erreur lors de la création de la demande: " + e.getMessage());
			e.printStackTrace();
			result = false;
			return result;
		}
	}
	
	// Assigner une quantité à une demande (par le donateur)
	// IMPORTANT: Seul le donateur de l'annonce peut assigner une quantité
	public boolean assignerQuantite(Long idDemande, Long quantite, Long donnateurId) {
		boolean result = false;
		try {
			// Vérifier que la demande existe
			Optional<Demande> demandeOpt = demandeRepo.findById(idDemande);
			if (!demandeOpt.isPresent()) {
				System.err.println("[DemandeService] Demande non trouvée: " + idDemande);
				return false;
			}
			
			Demande demande = demandeOpt.get();
			
			// Vérifier que le demandeur est bien le donateur de l'annonce
			if (demande.getAnnonce() == null || demande.getAnnonce().getDonnateur() == null) {
				System.err.println("[DemandeService] Annonce ou donateur manquant pour la demande: " + idDemande);
				return false;
			}
			
			Long annonceDonnateurId = demande.getAnnonce().getDonnateur().getId();
			if (!annonceDonnateurId.equals(donnateurId)) {
				System.err.println("[DemandeService] ❌ ERREUR: Le donateur (" + donnateurId + ") n'est pas le donateur de l'annonce (" + annonceDonnateurId + ")");
				throw new IllegalArgumentException("Vous n'êtes pas le donateur de cette annonce");
			}
			
			// Vérifier la quantité disponible (pour l'instant, on utilise la quantité totale de l'annonce)
			// TODO: Calculer la quantité disponible en soustrayant les quantités déjà assignées
			Long quantiteTotale = demande.getAnnonce().getQuatite() != null ? demande.getAnnonce().getQuatite() : 0L;
			if (quantite > quantiteTotale) {
				throw new IllegalArgumentException("Quantité demandée (" + quantite + ") supérieure à la quantité totale de l'annonce (" + quantiteTotale + ")");
			}
			
			// Assigner la quantité
			int rowsAffected = demandeRepo.assignerQuantite(idDemande, quantite);
			if (rowsAffected > 0) {
				result = true;
				System.out.println("[DemandeService] ✅ Quantité assignée avec succès: demande=" + idDemande + ", quantite=" + quantite);
			} else {
				System.err.println("[DemandeService] ❌ Aucune ligne mise à jour (rowsAffected = 0)");
				result = false;
			}
			return result;
		} catch(IllegalArgumentException e) {
			throw e;
		} catch(Exception e) {
			System.err.println("[DemandeService] ❌ Erreur lors de l'assignation de la quantité: " + e.getMessage());
			e.printStackTrace();
			return false;
		}
	}
	
	//supprimer une demande 
	public void delete(Long id) {
			 demandeRepo.deleteById(id);
	};
	
	
//	//ajouter une demande 
//	public Demande save(Demande demande) {
//		 return demandeRepo.save(demande);
//	};

}
