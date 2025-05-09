<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Parametre extends Model
{
    protected $table = 'parametres';
    
    protected $fillable = [
        'cle',
        'valeur',
        'description'
    ];

    public $timestamps = true;
} 