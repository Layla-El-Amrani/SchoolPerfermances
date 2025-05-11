<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Eleve;
use App\Models\Etablissement;
use App\Models\NiveauScolaire;
use Faker\Factory as Faker;

class EleveSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Récupérer tous les établissements
        $etablissements = Etablissement::all();
        
        if ($etablissements->isEmpty()) {
            $this->command->error("Aucun établissement trouvé dans la base de données.");
            return;
        }
        
        $niveaux = NiveauScolaire::all();
        
        if ($niveaux->isEmpty()) {
            $this->command->error("Aucun niveau scolaire trouvé dans la base de données.");
            return;
        }
        
        $niveauxArray = $niveaux->pluck('code_niveau')->toArray();
        
        $totalEleves = 0;
        $compteurEleve = 1;
        
        foreach ($etablissements as $etablissement) {
            $this->command->info("Création d'élèves pour l'établissement: " . $etablissement->code_etab . ' - ' . $etablissement->nom_etab_fr);
            
            // Nombre d'élèves à créer par établissement (entre 5 et 15)
            $nbEleves = rand(5, 15);
            
            for ($i = 1; $i <= $nbEleves; $i++) {
                try {
                    // Générer un code élève unique
                    $codeEleve = 'ELEVE' . str_pad($compteurEleve, 8, '0', STR_PAD_LEFT);
                    
                    // Choisir un niveau aléatoire
                    $niveau = $niveauxArray[array_rand($niveauxArray)];
                    
                    // Créer l'élève
                    Eleve::create([
                        'code_eleve' => $codeEleve,
                        'nom_eleve_ar' => 'طالب ' . $compteurEleve,
                        'prenom_eleve_ar' => 'تلميذ ' . $compteurEleve,
                        'code_etab' => $etablissement->code_etab,
                        'code_niveau' => $niveau
                    ]);
                    
                    $totalEleves++;
                    $compteurEleve++;
                    
                } catch (\Exception $e) {
                    $this->command->error("Erreur lors de la création d'un élève: " . $e->getMessage());
                }
            }
        }
        
        $this->command->info("Création terminée. $totalEleves élèves ont été créés dans " . $etablissements->count() . " établissements.");
    }
}
