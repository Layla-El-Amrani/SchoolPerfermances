<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ResultatEleve;
use App\Models\AnneeScolaire;

class ResultatEleveSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Récupérer l'année scolaire active
        $anneeScolaire = AnneeScolaire::where('est_courante', true)->first();
        if (!$anneeScolaire) {
            $this->command->error('Aucune année scolaire active trouvée. Veuillez d\'abord créer une année scolaire.');
            return;
        }

        // Récupérer tous les élèves
        $eleves = \App\Models\Eleve::all();
        $matieres = \App\Models\Matiere::all();
        
        if ($eleves->isEmpty() || $matieres->isEmpty()) {
            $this->command->error('Aucun élève ou matière trouvé. Veuillez d\'abord exécuter les seeders EleveSeeder et MatiereSeeder.');
            return;
        }
        
        $resultats = [];
        
        // Pour chaque élève, créer des résultats dans plusieurs matières
        foreach ($eleves as $eleve) {
            // Choisir aléatoirement entre 3 et 5 matières par élève
            $nbMatieres = rand(3, min(5, $matieres->count()));
            $matieresAleatoires = $matieres->random($nbMatieres);
            
            foreach ($matieresAleatoires as $matiere) {
                // Générer des notes aléatoires réalistes
                $moyenCC = rand(10, 19) + (rand(0, 9) / 10); // Entre 10.0 et 19.9
                $moyenExam = rand(10, 19) + (rand(0, 9) / 10); // Entre 10.0 et 19.9
                $moyenSession = round(($moyenCC * 0.4) + ($moyenExam * 0.6), 1); // 40% CC + 60% Examen
                
                $resultats[] = [
                    'code_eleve' => $eleve->code_eleve,
                    'id_matiere' => $matiere->id_matiere,
                    'annee_scolaire' => $anneeScolaire->annee_scolaire,
                    'session' => '1ère session',
                    'MoyenNoteCC' => $moyenCC,
                    'MoyenExamenNote' => $moyenExam,
                    'MoyenCC' => $moyenCC,
                    'MoyenExam' => $moyenExam,
                    'MoyenSession' => $moyenSession
                ];
            }
        }

        foreach ($resultats as $resultat) {
            try {
                ResultatEleve::create($resultat);
                $this->command->info("Résultat créé avec succès pour l'élève {$resultat['code_eleve']} et la matière {$resultat['id_matiere']}");
            } catch (\Exception $e) {
                $this->command->error("Erreur lors de la création du résultat : " . $e->getMessage());
            }
        }

        $this->command->info('Résultats des élèves créés avec succès !');
    }
} 