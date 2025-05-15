<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Commune;
use App\Models\Etablissement;
use App\Models\Eleve;
use App\Models\ResultatEleve;
use App\Models\NiveauScolaire;
use App\Models\AnneeScolaire;
use Illuminate\Support\Facades\DB;

class CommuneController extends Controller
{


  

    /**
     * Get all communes for selection
     */
    public function getCommunes()
    {
        $communes = Commune::with('province')->get();
        return response()->json([
            'success' => true,
            'communes' => $communes
        ]);
    }

    /**
     * Get a single commune by ID
     */
    public function getCommune($id)
    {
        $commune = Commune::with('province')->find($id);
        
        if (!$commune) {
            return response()->json([
                'success' => false,
                'message' => 'Commune non trouvée'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $commune
        ]);
    }

    public function statCommune($id_commune, $annee_scolaire = null)
    {
        // Get the active academic year if none is provided
        if (!$annee_scolaire) {
            $anneeScolaire = AnneeScolaire::where('est_courante', true)->first();
            if ($anneeScolaire) {
                $annee_scolaire = $anneeScolaire->annee_scolaire;
            }
        }

        // Récupérer la commune
        $commune = Commune::with('province')->findOrFail($id_commune);

        // Calculer les statistiques
        $nombreEleves = ResultatEleve::join('eleve', 'resultat_eleve.code_eleve', '=', 'eleve.code_eleve')
            ->join('etablissement', 'eleve.code_etab', '=', 'etablissement.code_etab')
            ->where('etablissement.code_commune', $id_commune)
            ->when($annee_scolaire, function($query) use ($annee_scolaire) {
                $query->where('resultat_eleve.annee_scolaire', $annee_scolaire);
            })
            ->distinct()
            ->count('eleve.code_eleve');

        $moyenneGenerale = ResultatEleve::join('eleve', 'resultat_eleve.code_eleve', '=', 'eleve.code_eleve')
            ->join('etablissement', 'eleve.code_etab', '=', 'etablissement.code_etab')
            ->where('etablissement.code_commune', $id_commune)
            ->when($annee_scolaire, function($query) use ($annee_scolaire) {
                $query->where('resultat_eleve.annee_scolaire', $annee_scolaire);
            })
            ->avg('resultat_eleve.MoyenSession') ?? 0;

        $totalResultats = ResultatEleve::join('eleve', 'resultat_eleve.code_eleve', '=', 'eleve.code_eleve')
            ->join('etablissement', 'eleve.code_etab', '=', 'etablissement.code_etab')
            ->where('etablissement.code_commune', $id_commune)
            ->when($annee_scolaire, function($query) use ($annee_scolaire) {
                $query->where('resultat_eleve.annee_scolaire', $annee_scolaire);
            })
            ->count();

        $reussis = ResultatEleve::join('eleve', 'resultat_eleve.code_eleve', '=', 'eleve.code_eleve')
            ->join('etablissement', 'eleve.code_etab', '=', 'etablissement.code_etab')
            ->where('etablissement.code_commune', $id_commune)
            ->when($annee_scolaire, function($query) use ($annee_scolaire) {
                $query->where('resultat_eleve.annee_scolaire', $annee_scolaire);
            })
            ->where('resultat_eleve.MoyenSession', '>=', 10)
            ->count();

        $tauxReussite = $totalResultats > 0 ? ($reussis / $totalResultats) * 100 : 0;
        $tauxEchec = 100 - $tauxReussite;

        // Calculer le rang de l'établissement dans la province
        $rangEtablissement = ResultatEleve::join('eleve', 'resultat_eleve.code_eleve', '=', 'eleve.code_eleve')
            ->join('etablissement', 'eleve.code_etab', '=', 'etablissement.code_etab')
            ->where('etablissement.code_commune', $id_commune)
            ->when($annee_scolaire, function($query) use ($annee_scolaire) {
                $query->where('resultat_eleve.annee_scolaire', $annee_scolaire);
            })
            ->select('etablissement.code_etab as id_etablissement')
            ->selectRaw('AVG(resultat_eleve.MoyenSession) as moyenne')
            ->groupBy('etablissement.code_etab')
            ->orderByDesc('moyenne')
            ->get()
            ->search(function($item) use ($id_commune) {
                return $item->id_etablissement == $id_commune;
            });

        // Compter le nombre d'établissements dans la commune
        $nombreEtablissements = \App\Models\Etablissement::where('code_commune', $id_commune)
            ->when($annee_scolaire, function($query) use ($annee_scolaire) {
                $query->whereHas('eleves.resultats', function($q) use ($annee_scolaire) {
                    $q->where('annee_scolaire', $annee_scolaire);
                });
            })
            ->count();

        // Calculer le rang de la commune dans sa province
        $rangCommune = ResultatEleve::join('eleve', 'resultat_eleve.code_eleve', '=', 'eleve.code_eleve')
            ->join('etablissement', 'eleve.code_etab', '=', 'etablissement.code_etab')
            ->join('commune', 'etablissement.code_commune', '=', 'commune.cd_com')
            ->where('commune.id_province', $commune->id_province)
            ->when($annee_scolaire, function($query) use ($annee_scolaire) {
                $query->where('resultat_eleve.annee_scolaire', $annee_scolaire);
            })
            ->select('commune.cd_com as id_commune')
            ->selectRaw('AVG(resultat_eleve.MoyenSession) as moyenne')
            ->groupBy('commune.cd_com')
            ->orderByDesc('moyenne')
            ->get()
            ->search(function($item) use ($id_commune) {
                return $item->id_commune == $id_commune;
            });

        return response()->json([
            'success' => true,
            'data' => [
                'statistiques' => [
                    'nombre_eleves' => $nombreEleves,
                    'nombre_etablissements' => $nombreEtablissements,
                    'moyenne_generale' => round($moyenneGenerale, 2),
                    'taux_reussite' => round($tauxReussite, 2),
                    'taux_echec' => round($tauxEchec, 2),
                    'rang_province' => $rangCommune !== false ? $rangCommune + 1 : null,
                    'rang_etablissement_province' => $rangEtablissement !== false ? $rangEtablissement + 1 : null
                ]
            ]
        ]);
    }

    public function getClassementEtablissements($id_commune, $annee_scolaire)
    {
        return ResultatEleve::join('eleve', 'resultat_eleve.code_eleve', '=', 'eleve.code_eleve')
            ->join('etablissement', 'eleve.code_etab', '=', 'etablissement.code_etab')
            ->where('etablissement.code_commune', $id_commune)
            ->when($annee_scolaire, function($query) use ($annee_scolaire) {
                $query->where('resultat_eleve.annee_scolaire', $annee_scolaire);
            })
            ->select('etablissement.code_etab as id_etablissement')
            ->select('etablissement.nom_etab_fr as nom_etablissement')
            ->selectRaw('COUNT(DISTINCT eleve.code_eleve) as nombre_eleves')
            ->selectRaw('AVG(resultat_eleve.MoyenSession) as moyenne_generale')
            ->selectRaw('COUNT(CASE WHEN resultat_eleve.MoyenSession >= 10 THEN 1 END) * 100.0 / COUNT(*) as taux_reussite')
            ->groupBy('etablissement.code_etab', 'etablissement.nom_etab_fr')
            ->orderByDesc('moyenne_generale')
            ->get()
            ->map(function($etablissement, $index) {
                return [
                    'rang' => $index + 1,
                    'id' => $etablissement->id_etablissement,
                    'nom' => $etablissement->nom_etablissement,
                    'nombre_eleves' => $etablissement->nombre_eleves,
                    'moyenne_generale' => round($etablissement->moyenne_generale, 2),
                    'taux_reussite' => round($etablissement->taux_reussite, 2)
                ];
            });
    }

    public function evolutionCommune($id_commune)
    {
        // Récupérer la commune
        $commune = Commune::with(['province'])->findOrFail($id_commune);

        // Récupérer toutes les années scolaires distinctes disponibles dans la base de données
        $toutesAnneesScolaires = \DB::table('resultat_eleve')
            ->select('annee_scolaire')
            ->distinct()
            ->orderBy('annee_scolaire')
            ->pluck('annee_scolaire');

        // Si aucune année n'est trouvée, retourner un tableau vide
        if ($toutesAnneesScolaires->isEmpty()) {
            return response()->json([
                'success' => true,
                'data' => [
                    'commune' => [
                        'id' => $commune->cd_com,
                        'nom' => $commune->la_com,
                        'province' => $commune->province->nom_province
                    ],
                    'evolution' => []
                ]
            ]);
        }


        // Initialiser un tableau pour stocker toutes les années avec leurs statistiques
        $toutesAnneesAvecStats = collect();

        // Récupérer toutes les statistiques pour cette commune en une seule requête
        $statsParAnnee = ResultatEleve::join('eleve', 'resultat_eleve.code_eleve', '=', 'eleve.code_eleve')
            ->join('etablissement', 'eleve.code_etab', '=', 'etablissement.code_etab')
            ->where('etablissement.code_commune', $id_commune)
            ->select(
                'resultat_eleve.annee_scolaire',
                DB::raw('AVG(resultat_eleve.MoyenSession) as moyenne_generale'),
                DB::raw('COUNT(DISTINCT eleve.code_eleve) as nombre_eleves'),
                DB::raw('SUM(CASE WHEN resultat_eleve.MoyenSession >= 10 THEN 1 ELSE 0 END) as nombre_reussis'),
                DB::raw('COUNT(*) as total_resultats')
            )
            ->groupBy('resultat_eleve.annee_scolaire')
            ->get()
            ->keyBy('annee_scolaire');

        // Pour chaque année scolaire, récupérer ou initialiser les statistiques
        foreach ($toutesAnneesScolaires as $annee) {
            $stats = $statsParAnnee->get($annee);
            
            // Initialiser les valeurs par défaut
            $tauxReussite = 0;
            $tauxEchec = 0;
            $moyenne = 0;
            $nombreEleves = 0;
            $totalResultats = 0;

            // Si des statistiques sont trouvées pour cette année, les utiliser
            if ($stats) {
                if ($stats->total_resultats > 0) {
                    $tauxReussite = round(($stats->nombre_reussis / $stats->total_resultats) * 100, 2);
                    $tauxEchec = 100 - $tauxReussite;
                    $moyenne = round($stats->moyenne_generale, 2);
                }
                $nombreEleves = $stats->nombre_eleves;
                $totalResultats = $stats->total_resultats;
            }

            // Ajouter les statistiques pour cette année
            $toutesAnneesAvecStats->push([
                'annee_scolaire' => $annee,
                'moyenne_generale' => $moyenne,
                'taux_reussite' => $tauxReussite,
                'taux_echec' => $tauxEchec,
                'nombre_eleves' => $nombreEleves,
                'total_resultats' => $totalResultats
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'commune' => [
                    'id' => $commune->cd_com,
                    'nom' => $commune->la_com,
                    'province' => $commune->province->nom_province
                ],
                'evolution' => $toutesAnneesAvecStats
            ]
        ]);
    }

 

      /**
     * Get statistics by cycle for a specific commune
     */
    /**
     * Get evolution of averages by cycle for a specific commune
     */
    public function evolutionMoyennesParCycle($id_commune)
    {
        try {
            // Get all academic years with results for this commune
            $anneesScolaires = ResultatEleve::join('eleve', 'resultat_eleve.code_eleve', '=', 'eleve.code_eleve')
                ->join('etablissement', 'eleve.code_etab', '=', 'etablissement.code_etab')
                ->where('etablissement.code_commune', $id_commune)
                ->select('resultat_eleve.annee_scolaire')
                ->distinct()
                ->orderBy('resultat_eleve.annee_scolaire')
                ->pluck('annee_scolaire');

            // Get all cycles that exist in this commune
            $cycles = Etablissement::where('code_commune', $id_commune)
                ->select('cycle')
                ->distinct()
                ->pluck('cycle');

            // Initialize result array
            $result = [
                'labels' => $anneesScolaires->toArray(),
                'datasets' => []
            ];

            // Define colors for each cycle
            $colors = [
                ['border' => 'rgba(54, 162, 235, 1)', 'background' => 'rgba(54, 162, 235, 0.2)'],
                ['border' => 'rgba(255, 99, 132, 1)', 'background' => 'rgba(255, 99, 132, 0.2)'],
                ['border' => 'rgba(75, 192, 192, 1)', 'background' => 'rgba(75, 192, 192, 0.2)'],
                ['border' => 'rgba(255, 205, 86, 1)', 'background' => 'rgba(255, 205, 86, 0.2)'],
                ['border' => 'rgba(153, 102, 255, 1)', 'background' => 'rgba(153, 102, 255, 0.2)'],
            ];

            // For each cycle, get the average for each year
            foreach ($cycles as $index => $cycle) {
                $moyennes = [];
                
                foreach ($anneesScolaires as $annee) {
                    $moyenne = ResultatEleve::join('eleve', 'resultat_eleve.code_eleve', '=', 'eleve.code_eleve')
                        ->join('etablissement', 'eleve.code_etab', '=', 'etablissement.code_etab')
                        ->where('etablissement.code_commune', $id_commune)
                        ->where('etablissement.cycle', $cycle)
                        ->where('resultat_eleve.annee_scolaire', $annee)
                        ->avg('resultat_eleve.MoyenSession');
                    
                    $moyennes[] = $moyenne ? round($moyenne, 2) : null;
                }

                
                $colorIndex = $index % count($colors);
                
                $result['datasets'][] = [
                    'label' => 'Cycle ' . $cycle,
                    'data' => $moyennes,
                    'borderColor' => $colors[$colorIndex]['border'],
                    'backgroundColor' => $colors[$colorIndex]['background'],
                    'tension' => 0.3,
                    'fill' => false,
                    'pointBackgroundColor' => $colors[$colorIndex]['border'],
                    'pointBorderColor' => '#fff',
                    'pointHoverBackgroundColor' => '#fff',
                    'pointHoverBorderColor' => $colors[$colorIndex]['border'],
                    'pointRadius' => 4,
                    'pointHoverRadius' => 6
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $result
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de l\'évolution des moyennes par cycle',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get statistics by cycle for a specific commune
     */
    public function statsParCycle($id_commune, $annee_scolaire = null)
    {
        try {
            // Get the active academic year if none is provided
            if (!$annee_scolaire) {
                $anneeScolaire = AnneeScolaire::where('est_courante', true)->first();
                if ($anneeScolaire) {
                    $annee_scolaire = $anneeScolaire->annee_scolaire;
                }
            }

            // Get all cycles in the commune with establishment count
            $cyclesQuery = Etablissement::where('code_commune', $id_commune);
            
            // If year is specified, only count establishments with results that year
            if ($annee_scolaire) {
                $cyclesQuery->whereHas('resultats', function($q) use ($annee_scolaire) {
                    $q->where('annee_scolaire', $annee_scolaire);
                });
            }
            
            $cycles = $cyclesQuery->select('cycle', DB::raw('COUNT(*) as nb_etablissements'))
                                ->groupBy('cycle')
                                ->pluck('nb_etablissements', 'cycle');

            // If no cycles found, return empty result
            if ($cycles->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'data' => []
                ]);
            }

            // Get statistics by cycle
            $resultats = collect();
            
            foreach ($cycles as $cycle => $nbEtablissements) {
                $query = ResultatEleve::join('eleve', 'resultat_eleve.code_eleve', '=', 'eleve.code_eleve')
                    ->join('etablissement', 'eleve.code_etab', '=', 'etablissement.code_etab')
                    ->where('etablissement.code_commune', $id_commune)
                    ->where('etablissement.cycle', $cycle);

                if ($annee_scolaire) {
                    $query->where('resultat_eleve.annee_scolaire', $annee_scolaire);
                }

                $nombreEleves = (clone $query)->distinct('eleve.code_eleve')->count('eleve.code_eleve');
                
                $moyenneGenerale = (clone $query)->avg('resultat_eleve.MoyenSession') ?? 0;
                
                $totalResultats = (clone $query)->count();
                
                $reussis = (clone $query)->where('resultat_eleve.MoyenSession', '>=', 10)->count();
                
                $tauxReussite = $totalResultats > 0 ? ($reussis / $totalResultats) * 100 : 0;

                $resultats->push([
                    'cycle' => $cycle,
                    'nb_etablissements' => $nbEtablissements,
                    'nombre_eleves' => $nombreEleves,
                    'moyenne_generale' => round($moyenneGenerale, 2),
                    'taux_reussite' => round($tauxReussite, 2)
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => $resultats->toArray()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du calcul des statistiques par cycle',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get statistics of establishments by cycle for a commune
     */
    /**
     * Get top 3 establishments by average score for a specific commune
     */
    public function topEtablissements($id_commune, $annee_scolaire = null)
    {
        try {
            // Get the active academic year if none is provided
            if (!$annee_scolaire) {
                $anneeScolaire = AnneeScolaire::where('est_courante', true)->first();
                if ($anneeScolaire) {
                    $annee_scolaire = $anneeScolaire->annee_scolaire;
                }
            }

            $topEtablissements = Etablissement::select(
                    'etablissement.code_etab',
                    'etablissement.nom_etab_fr as nom_etablissement',
                    'etablissement.cycle',
                    DB::raw('COUNT(DISTINCT eleve.code_eleve) as nombre_eleves'),
                    DB::raw('AVG(resultat_eleve.MoyenSession) as moyenne_generale'),
                    DB::raw('(COUNT(CASE WHEN resultat_eleve.MoyenSession >= 10 THEN 1 END) * 100.0 / COUNT(*)) as taux_reussite')
                )
                ->join('eleve', 'etablissement.code_etab', '=', 'eleve.code_etab')
                ->join('resultat_eleve', 'eleve.code_eleve', '=', 'resultat_eleve.code_eleve')
                ->where('etablissement.code_commune', $id_commune)
                ->when($annee_scolaire, function($query) use ($annee_scolaire) {
                    $query->where('resultat_eleve.annee_scolaire', $annee_scolaire);
                })
                ->groupBy('etablissement.code_etab', 'etablissement.nom_etab_fr', 'etablissement.cycle')
                ->orderByDesc('moyenne_generale')
                ->take(3)
                ->get()
                ->map(function($etab, $index) {
                    return [
                        'rang' => $index + 1,
                        'id' => $etab->code_etab,
                        'nom' => $etab->nom_etablissement,
                        'moyenne_generale' => round($etab->moyenne_generale, 2),
                        'taux_reussite' => round($etab->taux_reussite, 2),
                        'nombre_eleves' => $etab->nombre_eleves,
                        'cycle' => $etab->cycle
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $topEtablissements
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du classement des établissements',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getStatsParCycle($id, $anneeScolaireId = null)
    {
        try {
            // Si aucune année scolaire n'est spécifiée, on prend l'année en cours
            if (!$anneeScolaireId) {
                $anneeScolaire = AnneeScolaire::where('est_courante', true)->first();
                
                if (!$anneeScolaire) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Aucune année scolaire active trouvée'
                    ], 404);
                }
                
                $anneeScolaireId = $anneeScolaire->id;
            }

            // Récupérer la commune
            $commune = Commune::find($id);
            
            if (!$commune) {
                return response()->json([
                    'success' => false,
                    'message' => 'Commune non trouvée'
                ], 404);
            }
            
            // Récupérer la répartition des établissements par cycle
            $cycles = DB::table('etablissement')
                ->select(
                    'cycle',
                    DB::raw('COUNT(*) as nombre_etablissements')
                )
                ->where('code_commune', $id)
                ->groupBy('cycle')
                ->orderBy('cycle')
                ->get();
                
            return response()->json([
                'success' => true,
                'data' => [
                    'commune' => [
                        'id' => $commune->code_commune,
                        'nom' => $commune->nom,
                        'code' => $commune->code_commune
                    ],
                    'annee_scolaire_id' => $anneeScolaireId,
                    'cycles' => $cycles
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statistiques par cycle',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

