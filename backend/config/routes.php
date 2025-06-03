<?php

namespace App\Config;

use App\Core\Router;

use App\Controller\NewController;
return function (Router $routes): void {
    # $routes->add($name,$path)->controller($CLASS,$method)
    // $routes->add("nisan", '/home')->controller(NewController::class, 'phpInfo');
};
