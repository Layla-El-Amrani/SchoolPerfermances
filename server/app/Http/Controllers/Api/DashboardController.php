<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Commune;
use App\Models\Etablissement;
use App\Models\Eleve;
use App\Models\ResultatEleve;
use App\Models\NiveauScolaire;
use App\Models\Province;
use App\Models\AnneeScolaire;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class DashboardController extends Controller
{
   

    /**
     * Get statistics by province
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */


     
    public function statsProvince(Request $request)
    {
        try {
            $anneeScolaire = $request->query('annee_scolaire');

            // Si aucune année n'est spécifiée, utiliser l'année courante
            if (!$anneeScolaire) {
                $anneeCourante = AnneeScolaire::where('est_courante', true)->first();
                if ($anneeCourante) {
                    $anneeScolaire = $anneeCourante->annee_scolaire;
                }
            }

            // Charger la province avec tous les enfants nécessaires
            $province = Province::with([
                'communes.etablissements' => function($query) {
                    $query->withCount('eleves');
                }
            ])->first();

            if (!$province) {
                return response()->json([
                    'success' => false,
                    'message' => 'Province non trouvée'
                ], 404);
            }

            $totalEleves = 0;
            $totalResultats = 0;
            $totalReussis = 0;
            $sommeMoyennes = 0;

            // Compter les communes et établissements directement
            $nombreCommunes = $province->communes->count();
            $nombreEtablissements = $province->communes->sum(function($commune) {
                return $commune->etablissements->count();
            });

            // Parcourir les élèves et résultats
            foreach ($province->communes as $commune) {
                foreach ($commune->etablissements as $etablissement) {
                    foreach ($etablissement->eleves as $eleve) {
                        // Filtrer les résultats par année scolaire
                        $resultats = $eleve->resultats->where('annee_scolaire', $anneeScolaire);
                        if ($resultats->isNotEmpty()) {
                            $totalEleves++;
                            $totalResultats++;
                            $moyenne = $resultats->avg('MoyenSession');
                            $sommeMoyennes += $moyenne;
                            if ($moyenne >= 10) {
                                $totalReussis++;
                            }
                        }
                    }
                }
            }

            $moyenneGenerale = $totalResultats > 0 ? $sommeMoyennes / $totalResultats : 0;
            $tauxReussite = $totalResultats > 0 ? ($totalReussis / $totalResultats) * 100 : 0;
            $tauxEchec = $totalResultats > 0 ? (($totalResultats - $totalReussis) / $totalResultats) * 100 : 0;

            return response()->json([
                'success' => true,
                'message' => 'Statistiques de la province récupérées avec succès',
                'data' => [
                    'annee_scolaire' => $anneeScolaire,
                    'province' => [
                        'id_province' => $province->id_province,
                        'nom_province' => $province->nom_province,
                        'statistiques' => [
                            'nombre_communes' => $nombreCommunes,
                            'nombre_etablissements' => $nombreEtablissements,
                            'nombre_eleves' => $totalEleves,
                            'moyenne_generale' => round($moyenneGenerale, 2),
                            'taux_reussite' => round($tauxReussite, 2),
                            'taux_echec' => round($tauxEchec, 2)
                        ]
                    ]
                ]
            ]);
          
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statistiques de la province',
                'error' => $e->getMessage()
            ], 500);
        }
    }


     /**
     * Get province statistics evolution over years
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function evolutionProvince()
    {
        try {
            // Récupérer toutes les années scolaires
            $anneesScolaires = AnneeScolaire::orderBy('annee_scolaire', 'asc')->get();

            $statistiques = [];
            
            foreach ($anneesScolaires as $annee) {
                $nombreEleves = 0;
                $sommeMoyennes = 0;
                $nombreMoyennes = 0;
                $nombreReussis = 0;

                // Charger les élèves avec leurs résultats pour cette année
                $eleves = Eleve::with(['resultats' => function($query) use ($annee) {
                    $query->where('annee_scolaire', $annee->annee_scolaire);
                }])
                ->get();

                // Parcourir les élèves et leurs résultats
                foreach ($eleves as $eleve) {
                    foreach ($eleve->resultats as $resultat) {
                        $nombreEleves++;
                        $sommeMoyennes += $resultat->MoyenSession;
                        $nombreMoyennes++;
                        if ($resultat->MoyenSession >= 10) {
                            $nombreReussis++;
                        }
                    }
                }

                $moyenneGenerale = $nombreMoyennes > 0 ? $sommeMoyennes / $nombreMoyennes : 0;
            $tauxReussite = $nombreEleves > 0 ? ($nombreReussis / $nombreEleves) * 100 : 0;

                $statistiques[] = [
                    'annee_scolaire' => $annee->annee_scolaire,
                'nombre_eleves' => $nombreEleves,
                'moyenne_generale' => round($moyenneGenerale, 2),
                'taux_reussite' => round($tauxReussite, 2)
            ];
            }

            // Charger le nom de la province
            $province = Province::first();
            if (!$province) {
                return response()->json([
                    'success' => false,
                    'message' => 'Province non trouvée'
                ], 404);
            }

        return response()->json([
            'success' => true,
                'data' => [
                    'province' => $province->nom_province,
                    'statistiques' => $statistiques
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du calcul des statistiques',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function topEtablissementsParProvince($anneeScolaire = null)
    {
        try {
            // Si aucune année n'est spécifiée, utiliser l'année courante
            if (!$anneeScolaire) {
                $anneeCourante = \App\Models\AnneeScolaire::where('est_courante', true)->first();
                if ($anneeCourante) {
                    $anneeScolaire = $anneeCourante->annee_scolaire;
                }
            }

            // Log de débogage
            \Log::info("Début de topEtablissementsParProvince pour l'année: " . $anneeScolaire);
            
            // Charger les établissements avec leurs élèves, communes et résultats
            $resultats = \App\Models\ResultatEleve::where('annee_scolaire', $anneeScolaire)
                ->with([
                    'eleve.etablissement' => function($query) {
                        $query->with(['commune']);
                    }
                ])
                ->get();
                
            \Log::info("Nombre de résultats trouvés: " . $resultats->count());
            
            if ($resultats->isEmpty()) {
                \Log::info("Aucun résultat trouvé pour l'année: " . $anneeScolaire);
                return response()->json([]);
            }

            // Grouper les résultats par établissement
            $etablissementsData = [];
            $missingEtablissement = 0;
            $missingEleve = 0;
            
            foreach ($resultats as $resultat) {
                if (!$resultat->eleve) {
                    $missingEleve++;
                    continue;
                }
                
                if (!$resultat->eleve->etablissement) {
                    $missingEtablissement++;
                    continue;
                }
                
                $codeEtab = $resultat->eleve->etablissement->code_etab;
                
                // Log le premier résultat pour vérification
                if (empty($etablissementsData)) {
                    \Log::info("Premier résultat valide", [
                        'code_eleve' => $resultat->code_eleve,
                        'code_etab' => $codeEtab,
                        'etablissement' => $resultat->eleve->etablissement->nom_etab_fr,
                        'MoyenSession' => $resultat->MoyenSession
                    ]);
                }
                
                if (!isset($etablissementsData[$codeEtab])) {
                    // Log pour déboguer les données de l'établissement
                    \Log::info('Données de l\'établissement:', [
                        'code_etab' => $codeEtab,
                        'nom' => $resultat->eleve->etablissement->nom_etab_fr,
                        'code_commune' => $resultat->eleve->etablissement->code_commune,
                        'commune_relation' => $resultat->eleve->etablissement->commune ? 'existe' : 'n\'existe pas'
                    ]);

                    $etablissementsData[$codeEtab] = [
                        'id' => $codeEtab,
                        'nom' => $resultat->eleve->etablissement->nom_etab_fr,
                        'commune' => $resultat->eleve->etablissement->commune ? $resultat->eleve->etablissement->commune->ll_com : 'Inconnue',
                        'cycle' => $resultat->eleve->etablissement->cycle,
                        'moyenne' => 0,
                        'total_notes' => 0,
                        'total_eleves' => [],
                        'nombre_eleves' => 0
                    ];
                    
                    // Si la commune est inconnue, on essaie de la charger manuellement
                    if (!$resultat->eleve->etablissement->commune && $resultat->eleve->etablissement->code_commune) {
                        $commune = \App\Models\Commune::find($resultat->eleve->etablissement->code_commune);
                        if ($commune) {
                            $etablissementsData[$codeEtab]['commune'] = $commune->ll_com;
                            \Log::info('Commune chargée manuellement:', [
                                'code_commune' => $commune->cd_com,
                                'nom_commune' => $commune->ll_com,
                                'etablissement' => $codeEtab
                            ]);
                        }
                    }
                }
                
                // Garder une trace des élèves uniques et de leurs moyennes
                if (!isset($etablissementsData[$codeEtab]['total_eleves'][$resultat->code_eleve])) {
                    // Premier résultat pour cet élève, initialiser sa moyenne
                    $etablissementsData[$codeEtab]['total_eleves'][$resultat->code_eleve] = [
                        'somme_notes' => 0,
                        'nb_notes' => 0
                    ];
                }
                
                // Ajouter la note à la somme de l'élève
                $etablissementsData[$codeEtab]['total_eleves'][$resultat->code_eleve]['somme_notes'] += $resultat->MoyenSession;
                $etablissementsData[$codeEtab]['total_eleves'][$resultat->code_eleve]['nb_notes']++;
            }
            
            // Calculer les moyennes
            foreach ($etablissementsData as &$etab) {
                $totalMoyennes = 0;
                $nbElevesAvecNotes = 0;
                
                // Pour chaque élève, calculer sa moyenne
                foreach ($etab['total_eleves'] as $eleveData) {
                    if ($eleveData['nb_notes'] > 0) {
                        $moyenneEleve = $eleveData['somme_notes'] / $eleveData['nb_notes'];
                        $totalMoyennes += $moyenneEleve;
                        $nbElevesAvecNotes++;
                    }
                }
                
                // Calculer la moyenne de l'établissement
                if ($nbElevesAvecNotes > 0) {
                    $etab['moyenne'] = round($totalMoyennes / $nbElevesAvecNotes, 2);
                    $etab['nombre_eleves'] = $nbElevesAvecNotes;
                } else {
                    $etab['moyenne'] = 0;
                    $etab['nombre_eleves'] = 0;
                }
                
                unset($etab['total_eleves']);
            }
            
            // Trier par moyenne décroissante et prendre les 10 premiers
            $etablissements = collect($etablissementsData)
                ->sortByDesc('moyenne')
                ->take(10)
                ->values();
                
            \Log::info("Résultats finaux", [
                'nombre_etablissements' => $etablissements->count(),
                'etablissements' => $etablissements->toArray(),
                'missing_eleve' => $missingEleve,
                'missing_etablissement' => $missingEtablissement
            ]);
            
            return response()->json($etablissements);
            
        } catch (\Exception $e) {
            \Log::error('Erreur dans topEtablissementsParProvince: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors de la récupération des données'], 500);
        }
    }

    public function statsParCycle($anneeScolaire)
    {
        try {
            // Charger les établissements avec leurs élèves et résultats
            $etablissements = Etablissement::with([
                'eleves' => function($query) use ($anneeScolaire) {
                    $query->with(['resultats' => function($q) use ($anneeScolaire) {
                        $q->select('code_eleve', 'MoyenSession', 'annee_scolaire')
                         ->where('annee_scolaire', $anneeScolaire);
                    }])
                    ->select('code_eleve', 'nom_eleve_ar', 'prenom_eleve_ar', 'code_etab')
                    ->whereHas('resultats', function($r) use ($anneeScolaire) {
                        $r->where('annee_scolaire', $anneeScolaire);
                    });
                }
            ])
            ->get();

            // Grouper par cycle et calculer les statistiques
            $resultats = $etablissements->groupBy('cycle')->map(function($group) use ($anneeScolaire) {

                $nombreEleves = 0;
                $sommeMoyennes = 0;
                $nombreMoyennes = 0;
                $nombreReussis = 0;

                foreach ($group as $etablissement) {
                    foreach ($etablissement->eleves as $eleve) {
                        foreach ($eleve->resultats as $resultat) {
                            $nombreEleves++;
                            $sommeMoyennes += $resultat->MoyenSession;
                            $nombreMoyennes++;
                            if ($resultat->MoyenSession >= 10) {
                                $nombreReussis++;
                            }
                        }
                    }
                }

                $moyenneGenerale = $nombreMoyennes > 0 ? $sommeMoyennes / $nombreMoyennes : 0;
                $tauxReussite = $nombreEleves > 0 ? ($nombreReussis / $nombreEleves) * 100 : 0;

            return [
                    'cycle' => $group[0]->cycle,
                'nombre_eleves' => $nombreEleves,
                    'moyenne_generale' => round($moyenneGenerale, 2),
                    'taux_reussite' => round($tauxReussite, 2)
            ];
        });

            // Convertir en tableau pour une meilleure lisibilité
            $resultatsArray = $resultats->values()->toArray();

        return response()->json([
            'success' => true,
                'data' => $resultatsArray
            ]);
        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du calcul des statistiques par cycle',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function comparaisonCommunesProvince($id_province, $anneeScolaire = null)
    {
        try {
            // Si aucune année n'est spécifiée, utiliser l'année courante
            if (!$anneeScolaire) {
                $anneeCourante = AnneeScolaire::where('est_courante', true)->first();
                if ($anneeCourante) {
                    $anneeScolaire = $anneeCourante->annee_scolaire;
                } else {
                    $anneeScolaire = '2025-2026'; // Valeur par défaut si aucune année courante n'est définie
                }
            }

            \Log::info("Début de comparaisonCommunesProvince");
            \Log::info("ID Province: " . $id_province);
            \Log::info("Année scolaire: " . $anneeScolaire);

            // Vérifier d'abord si la province existe
            $province = Province::find($id_province);
            if (!$province) {
                \Log::error("Province non trouvée avec l'ID: " . $id_province);
                return response()->json(['error' => 'Province non trouvée'], 404);
            }
            \Log::info("Province trouvée: " . $province->nom_province);

            // Vérifier les colonnes de la table resultat_eleve
            $columns = \DB::select('SHOW COLUMNS FROM resultat_eleve');
            $moyenneColumn = null;
            
            // Afficher la structure complète de la table pour le débogage
            \Log::info("Structure de la table resultat_eleve: " . json_encode($columns, JSON_PRETTY_PRINT));
            
            // Vérifier les données dans la table resultat_eleve
            $sampleResults = \DB::table('resultat_eleve')
                ->where('annee_scolaire', $anneeScolaire)
                ->limit(5)
                ->get();
            \Log::info("Exemples de données dans resultat_eleve: " . json_encode($sampleResults, JSON_PRETTY_PRINT));
            
            foreach ($columns as $column) {
                if (strtolower($column->Field) === 'moyensession' || strtolower($column->Field) === 'moyenne') {
                    $moyenneColumn = $column->Field;
                    break;
                }
            }
            
            if (!$moyenneColumn) {
                // Si on ne trouve pas la colonne, essayer de deviner d'après le type
                foreach ($columns as $column) {
                    if (stripos($column->Type, 'decimal') !== false || 
                        stripos($column->Type, 'float') !== false ||
                        stripos($column->Type, 'double') !== false) {
                        $moyenneColumn = $column->Field;
                        break;
                    }
                }
            }
            
            if (!$moyenneColumn) {
                // Si on ne trouve toujours pas, utiliser la première colonne numérique
                foreach ($columns as $column) {
                    if (in_array(strtolower($column->Type), ['int', 'decimal', 'float', 'double'])) {
                        $moyenneColumn = $column->Field;
                        break;
                    }
                }
            }
            
            if (!$moyenneColumn) {
                // Si on ne trouve toujours pas, utiliser la première colonne
                $moyenneColumn = $columns[0]->Field;
            }
            
            \Log::info("Colonne utilisée pour la moyenne: " . $moyenneColumn);
            \Log::info("Colonnes disponibles: " . json_encode(array_map(function($c) { return $c->Field; }, $columns)));

            // Récupérer les communes de la province avec le nombre d'élèves et les résultats
            $query = \DB::table('commune as c')
                ->leftJoin('etablissement as e', 'c.cd_com', '=', 'e.code_commune')
                ->leftJoin('eleve as el', 'e.code_etab', '=', 'el.code_etab')
                ->leftJoin('resultat_eleve as r', function($join) use ($anneeScolaire) {
                    $join->on('el.code_eleve', '=', 'r.code_eleve')
                         ->where('r.annee_scolaire', '=', $anneeScolaire);
                })
                ->where('c.id_province', $id_province);
            
            // Ajouter les sélections avec la colonne de moyenne dynamique
            $query->select(
                'c.cd_com',
                'c.ll_com as commune',
                \DB::raw('COUNT(DISTINCT el.code_eleve) as nombre_eleves'),
                \DB::raw('AVG(r.' . $moyenneColumn . ') as moyenne_generale'),
                \DB::raw('SUM(CASE WHEN r.' . $moyenneColumn . ' >= 10 THEN 1 ELSE 0 END) / COUNT(DISTINCT el.code_eleve) * 100 as taux_reussite')
            )
            ->groupBy('c.cd_com', 'c.ll_com');
            
            // Afficher la requête SQL pour le débogage
            \Log::info("Requête SQL: " . $query->toSql());
            \Log::info("Paramètres: " . json_encode($query->getBindings()));
            
            $communes = $query->get();
            \Log::info("Résultats bruts: " . json_encode($communes));

            // Vérifier les données brutes
            if ($communes->isNotEmpty()) {
                $firstCommune = $communes->first();
                \Log::info("Première commune - Nom: {$firstCommune->commune}, Nombre élèves: {$firstCommune->nombre_eleves}, Moyenne: {$firstCommune->moyenne_generale}");
                
                // Vérifier les valeurs nulles
                $nullAverages = $communes->where('moyenne_generale', null)->count();
                $zeroAverages = $communes->where('moyenne_generale', 0)->count();
                \Log::info("Moyennes nulles: $nullAverages, Moyennes à zéro: $zeroAverages");
                
                // Vérifier les données d'un élève au hasard
                $sampleEleve = DB::table('eleve')
                    ->join('resultat_eleve', 'eleve.code_eleve', '=', 'resultat_eleve.code_eleve')
                    ->where('resultat_eleve.annee_scolaire', $anneeScolaire)
                    ->first();
                \Log::info("Exemple d'élève avec résultat: " . json_encode($sampleEleve));
            }

            \Log::info("Nombre de communes avec statistiques: " . $communes->count());

            // Formater les résultats
            $communes = $communes->map(function($commune) {
                return [
                    'commune' => $commune->commune,
                    'nombre_eleves' => (int)$commune->nombre_eleves,
                    'moyenne_generale' => $commune->moyenne_generale ? round((float)$commune->moyenne_generale, 2) : 0,
                    'taux_reussite' => $commune->taux_reussite ? round((float)$commune->taux_reussite, 2) : 0,
                    'rang' => 0
                ];
            })->sortByDesc('moyenne_generale')->values();

            // Ajouter les rangs
            $rang = 1;
            foreach ($communes as &$commune) {
                $commune['rang'] = $rang++;
            }

            // Calculer la moyenne générale de la province
            $moyenneProvince = $communes->avg('moyenne_generale');

            \Log::info("Moyenne générale de la province: " . $moyenneProvince);
            \Log::info("Nombre de communes retournées: " . $communes->count());

            return response()->json([
                'success' => true,
                'data' => [
                    'province' => $province->nom_province,
                    'moyenne_generale_province' => round($moyenneProvince, 2),
                    'communes' => $communes
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Erreur dans comparaisonCommunesProvince: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des données des communes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

  


   
}
