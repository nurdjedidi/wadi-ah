Formules de Scores Nutritionnels par Profil Utilisateur
1. Score Cardiaque (Lipides & Sodium)
Variables

Sodium_jour : quantité de sodium consommée (mg)
SFA_jour : quantité de graisses saturées consommées (g)
CalTotal_jour : total des calories consommées dans la journée

Formule générale
Impact_Cardio = w1 × SFA_jour + w2 × (Sodium_jour / 1000)
Score_Cardiaque = 100 - k × (Impact_Cardio / CalTotal_jour)
```
*Score clampé entre 0 et 100*

### Pondérations par profil

| Profil | w1 (SFA) | w2 (Sodium) | k | Justification |
|--------|----------|-------------|---|---------------|
| **Maintien** | 1.0 | 0.5 | 10 | Équilibre standard pour santé cardiovasculaire |
| **Perte de poids** | 1.2 | 0.6 | 12 | Pénalisation accrue des graisses saturées, sodium favorise rétention d'eau |
| **Prise de poids** | 0.8 | 0.4 | 8 | Tolérance augmentée, focus sur apport calorique suffisant |
| **Prise de muscle** | 0.9 | 0.5 | 9 | Tolérance modérée, sodium peut être utile pour performance |

---

## 2. Score Glycémique (Glucides & Sucres)

### Variables
- **Gluc_tot_jour** : quantité totale de glucides (g)
- **Sucres_tot_jour** : quantité totale de sucres (g)
- **Sucres_libres_jour** : estimation des sucres libres (g)
- **IG_moy_jour** : index glycémique moyen pondéré (0-100)
- **CalTotal_jour** : total des calories de la journée

### Estimation des sucres libres
```
Si aliment = boisson sucrée / sirop / jus / confiture :
    Sucres_libres = Sucres_aliment

Si aliment = fruit entier / légume entier / lait entier :
    Sucres_libres ≈ 0

Sinon (aliments transformés) :
    Sucres_libres ≈ 0.8 × Sucres_aliment

Sucres_libres_jour = Σ Sucres_libres_aliment
```

### Formule générale
```
Impact_Glyc = w1 × Sucres_libres_jour + w2 × Gluc_tot_jour × (IG_moy_jour / 100)
Score_Glycémie = 100 - k × (Impact_Glyc / CalTotal_jour)
```
*Score clampé entre 0 et 100*

### Pondérations par profil

| Profil | w1 (Sucres libres) | w2 (Glucides×IG) | k | Justification |
|--------|-------------------|------------------|---|---------------|
| **Maintien** | 1.0 | 0.5 | 10 | Contrôle standard de la glycémie |
| **Perte de poids** | 1.5 | 0.7 | 12 | Forte pénalisation des pics glycémiques, favorise satiété |
| **Prise de poids** | 0.6 | 0.3 | 7 | Tolérance élevée, glucides nécessaires pour surplus calorique |
| **Prise de muscle** | 0.7 | 0.4 | 8 | Glucides importants pour énergie et récupération, mais contrôle des sucres libres |

---

## 3. Score Fibres & Protéines

### Variables
- **Fibres_jour** : quantité de fibres alimentaires (g)
- **Proteines_jour** : quantité de protéines (g)
- **CalTotal_jour** : total des calories de la journée

### Objectifs par profil

| Profil | Objectif Fibres | Objectif Protéines | Base de calcul |
|--------|----------------|-------------------|----------------|
| **Maintien** | 25 g/jour | 0.8 × Poids_kg | Recommandations OMS/ANSES |
| **Perte de poids** | 30 g/jour | 1.2 × Poids_kg | Fibres ↑ satiété, Protéines ↑ préservent muscle |
| **Prise de poids** | 25 g/jour | 1.0 × Poids_kg | Apport équilibré |
| **Prise de muscle** | 28 g/jour | 1.6-2.0 × Poids_kg | Protéines élevées pour synthèse musculaire |

### Formule générale
```
Ratio_Fibres = min(Fibres_jour / Objectif_Fibres, 1.2)
Ratio_Proteines = min(Proteines_jour / Objectif_Proteines, 1.2)

Impact_FP = w1 × Ratio_Fibres + w2 × Ratio_Proteines

Score_FibresProteines = 100 × min(Impact_FP, 1.0)
```
*Plafond à 120% de l'objectif pour éviter les excès*

### Pondérations par profil

| Profil | w1 (Fibres) | w2 (Protéines) | Justification |
|--------|-------------|----------------|---------------|
| **Maintien** | 0.5 | 0.5 | Importance égale |
| **Perte de poids** | 0.6 | 0.4 | Fibres prioritaires pour satiété |
| **Prise de poids** | 0.4 | 0.6 | Protéines pour construction, fibres secondaires |
| **Prise de muscle** | 0.3 | 0.7 | Protéines hautement prioritaires |

---

## 4. Score Global de Qualité Nutritionnelle

### Formule d'agrégation
```
Score_Global = (Score_Cardiaque × p1 + Score_Glycémie × p2 + Score_FibresProteines × p3) / (p1 + p2 + p3)
Pondérations d'agrégation par profil
Profilp1 (Cardio)p2 (Glycémie)p3 (Fibres/Protéines)FocusMaintien1.01.01.0Équilibre completPerte de poids1.01.21.3Accent sur glycémie et protéines/fibresPrise de poids0.80.71.2Protéines prioritaires, tolérance métaboliquePrise de muscle0.90.81.5Protéines hautement prioritaires

Références Santé Publique

OMS : <10% calories de sucres libres, <2g sodium/jour, <10% calories de graisses saturées
ANSES (France) : 25g fibres/jour, 0.83g protéines/kg/jour
Guidelines perte de poids : 1.2-1.6g protéines/kg, fibres 30g+
Guidelines prise de muscle : 1.6-2.2g protéines/kg selon intensité d'entraînement


Notes d'implémentation

Adaptation dynamique : Les objectifs protéines se calculent avec le poids utilisateur
Seuils d'alerte : Score < 50 → recommandations nutritionnelles ciblées