<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\CommuneController;
use App\Http\Controllers\Api\EtablissementController;
use App\Http\Controllers\Api\ImportController;
use App\Http\Controllers\Api\RapportController;
use App\Http\Controllers\Api\ParametreController;
use App\Http\Controllers\Api\AnneeScolaireController;

// Routes API d'authentification
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
});

// Routes API pour les statistiques province
Route::prefix('province')->group(function () {
    Route::get('/stats{annee_scolaire?}', [DashboardController::class, 'statsProvince']);
    Route::get('/evolution', [DashboardController::class, 'evolutionProvince']);
    Route::get('/top-etablissements/{annee_scolaire?}', [DashboardController::class, 'topEtablissementsParProvince']);
    Route::get('/cycles/{annee_scolaire}', [DashboardController::class, 'statsParCycle']);
    Route::get('/comparaison-communes/{id_province}/{annee_scolaire?}', [DashboardController::class, 'comparaisonCommunesProvince']);
  
});

// Routes API pour les communes
Route::prefix('commune')->group(function () {
    // Get all communes for selection
    Route::get('/communes', [CommuneController::class, 'getCommunes']);
    // Get single commune details
    Route::get('/communes/{id}', [CommuneController::class, 'getCommune']);
    // Get commune statistics
    Route::get('/{id_commune}/stats/{annee_scolaire?}', [CommuneController::class, 'statCommune']);
    // Get commune evolution
    Route::get('/{id_commune}/evolution', [CommuneController::class, 'evolutionCommune']);
    // Get statistics by cycle for a specific commune
    Route::get('/{id_commune}/cycles/{annee_scolaire?}', [CommuneController::class, 'statsParCycle']);
    // Get establishment statistics by cycle for a specific commune
    Route::get('/{id_commune}/stats/cycles/{annee_scolaire?}', [CommuneController::class, 'getStatsParCycle']);
    // Get top 3 establishments for a specific commune
    Route::get('/{id_commune}/top-etablissements/{annee_scolaire?}', [CommuneController::class, 'topEtablissements']);
    // Get evolution of averages by cycle for a specific commune
    Route::get('/{id_commune}/evolution-cycles', [CommuneController::class, 'evolutionMoyennesParCycle']);
});

// Routes API pour les établissements
Route::prefix('etablissement')->group(function () {
    // Récupérer tous les établissements
    Route::get('/', [EtablissementController::class, 'index']);
    // Récupérer les détails d'un établissement
    Route::get('/{id_etablissement}', [EtablissementController::class, 'show']);
    // Récupérer les établissements par commune
    Route::get('/commune/{code_commune}', [EtablissementController::class, 'getEtablissementsByCommune']);
    Route::get('/{id_etablissement}/stats/{annee_scolaire?}', [EtablissementController::class, 'statEtablissement']);
    Route::get('/{id_etablissement}/niveaux/{annee_scolaire?}/{code_niveau?}', [EtablissementController::class, 'statNiveau']);
    Route::get('/{id_etablissement}/matieres/{code_niveau}/{annee_scolaire?}', [EtablissementController::class, 'statMatiere']);

// Routes API pour les provinces
Route::get('/provinces', [\App\Http\Controllers\Api\ProvinceController::class, 'index']);

// Routes API pour les rapports
Route::prefix('rapports')->group(function () {
    // Récupérer la liste des rapports
    Route::get('/', [RapportController::class, 'index']);
    // Générer un nouveau rapport
    Route::post('/generer', [RapportController::class, 'generate']);
    // Télécharger un rapport existant
    Route::get('/{id}/download', [RapportController::class, 'download']);
    // Supprimer un rapport
    Route::delete('/{id}', [RapportController::class, 'destroy']);
});
    Route::get('/{id_etablissement}/evolution', [EtablissementController::class, 'evaluationAnnuelle']);
});

// Routes API pour les rapports
Route::prefix('rapports')->group(function () {
    Route::get('/etablissement/{id_etablissement}/{annee_scolaire?}', [RapportController::class, 'rapportEtablissement']);
    Route::get('/commune/{id_commune}/{annee_scolaire?}', [RapportController::class, 'rapportCommune']);
    Route::get('/province/{id_province}/{annee_scolaire?}', [RapportController::class, 'rapportProvince']);
});

// Route API pour l'importation
Route::prefix('import')->group(function () {
    Route::get('/annees', [ImportController::class, 'getAnneesScolaires']);
    Route::post('/annee', [ImportController::class, 'addAnneeScolaire']);
    Route::post('/annee/select', [ImportController::class, 'selectAnneeScolaire']);
    Route::post('/resultats', [ImportController::class, 'importResultats']);
});

// Routes API protégées (nécessite authentification)


    // Routes pour les paramètres
    Route::prefix('parametres')->group(function () {
        Route::post('/password', [ParametreController::class, 'changePassword']);
        Route::post('/annee-active', [ParametreController::class, 'setAnneeActive']);
        Route::get('/annee-active', [ParametreController::class, 'getAnneeActive']);
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', function (Request $request) {
            return $request->user();
        });
    });

// Routes API pour les années scolaires
Route::prefix('annees-scolaires')->group(function () {
    Route::get('/', [AnneeScolaireController::class, 'index']);
    Route::post('/', [AnneeScolaireController::class, 'store']);
    Route::put('/{id}', [AnneeScolaireController::class, 'update']);
    Route::delete('/{id}', [AnneeScolaireController::class, 'destroy']);
    Route::post('/{id}/set-courante', [AnneeScolaireController::class, 'setCourante']);
});
