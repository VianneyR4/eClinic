<?php

namespace App\OpenApi;

use OpenApi\Annotations as OA;

/**
 * @OA\Info(
 *   version="1.0.0",
 *   title="eClinic API",
 *   description="API documentation for eClinic backend. Secured endpoints typically require JWT Bearer tokens."
 * )
 *
 * @OA\Server(
 *   url="http://localhost:8000",
 *   description="Local server"
 * )
 *
 * @OA\SecurityScheme(
 *   securityScheme="bearerAuth",
 *   type="http",
 *   scheme="bearer",
 *   bearerFormat="JWT"
 * )
 */
class OpenApi {}
