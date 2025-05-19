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
use App\Http\Controllers\Api\ProvinceController;

// Routes publiques d'authentification
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
});

// Routes protégées, nécessitent authentification
Route::middleware('auth:sanctum')->group(function () {

    // Profil utilisateur
    Route::prefix('user')->group(function () {
        Route::get('/profile', [AuthController::class, 'profile']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::put('/password', [AuthController::class, 'updatePassword']);
        Route::put('/preferences', [AuthController::class, 'updatePreferences']);
    });

    // Dashboard et statistiques par province
    Route::prefix('province')->group(function () {
        Route::get('/stats/{annee_scolaire?}', [DashboardController::class, 'statsProvince']);
        Route::get('/evolution', [DashboardController::class, 'evolutionProvince']);
        Route::get('/top-etablissements/{annee_scolaire?}', [DashboardController::class, 'topEtablissementsParProvince']);
        Route::get('/cycles/{annee_scolaire}', [DashboardController::class, 'statsParCycle']);
        Route::get('/comparaison-communes/{id_province}/{annee_scolaire?}', [DashboardController::class, 'comparaisonCommunesProvince']);
    });

    // Communes
    Route::prefix('commune')->group(function () {
        Route::get('/communes', [CommuneController::class, 'getCommunes']);
        Route::get('/communes/{id}', [CommuneController::class, 'getCommune']);
        Route::get('/{id_commune}/stats/{annee_scolaire?}', [CommuneController::class, 'statCommune']);
        Route::get('/{id_commune}/evolution', [CommuneController::class, 'evolutionCommune']);
        Route::get('/{id_commune}/cycles/{annee_scolaire?}', [CommuneController::class, 'statsParCycle']);
        Route::get('/{id_commune}/top-etablissements/{annee_scolaire?}', [CommuneController::class, 'topEtablissements']);
        Route::get('/{id_commune}/evolution-cycles', [CommuneController::class, 'evolutionMoyennesParCycle']);
    });

    // Établissements
    Route::prefix('etablissement')->group(function () {
        Route::get('/', [EtablissementController::class, 'index']);
        Route::get('/{id_etablissement}', [EtablissementController::class, 'show']);
        Route::get('/commune/{code_commune}', [EtablissementController::class, 'getEtablissementsByCommune']);
        Route::get('/{id_etablissement}/stats/{annee_scolaire?}', [EtablissementController::class, 'statEtablissement']);
        Route::get('/{id_etablissement}/niveaux/{annee_scolaire?}/{code_niveau?}', [EtablissementController::class, 'statNiveau']);
        Route::get('/{id_etablissement}/matieres/{code_niveau}/{annee_scolaire?}', [EtablissementController::class, 'statMatiere']);
        Route::get('/{id_etablissement}/evolution', [EtablissementController::class, 'evaluationAnnuelle']);
    });

    // Provinces
    Route::get('/provinces', [ProvinceController::class, 'index']);

    // Rapports
    Route::prefix('rapports')->group(function () {
        Route::get('/', [RapportController::class, 'index']);
        Route::post('/generer', [RapportController::class, 'generate']);
        Route::get('/{id}/download', [RapportController::class, 'download']);
        Route::delete('/{id}', [RapportController::class, 'destroy']);

        Route::get('/etablissement/{id_etablissement}/{annee_scolaire?}', [RapportController::class, 'rapportEtablissement']);
        Route::get('/commune/{id_commune}/{annee_scolaire?}', [RapportController::class, 'rapportCommune']);
        Route::get('/province/{id_province}/{annee_scolaire?}', [RapportController::class, 'rapportProvince']);

        // Dashboard rapports
        Route::get('/dashboard/stats', [RapportController::class, 'getDashboardStats']);
        Route::get('/dashboard/performance', [RapportController::class, 'getPerformanceData']);
        Route::get('/dashboard/subjects', [RapportController::class, 'getSubjectDistribution']);
        Route::get('/dashboard/trends', [RapportController::class, 'getTrendData']);
    });

    // Importation
    Route::prefix('import')->group(function () {
        Route::get('/annees', [ImportController::class, 'getAnneesScolaires']);
        Route::post('/annee', [ImportController::class, 'addAnneeScolaire']);
        Route::post('/annee/select', [ImportController::class, 'selectAnneeScolaire']);
        Route::post('/resultats', [ImportController::class, 'importResultats']);
    });

    // Paramètres
    Route::prefix('parametres')->group(function () {
        Route::post('/password', [ParametreController::class, 'changePassword']);
        Route::post('/annee-active', [ParametreController::class, 'setAnneeActive']);
        Route::get('/annee-active', [ParametreController::class, 'getAnneeActive']);
    });

    // Années scolaires
    Route::prefix('annees-scolaires')->group(function () {
        Route::get('/', [AnneeScolaireController::class, 'index']);
        Route::post('/', [AnneeScolaireController::class, 'store']);
        Route::put('/{id}', [AnneeScolaireController::class, 'update']);
        Route::delete('/{id}', [AnneeScolaireController::class, 'destroy']);
        Route::post('/{id}/set-courante', [AnneeScolaireController::class, 'setCourante']);
    });

    // Route pour récupérer l'utilisateur connecté
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

});
