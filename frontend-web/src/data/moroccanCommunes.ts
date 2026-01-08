// Liste des communes marocaines avec leurs coordonnées géographiques
export interface Commune {
  label: string;
  value: string;
  centroid: [number, number]; // [latitude, longitude]
  region?: string;
}

export const moroccanCommunes: Commune[] = [
  // Région Casablanca-Settat
  { label: 'Casablanca', value: 'CASABLANCA', centroid: [33.5731, -7.5898], region: 'Casablanca-Settat' },
  { label: 'Mohammedia', value: 'MOHAMMEDIA', centroid: [33.6861, -7.3828], region: 'Casablanca-Settat' },
  { label: 'El Jadida', value: 'EL_JADIDA', centroid: [33.2568, -8.5013], region: 'Casablanca-Settat' },
  { label: 'Settat', value: 'SETTAT', centroid: [33.0018, -7.6168], region: 'Casablanca-Settat' },
  { label: 'Berrechid', value: 'BERRECHID', centroid: [33.2655, -7.5871], region: 'Casablanca-Settat' },
  
  // Région Rabat-Salé-Kénitra
  { label: 'Rabat', value: 'RABAT', centroid: [34.0209, -6.8416], region: 'Rabat-Salé-Kénitra' },
  { label: 'Salé', value: 'SALE', centroid: [34.0531, -6.7986], region: 'Rabat-Salé-Kénitra' },
  { label: 'Kénitra', value: 'KENITRA', centroid: [34.2610, -6.5802], region: 'Rabat-Salé-Kénitra' },
  { label: 'Témara', value: 'TEMARA', centroid: [33.9258, -6.9059], region: 'Rabat-Salé-Kénitra' },
  { label: 'Sidi Slimane', value: 'SIDI_SLIMANE', centroid: [34.2648, -6.0439], region: 'Rabat-Salé-Kénitra' },
  
  // Région Fès-Meknès
  { label: 'Fès', value: 'FES', centroid: [34.0333, -5.0000], region: 'Fès-Meknès' },
  { label: 'Meknès', value: 'MEKNES', centroid: [33.8935, -5.5547], region: 'Fès-Meknès' },
  { label: 'Taza', value: 'TAZA', centroid: [34.2100, -4.0100], region: 'Fès-Meknès' },
  { label: 'Ifrane', value: 'IFRANE', centroid: [33.5333, -5.1000], region: 'Fès-Meknès' },
  { label: 'Sefrou', value: 'SEFROU', centroid: [33.8315, -4.8351], region: 'Fès-Meknès' },
  
  // Région Marrakech-Safi
  { label: 'Marrakech', value: 'MARRAKECH', centroid: [31.6295, -7.9811], region: 'Marrakech-Safi' },
  { label: 'Safi', value: 'SAFI', centroid: [32.2994, -9.2372], region: 'Marrakech-Safi' },
  { label: 'Essaouira', value: 'ESSAOUIRA', centroid: [31.5125, -9.7700], region: 'Marrakech-Safi' },
  { label: 'El Kelâa des Sraghna', value: 'EL_KELAA_SRAGHNA', centroid: [32.0500, -7.4000], region: 'Marrakech-Safi' },
  { label: 'Chichaoua', value: 'CHICHAOUA', centroid: [31.5447, -8.7590], region: 'Marrakech-Safi' },
  
  // Région Tanger-Tétouan-Al Hoceïma
  { label: 'Tanger', value: 'TANGER', centroid: [35.7673, -5.7998], region: 'Tanger-Tétouan-Al Hoceïma' },
  { label: 'Tétouan', value: 'TETOUAN', centroid: [35.5784, -5.3644], region: 'Tanger-Tétouan-Al Hoceïma' },
  { label: 'Al Hoceïma', value: 'AL_HOCEIMA', centroid: [35.2494, -3.9366], region: 'Tanger-Tétouan-Al Hoceïma' },
  { label: 'Larache', value: 'LARACHE', centroid: [35.1932, -6.1562], region: 'Tanger-Tétouan-Al Hoceïma' },
  { label: 'Chefchaouen', value: 'CHEFCHAOUEN', centroid: [35.1688, -5.2636], region: 'Tanger-Tétouan-Al Hoceïma' },
  
  // Région de l'Oriental
  { label: 'Oujda', value: 'OUJDA', centroid: [34.6805, -1.9063], region: 'Oriental' },
  { label: 'Nador', value: 'NADOR', centroid: [35.1667, -2.9333], region: 'Oriental' },
  { label: 'Berkane', value: 'BERKANE', centroid: [34.9200, -2.3200], region: 'Oriental' },
  { label: 'Taourirt', value: 'TAOURIRT', centroid: [34.4073, -2.8931], region: 'Oriental' },
  { label: 'Jerada', value: 'JERADA', centroid: [34.3100, -2.1600], region: 'Oriental' },
  
  // Région Souss-Massa
  { label: 'Agadir', value: 'AGADIR', centroid: [30.4278, -9.5981], region: 'Souss-Massa' },
  { label: 'Taroudant', value: 'TAROUDANT', centroid: [30.4700, -8.8800], region: 'Souss-Massa' },
  { label: 'Tiznit', value: 'TIZNIT', centroid: [29.6974, -9.7369], region: 'Souss-Massa' },
  { label: 'Inezgane', value: 'INEZGANE', centroid: [30.3611, -9.5372], region: 'Souss-Massa' },
  { label: 'Chtouka-Aït Baha', value: 'CHTOUKA_AIT_BAHA', centroid: [30.0667, -9.1500], region: 'Souss-Massa' },
  
  // Région Béni Mellal-Khénifra
  { label: 'Béni Mellal', value: 'BENI_MELLAL', centroid: [32.3372, -6.3591], region: 'Béni Mellal-Khénifra' },
  { label: 'Khénifra', value: 'KHENIFRA', centroid: [32.9349, -5.6647], region: 'Béni Mellal-Khénifra' },
  { label: 'Khouribga', value: 'KHOURIBGA', centroid: [32.8811, -6.9089], region: 'Béni Mellal-Khénifra' },
  { label: 'Azilal', value: 'AZILAL', centroid: [31.9667, -6.5667], region: 'Béni Mellal-Khénifra' },
  { label: 'Fquih Ben Salah', value: 'FQUIH_BEN_SALAH', centroid: [32.5000, -6.6833], region: 'Béni Mellal-Khénifra' },
  
  // Région Drâa-Tafilalet
  { label: 'Errachidia', value: 'ERRACHIDIA', centroid: [31.9314, -4.4247], region: 'Drâa-Tafilalet' },
  { label: 'Ouarzazate', value: 'OUARZAZATE', centroid: [30.9189, -6.8938], region: 'Drâa-Tafilalet' },
  { label: 'Zagora', value: 'ZAGORA', centroid: [30.3328, -5.8384], region: 'Drâa-Tafilalet' },
  { label: 'Tinghir', value: 'TINGHIR', centroid: [31.5147, -5.5320], region: 'Drâa-Tafilalet' },
  { label: 'Midelt', value: 'MIDELT', centroid: [32.6852, -4.7368], region: 'Drâa-Tafilalet' },
  
  // Région Guelmim-Oued Noun
  { label: 'Guelmim', value: 'GUELMIM', centroid: [28.9870, -10.0574], region: 'Guelmim-Oued Noun' },
  { label: 'Tan-Tan', value: 'TAN_TAN', centroid: [28.4381, -11.1028], region: 'Guelmim-Oued Noun' },
  { label: 'Sidi Ifni', value: 'SIDI_IFNI', centroid: [29.3797, -10.1733], region: 'Guelmim-Oued Noun' },
  { label: 'Assa-Zag', value: 'ASSA_ZAG', centroid: [28.6000, -9.4333], region: 'Guelmim-Oued Noun' },
  
  // Région Laâyoune-Sakia El Hamra
  { label: 'Laâyoune', value: 'LAAYOUNE', centroid: [27.1418, -13.1867], region: 'Laâyoune-Sakia El Hamra' },
  { label: 'Boujdour', value: 'BOUJDOUR', centroid: [26.1288, -14.4842], region: 'Laâyoune-Sakia El Hamra' },
  { label: 'Es-Semara', value: 'ES_SEMARA', centroid: [26.7422, -11.6711], region: 'Laâyoune-Sakia El Hamra' },
  { label: 'Tarfaya', value: 'TARFAYA', centroid: [27.9392, -12.9287], region: 'Laâyoune-Sakia El Hamra' },
  
  // Région Dakhla-Oued Ed-Dahab
  { label: 'Dakhla', value: 'DAKHLA', centroid: [23.7136, -15.9369], region: 'Dakhla-Oued Ed-Dahab' },
  { label: 'Aousserd', value: 'AOUSSERD', centroid: [22.5500, -14.3333], region: 'Dakhla-Oued Ed-Dahab' }
];

// Fonction pour grouper les communes par région
export const getCommunesByRegion = () => {
  const regions: Record<string, Commune[]> = {};
  
  moroccanCommunes.forEach(commune => {
    if (commune.region) {
      if (!regions[commune.region]) {
        regions[commune.region] = [];
      }
      regions[commune.region].push(commune);
    }
  });
  
  return regions;
};

// Fonction pour trouver une commune par sa valeur
export const getCommuneByValue = (value: string): Commune | undefined => {
  return moroccanCommunes.find(commune => commune.value === value);
};