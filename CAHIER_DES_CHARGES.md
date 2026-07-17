# Cahier des charges — RecoIA

**Projet** : RecoIA — Système de recommandation e-commerce intelligent
**Type** : Projet de fin d'études (Licence Informatique, spécialité Data Science)
**Porteuse du projet** : Amira Senouci
**Dépôt** : https://github.com/Amira-Senouci/RecoIA
**Version du document** : 1.0 — juillet 2026

---

## 1. Contexte et problématique

Les plateformes e-commerce modernes reposent sur des systèmes de recommandation pour personnaliser l'expérience utilisateur. Le projet RecoIA vise à concevoir, implémenter et évaluer un système de recommandation complet — de la donnée brute jusqu'à l'application web servie — en appliquant une méthodologie scientifique rigoureuse : chaque composant est mesuré sur un protocole figé et n'entre en production que s'il améliore l'existant selon une règle fixée à l'avance.

**Problématique** : comment combiner plusieurs familles de modèles de recommandation (filtrage collaboratif, contenu sémantique, séquentiel) pour dépasser les performances de chaque modèle individuel, tout en traitant le démarrage à froid (nouveaux produits) et en apprenant du comportement utilisateur en continu ?

## 2. Objectifs

1. Construire un pipeline de données reproductible à partir du dataset public Amazon Reviews 2023.
2. Implémenter et évaluer cinq familles de modèles individuels sous un protocole d'évaluation unique.
3. Concevoir un système hybride par fusion de rangs (RRF pondéré) dont les poids sont dérivés de mesures, puis un re-classement appris (LightGBM LambdaRank).
4. Intégrer le pipeline promu dans une application web complète (backend FastAPI + frontend React) avec apprentissage en ligne des profils utilisateurs.
5. Produire une évaluation finale consolidée digne d'un mémoire de niveau master : intervalles de confiance, couverture, diversité, nouveauté, axe démarrage à froid.

## 3. Périmètre

**Inclus** : préparation des données, EDA, 5 modèles individuels + hybride + ranker (10 notebooks), backend de service avec authentification, événements et profils temps réel, dashboard administrateur, frontend e-commerce (identité visuelle « Brand Identity Explorer »), tests, documentation.

**Exclus (justifié dans le mémoire)** : modèles à graphes (GNN — graphe trop fragmenté à cette échelle de données), BERT4Rec (coût 2–4× SASRec pour gain marginal), architectures CTR (DeepFM/DLRM — features catégorielles insuffisantes), déploiement cloud.

## 4. Données

- **Source** : Amazon Reviews 2023 (McAuley Lab, UCSD) — catégories All_Beauty, Health_and_Personal_Care, Handmade_Products.
- **Prétraitement** : déduplication, filtrage 5-core itératif, plafonnement par sous-échantillonnage d'utilisateurs.
- **Volume post-filtrage** : ≈ 25 000 interactions, 3 700 produits, 3 744 utilisateurs (médiane : 3 interactions/utilisateur — contrainte structurante du projet).
- **Évolution prévue** : migration vers la catégorie Beauty_and_Personal_Care (≈ 23 M d'avis) — un changement de configuration, pas d'architecture.

## 5. Besoins fonctionnels

| Réf. | Exigence |
|---|---|
| F1 | Inscription / connexion (JWT), vérification e-mail, réinitialisation du mot de passe |
| F2 | Catalogue produits navigable (titre, prix, image, note moyenne) issu des données réelles |
| F3 | Recommandations personnalisées « Pour vous » servies par le pipeline promu |
| F4 | Rails « Produits similaires » (modèle contenu) et « Les clients ont aussi acheté » (item-item) sur la fiche produit |
| F5 | Journalisation des événements utilisateur : vue, clic, favori, panier, achat, note, recherche |
| F6 | Mise à jour du profil utilisateur en temps réel (EMA dans l'espace d'embeddings ; une note 1–2★ constitue un signal négatif) — les recommandations évoluent au sein d'une même session |
| F7 | Gestion du démarrage à froid : onboarding par choix de catégories (nouvel utilisateur) ; routage par température vers le modèle contenu (nouveau produit) |
| F8 | Journalisation des impressions de recommandation et du CTR |
| F9 | Dashboard administrateur : métriques hors-ligne (HR@K, NDCG@K, couverture, diversité, nouveauté), CTR en ligne, tops produits, croissance utilisateurs, santé du modèle (version, date d'entraînement, latence p95) — aucune valeur codée en dur |
| F10 | Ré-entraînement nocturne automatisé avec registre de versions de modèles et bascule conditionnelle |

## 6. Besoins non fonctionnels

| Réf. | Exigence |
|---|---|
| NF1 | Latence de recommandation < 100 ms (p95) sur machine de développement |
| NF2 | Entraînement intégral réalisable sur CPU (i7, 16 Go RAM) — aucune dépendance GPU obligatoire |
| NF3 | Reproductibilité totale : splits déterministes (graine 42), protocole figé, `requirements.txt` épinglé |
| NF4 | Aucune donnée factice : l'API refuse de démarrer si les artefacts de modèles sont absents ou invalides |
| NF5 | Sécurité : hachage des mots de passe, secrets hors dépôt (`.env` ignoré, `.env.example` fourni) |
| NF6 | Code modulaire : toute logique de modèle vit dans `src/recsys` ; les notebooks importent, jamais de duplication |

## 7. Architecture technique

- **Données/ML** : Python, pandas, implicit (ALS), PyTorch (SASRec, Two-Tower), sentence-transformers (BGE `bge-base-en-v1.5`), LightGBM (LambdaRank).
- **Pipeline de service** : génération de candidats (5 jambes, profondeur 50) → fusion RRF pondérée (poids gelés issus de la validation, β = 0,5) → re-classement appris (si promu) → règles métier → journalisation.
- **Backend** : FastAPI, SQLAlchemy/Alembic, PostgreSQL (tables : users, items, events, user_profiles, recommendations_served, model_registry, metrics_daily).
- **Frontend** : React + TypeScript, identité visuelle « Brand Identity Explorer » conservée, instrumentation des événements et impressions.
- **Boucles de fraîcheur** : instantanée (profil, ensemble « vu »), nocturne (ALS, item-item, ranker, métriques), hebdomadaire (embeddings des nouveaux produits, SASRec).

## 8. Méthodologie d'évaluation

- **Protocole figé** : découpage temporel leave-last-out ; échantillon de test de 5 000 utilisateurs (graine 42) ; classement sur catalogue complet ; K = 10.
- **Discipline anti-fuite** : tout réglage (poids de fusion, ranker) s'effectue sur une validation interne au train ; le test n'est ouvert qu'une fois par système.
- **Règle de promotion pré-engagée** : un composant n'entre en service que s'il dépasse le système en place de +5 % de NDCG@10.
- **Résultats mesurés à ce jour** : meilleur modèle individuel item-item / SASRec (HR@10 ≈ 0,076, égalité statistique) ; contenu BGE 0,066 à chaud et seul système non nul sur produits froids (0,073) ; **hybride RRF pondéré : HR@10 0,102 / NDCG@10 0,064, soit +26,9 % vs meilleur modèle seul → promu** ; dilution du froid par l'hybride (0,020) → routage par température retenu.

## 9. Livrables

1. Dix notebooks Jupyter (01 prétraitement → 09 évaluation finale → 10 préparation au déploiement), chacun au format mémoire : problème, théorie, formulation mathématique, implémentation, résultats, analyse d'erreurs, discussion, références.
2. Bibliothèque `src/recsys` (modèles, fusion, ranker, service) avec tests.
3. Artefacts versionnés (embeddings, modèles, configurations) + registre en base.
4. Application web complète (backend + frontend) avec parcours démo documenté (`RUN_DEMO.md`).
5. Tables et figures de qualité publication (`results/`, `figures/`) alimentant directement le mémoire.
6. Documentation : `HOW_TO_RUN.md`, `RECOIA_V3_ARCHITECTURE.md`, présent cahier des charges.

## 10. Contraintes

- Matériel : ordinateur portable i7 12ᵉ gén., 16 Go RAM, sans GPU NVIDIA (Iris Xe) → dimensionnement CPU des modèles.
- Données : parcimonie extrême (médiane 3 interactions/utilisateur) → filtrage k-core, régularisation forte, validation des implémentations sur données synthétiques avant toute donnée réelle.
- Budget : outils et données exclusivement gratuits/open source.

## 11. Critères d'acceptation globaux

1. La chaîne de notebooks s'exécute de bout en bout depuis un clone du dépôt (`requirements.txt` + `HOW_TO_RUN.md`).
2. Le tableau comparatif final présente tous les systèmes avec intervalles de confiance à 95 % ; l'hybride domine significativement chaque modèle individuel.
3. Parcours applicatif complet : inscription → onboarding → navigation → cinq clics « beauté » modifient visiblement le rail « Pour vous » dans la même session → dashboard admin affichant des valeurs réelles.
4. Démarrage à froid démontré : un produit sans interaction est recommandable via le modèle contenu.
5. L'API refuse de démarrer sans artefacts valides (test automatisé).

## 12. État d'avancement (juillet 2026)

**Réalisé** : notebooks 01–07 exécutés et validés ; hybride promu (+26,9 %) ; modules complets ; notebooks 08–09 livrés (exécution en cours) ; dépôt GitHub publié.
**En cours** : intégration backend du pipeline promu (blocage actuel : authentification PostgreSQL au démarrage — voir traceback joint), câblage frontend des rails et événements.
**Restant** : notebook 10, job de ré-entraînement nocturne, dashboard admin branché, suite de tests, rédaction finale du mémoire.
