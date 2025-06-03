<?php
// Allow requests from localhost:3000
header("Access-Control-Allow-Origin: http://localhost:3000");
// Optional: allow cookies and other credentials
header("Access-Control-Allow-Credentials: true");
// Optional: allow specific methods
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
// Optional: allow specific headers
header("Access-Control-Allow-Headers: Content-Type, Authorization");
require __DIR__ . '/vendor/autoload.php';

use App\Core\App;

$app = new App();
