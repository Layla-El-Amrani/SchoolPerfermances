<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Etablissement;
use App\Models\Commune;
use App\Models\Province;
use App\Models\ResultatEleve;
use App\Models\Eleve;
use App\Models\NiveauScolaire;
use App\Models\Matiere;

class RapportController extends Controller
{
    public function rapportEtablissement($id_etablissement, $annee_scolaire = null)
    {
        // Récupérer l'établissement avec ses relations
        $etablissement = Etablissement::with(['commune.province'])->findOrFail($id_etablissement);

        // Statistiques générales
        $nombreEleves = Eleve::where('code_etab', $id_etablissement)
            ->when($annee_scolaire, function($query) use ($annee_scolaire) {
                $query->whereHas('resultats', function($q) use ($annee_scolaire) {
                    $q->where('annee_scolaire', $annee_scolaire);
                });
            })
            ->count();

        $moyenneGenerale = ResultatEleve::whereHas('eleve', function($query) use ($id_etablissement) {
            $query->where('code_etab', $id_etablissement);
        })
        ->when($annee_scolaire, function($query) use ($annee_scolaire) {
            $query->where('annee_scolaire', $annee_scolaire);
        })
        ->avg('MoyenSession');

        $totalResultats = ResultatEleve::whereHas('eleve', function($query) use ($id_etablissement) {
            $query->where('code_etab', $id_etablissement);
        })
        ->when($annee_scolaire, function($query) use ($annee_scolaire) {
            $query->where('annee_scolaire', $annee_scolaire);
        })
        ->count();

        $reussis = ResultatEleve::whereHas('eleve', function($query) use ($id_etablissement) {
            $query->where('code_etab', $id_etablissement);
        })
        ->when($annee_scolaire, function($query) use ($annee_scolaire) {
            $query->where('annee_scolaire', $annee_scolaire);
        })
        ->where('MoyenSession', '>=', 10)
        ->count();

        $tauxReussite = $totalResultats > 0 ? ($reussis / $totalResultats) * 100 : 0;

        // Statistiques par niveau
        $niveaux = NiveauScolaire::with(['eleves' => function($query) use ($id_etablissement) {
                $query->where('code_etab', $id_etablissement);
            }, 'matieres'])->get();
        $niveaux = $niveaux->filter(function($niveau) {
            return $niveau->eleves->isNotEmpty();
        });
        $statistiquesNiveaux = $niveaux->map(function($niveau) use ($id_etablissement, $annee_scolaire) {
            $moyenneNiveau = ResultatEleve::whereHas('eleve', function($query) use ($id_etablissement, $niveau) {
                $query->where('code_etab', $id_etablissement)
                    ->where('code_niveau', $niveau->code_niveau);
            })
            ->when($annee_scolaire, function($query) use ($annee_scolaire) {
                $query->where('annee_scolaire', $annee_scolaire);
            })
            ->avg('MoyenSession');

            $totalResultatsNiveau = ResultatEleve::whereHas('eleve', function($query) use ($id_etablissement, $niveau) {
                $query->where('code_etab', $id_etablissement)
                    ->where('code_niveau', $niveau->code_niveau);
            })
            ->when($annee_scolaire, function($query) use ($annee_scolaire) {
                $query->where('annee_scolaire', $annee_scolaire);
            })
            ->count();

            $reussisNiveau = ResultatEleve::whereHas('eleve', function($query) use ($id_etablissement, $niveau) {
                $query->where('code_etab', $id_etablissement)
                    ->where('code_niveau', $niveau->code_niveau);
            })
            ->when($annee_scolaire, function($query) use ($annee_scolaire) {
                $query->where('annee_scolaire', $annee_scolaire);
            })
            ->where('MoyenSession', '>=', 10)
            ->count();

            $tauxReussiteNiveau = $totalResultatsNiveau > 0 ? ($reussisNiveau / $totalResultatsNiveau) * 100 : 0;

            return [
                'niveau' => $niveau,
                'moyenne' => round($moyenneNiveau, 2),
                'taux_reussite' => round($tauxReussiteNiveau, 2)
            ];
        })->values();

        // Statistiques par matière
        $matieres = Matiere::with(['eleves' => function($query) use ($id_etablissement) {
                $query->where('code_etab', $id_etablissement);
            }, 'niveau'])->get();
        $matieres = $matieres->filter(function($matiere) {
            return $matiere->eleves->isNotEmpty();
        });
        $statistiquesMatieres = $matieres->map(function($matiere) use ($id_etablissement, $annee_scolaire) {
            $moyenneMatiere = ResultatEleve::whereHas('eleve', function($query) use ($id_etablissement) {
                $query->where('code_etab', $id_etablissement);
            })
            ->when($annee_scolaire, function($query) use ($annee_scolaire) {
                $query->where('annee_scolaire', $annee_scolaire);
            })
            ->avg($matiere->nom_colonne);

            return [
                'matiere' => $matiere->nom_matiere,
                'moyenne' => round($moyenneMatiere, 2)
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'etablissement' => $etablissement,
                'annee_scolaire' => $annee_scolaire,
                'statistiques_generales' => [
                    'nombre_eleves' => $nombreEleves,
                    'moyenne_generale' => round($moyenneGenerale, 2),
                    'taux_reussite' => round($tauxReussite, 2)
                ],
                'statistiques_niveaux' => $statistiquesNiveaux,
                'statistiques_matieres' => $statistiquesMatieres
            ]
        ]);
    }

    public function rapportCommune($id_commune, $annee_scolaire = null)
    {
        // Récupérer la commune avec ses relations
        $commune = Commune::with(['province'])->findOrFail($id_commune);

        // Statistiques générales
        $nombreEleves = Eleve::whereHas('etablissement', function($query) use ($id_commune) {
            $query->where('code_commune', $id_commune);
        })
        ->when($annee_scolaire, function($query) use ($annee_scolaire) {
            $query->whereHas('resultats', function($q) use ($annee_scolaire) {
                $q->where('annee_scolaire', $annee_scolaire);
            });
        })
        ->count();

        $moyenneGenerale = ResultatEleve::whereHas('eleve.etablissement', function($query) use ($id_commune) {
            $query->where('code_commune', $id_commune);
        })
        ->when($annee_scolaire, function($query) use ($annee_scolaire) {
            $query->where('annee_scolaire', $annee_scolaire);
        })
        ->avg('MoyenSession');

        $totalResultats = ResultatEleve::whereHas('eleve.etablissement', function($query) use ($id_commune) {
            $query->where('code_commune', $id_commune);
        })
        ->when($annee_scolaire, function($query) use ($annee_scolaire) {
            $query->where('annee_scolaire', $annee_scolaire);
        })
        ->count();

        $reussis = ResultatEleve::whereHas('eleve.etablissement', function($query) use ($id_commune) {
            $query->where('code_commune', $id_commune);
        })
        ->when($annee_scolaire, function($query) use ($annee_scolaire) {
            $query->where('annee_scolaire', $annee_scolaire);
        })
        ->where('MoyenSession', '>=', 10)
        ->count();

        $tauxReussite = $totalResultats > 0 ? ($reussis / $totalResultats) * 100 : 0;

        // Statistiques par établissement
        $etablissements = Etablissement::with(['eleves' => function($query) use ($id_commune) {
                $query->whereHas('etablissement', function($q) use ($id_commune) {
                    $q->where('code_commune', $id_commune);
                });
            }])->get();
        $etablissements = $etablissements->filter(function($etablissement) {
            return $etablissement->eleves->isNotEmpty();
        });
        $statistiquesEtablissements = $etablissements->map(function($etablissement) use ($annee_scolaire) {
            $moyenneEtablissement = ResultatEleve::whereHas('eleve', function($query) use ($etablissement) {
                $query->where('code_etab', $etablissement->code_etab);
            })
            ->when($annee_scolaire, function($query) use ($annee_scolaire) {
                $query->where('annee_scolaire', $annee_scolaire);
            })
            ->avg('MoyenSession');

            $totalResultatsEtablissement = ResultatEleve::whereHas('eleve', function($query) use ($etablissement) {
                $query->where('code_etab', $etablissement->code_etab);
            })
            ->when($annee_scolaire, function($query) use ($annee_scolaire) {
                $query->where('annee_scolaire', $annee_scolaire);
            })
            ->count();

            $reussisEtablissement = ResultatEleve::whereHas('eleve', function($query) use ($etablissement) {
                $query->where('code_etab', $etablissement->code_etab);
            })
            ->when($annee_scolaire, function($query) use ($annee_scolaire) {
                $query->where('annee_scolaire', $annee_scolaire);
            })
            ->where('MoyenSession', '>=', 10)
            ->count();

            $tauxReussiteEtablissement = $totalResultatsEtablissement > 0 ? ($reussisEtablissement / $totalResultatsEtablissement) * 100 : 0;

            return [
                'etablissement' => $etablissement->nom_etablissement,
                'moyenne' => round($moyenneEtablissement, 2),
                'taux_reussite' => round($tauxReussiteEtablissement, 2)
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'commune' => $commune,
                'annee_scolaire' => $annee_scolaire,
                'statistiques_generales' => [
                    'nombre_eleves' => $nombreEleves,
                    'moyenne_generale' => round($moyenneGenerale, 2),
                    'taux_reussite' => round($tauxReussite, 2)
                ],
                'statistiques_etablissements' => $statistiquesEtablissements
            ]
        ]);
    }

    public function rapportProvince($id_province, $annee_scolaire = null)
    {
        // Récupérer la province
        $province = Province::findOrFail($id_province);

        // Statistiques générales
        $nombreEleves = Eleve::whereHas('etablissement.commune', function($query) use ($id_province) {
            $query->where('id_province', $id_province);
        })
        ->when($annee_scolaire, function($query) use ($annee_scolaire) {
            $query->whereHas('resultats', function($q) use ($annee_scolaire) {
                $q->where('annee_scolaire', $annee_scolaire);
            });
        })
        ->count();

        $moyenneGenerale = ResultatEleve::whereHas('eleve.etablissement.commune', function($query) use ($id_province) {
            $query->where('id_province', $id_province);
        })
        ->when($annee_scolaire, function($query) use ($annee_scolaire) {
            $query->where('annee_scolaire', $annee_scolaire);
        })
        ->avg('MoyenSession');

        $totalResultats = ResultatEleve::whereHas('eleve.etablissement.commune', function($query) use ($id_province) {
            $query->where('id_province', $id_province);
        })
        ->when($annee_scolaire, function($query) use ($annee_scolaire) {
            $query->where('annee_scolaire', $annee_scolaire);
        })
        ->count();

        $reussis = ResultatEleve::whereHas('eleve.etablissement.commune', function($query) use ($id_province) {
            $query->where('id_province', $id_province);
        })
        ->when($annee_scolaire, function($query) use ($annee_scolaire) {
            $query->where('annee_scolaire', $annee_scolaire);
        })
        ->where('MoyenSession', '>=', 10)
        ->count();

        $tauxReussite = $totalResultats > 0 ? ($reussis / $totalResultats) * 100 : 0;

        // Statistiques par commune
        $communes = Commune::where('id_province', $id_province)->get();
        $statistiquesCommunes = $communes->map(function($commune) use ($annee_scolaire) {
            $moyenneCommune = ResultatEleve::whereHas('eleve.etablissement', function($query) use ($commune) {
                $query->where('code_commune', $commune->cd_com);
            })
            ->when($annee_scolaire, function($query) use ($annee_scolaire) {
                $query->where('annee_scolaire', $annee_scolaire);
            })
            ->avg('MoyenSession');

            $totalResultatsCommune = ResultatEleve::whereHas('eleve.etablissement', function($query) use ($commune) {
                $query->where('code_commune', $commune->cd_com);
            })
            ->when($annee_scolaire, function($query) use ($annee_scolaire) {
                $query->where('annee_scolaire', $annee_scolaire);
            })
            ->count();

            $reussisCommune = ResultatEleve::whereHas('eleve.etablissement', function($query) use ($commune) {
                $query->where('code_commune', $commune->cd_com);
            })
            ->when($annee_scolaire, function($query) use ($annee_scolaire) {
                $query->where('annee_scolaire', $annee_scolaire);
            })
            ->where('MoyenSession', '>=', 10)
            ->count();

            $tauxReussiteCommune = $totalResultatsCommune > 0 ? ($reussisCommune / $totalResultatsCommune) * 100 : 0;

            return [
                'commune' => [
                    'nom' => $commune->ll_com,
                    'code' => $commune->cd_com
                ],
                'moyenne' => round($moyenneCommune, 2),
                'taux_reussite' => round($tauxReussiteCommune, 2)
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'province' => $province,
                'annee_scolaire' => $annee_scolaire,
                'statistiques_generales' => [
                    'nombre_eleves' => $nombreEleves,
                    'moyenne_generale' => round($moyenneGenerale, 2),
                    'taux_reussite' => round($tauxReussite, 2)
                ],
                'statistiques_communes' => $statistiquesCommunes
            ]
        ]);
    }

    public function getDashboardStats()
    {
        // Récupérer l'année scolaire active
        $anneeActive = \App\Models\AnneeScolaire::where('est_courante', true)->first();
        $annee_scolaire = $anneeActive ? $anneeActive->annee_scolaire : null;

        // Statistiques générales
        $nombreEleves = Eleve::when($annee_scolaire, function($query) use ($annee_scolaire) {
            $query->whereHas('resultats', function($q) use ($annee_scolaire) {
                $q->where('annee_scolaire', $annee_scolaire);
            });
        })->count();

        $moyenneGenerale = ResultatEleve::when($annee_scolaire, function($query) use ($annee_scolaire) {
            $query->where('annee_scolaire', $annee_scolaire);
        })->avg('MoyenSession');

        $totalResultats = ResultatEleve::when($annee_scolaire, function($query) use ($annee_scolaire) {
            $query->where('annee_scolaire', $annee_scolaire);
        })->count();

        $reussis = ResultatEleve::when($annee_scolaire, function($query) use ($annee_scolaire) {
            $query->where('annee_scolaire', $annee_scolaire);
        })->where('MoyenSession', '>=', 10)->count();

        $tauxReussite = $totalResultats > 0 ? ($reussis / $totalResultats) * 100 : 0;

        // Trouver la meilleure matière
        $meilleureMatiere = Matiere::with(['resultats' => function($query) use ($annee_scolaire) {
            $query->when($annee_scolaire, function($q) use ($annee_scolaire) {
                $q->where('annee_scolaire', $annee_scolaire);
            });
        }])->get()->map(function($matiere) {
            $moyenne = $matiere->resultats->avg($matiere->nom_colonne);
            return [
                'matiere' => $matiere->nom_matiere,
                'moyenne' => $moyenne
            ];
        })->sortByDesc('moyenne')->first();

        return response()->json([
            'success' => true,
            'data' => [
                'totalStudents' => $nombreEleves,
                'averageScore' => round($moyenneGenerale, 2),
                'passRate' => round($tauxReussite, 2),
                'topPerformingSubject' => $meilleureMatiere ? $meilleureMatiere['matiere'] : 'N/A'
            ]
        ]);
    }

    public function getPerformanceData()
    {
        // Récupérer l'année scolaire active
        $anneeActive = \App\Models\AnneeScolaire::where('est_courante', true)->first();
        $annee_scolaire = $anneeActive ? $anneeActive->annee_scolaire : null;

        // Récupérer les données de performance par niveau
        $niveaux = NiveauScolaire::with(['resultats' => function($query) use ($annee_scolaire) {
            $query->when($annee_scolaire, function($q) use ($annee_scolaire) {
                $q->where('annee_scolaire', $annee_scolaire);
            });
        }])->get();

        $performanceData = $niveaux->map(function($niveau) {
            $moyenne = $niveau->resultats->avg('MoyenSession');
            $reussis = $niveau->resultats->where('MoyenSession', '>=', 10)->count();
            $total = $niveau->resultats->count();
            $tauxReussite = $total > 0 ? ($reussis / $total) * 100 : 0;

            return [
                'niveau' => $niveau->nom_niveau,
                'moyenne' => round($moyenne, 2),
                'tauxReussite' => round($tauxReussite, 2)
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $performanceData
        ]);
    }

    public function getSubjectDistribution()
    {
        // Récupérer l'année scolaire active
        $anneeActive = \App\Models\AnneeScolaire::where('est_courante', true)->first();
        $annee_scolaire = $anneeActive ? $anneeActive->annee_scolaire : null;

        // Récupérer la distribution des matières
        $matieres = Matiere::with(['resultats' => function($query) use ($annee_scolaire) {
            $query->when($annee_scolaire, function($q) use ($annee_scolaire) {
                $q->where('annee_scolaire', $annee_scolaire);
            });
        }])->get();

        $distribution = $matieres->map(function($matiere) {
            $moyenne = $matiere->resultats->avg($matiere->nom_colonne);
            return [
                'name' => $matiere->nom_matiere,
                'value' => round($moyenne, 2)
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $distribution
        ]);
    }

    public function getTrendData()
    {
        // Récupérer les 5 dernières années scolaires
        $annees = \App\Models\AnneeScolaire::orderBy('annee_scolaire', 'desc')
            ->take(5)
            ->pluck('annee_scolaire')
            ->reverse();

        $trendData = $annees->map(function($annee) {
            $moyenne = ResultatEleve::where('annee_scolaire', $annee)
                ->avg('MoyenSession');

            $totalResultats = ResultatEleve::where('annee_scolaire', $annee)->count();
            $reussis = ResultatEleve::where('annee_scolaire', $annee)
                ->where('MoyenSession', '>=', 10)
                ->count();
            $tauxReussite = $totalResultats > 0 ? ($reussis / $totalResultats) * 100 : 0;

            return [
                'name' => $annee,
                'moyenne' => round($moyenne, 2),
                'reussite' => round($tauxReussite, 2)
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $trendData
        ]);
    }
    public function generate(Request $request)
    {
        return response()->json([
            'message' => 'Rapport généré avec succès',
        ]);
    }
}
