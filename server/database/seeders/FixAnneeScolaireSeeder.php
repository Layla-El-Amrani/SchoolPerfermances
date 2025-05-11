<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AnneeScolaire;
use App\Models\ResultatEleve;

class FixAnneeScolaireSeeder extends Seeder
{
    public function run(): void
    {
        // Corriger l'année scolaire courante
        $anneeScolaire = AnneeScolaire::where('est_courante', true)->first();
        
        if ($anneeScolaire) {
            // Nettoyer la chaîne de l'année scolaire
            $anneePropre = trim(preg_replace('/\s+/', '', $anneeScolaire->annee_scolaire));
            
            // Mettre à jour l'année scolaire
            $anneeScolaire->update(['annee_scolaire' => $anneePropre]);
            
            $this->command->info("Année scolaire corrigée : " . $anneePropre);
            
            // Mettre à jour les résultats des élèves
            $updated = ResultatEleve::where('annee_scolaire', 'like', '%2025%')
                                 ->update(['annee_scolaire' => $anneePropre]);
                                 
            $this->command->info("$updated résultats d'élèves mis à jour");
        } else {
            $this->command->error('Aucune année scolaire courante trouvée');
        }
    }
}
