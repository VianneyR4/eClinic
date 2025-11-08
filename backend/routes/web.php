<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'eClinic API',
        'version' => '1.0.0',
    ]);
});

