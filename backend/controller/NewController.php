<?php

namespace App\Controller;

use App\Core\BaseController;
use App\Core\Route;
use App\Core\Response;

class NewController extends BaseController
{
    #[Route('/asdf')]
    public function testingNormalResponse()
    {
        // Example response
        return new Response('Test text');
    }
}
