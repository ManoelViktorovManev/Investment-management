<?php

namespace App\Controller;

use App\Core\BaseController;
use App\Model\Stock;
use App\Core\Route;
use App\Core\DbManipulation;
use App\Core\Response;

class CurrencyExhangeRateController extends BaseController
{
    #[Route('/createNewCurrencyRate', methods:["POST"])]
    public function createNewCurrencyRate()
    {
        $db = new DbManipulation();
        $data = json_decode(file_get_contents("php://input"), true);

        if (!array_key_exists('name', $data) || !array_key_exists('price', $data) || !array_key_exists('shares', $data) || !array_key_exists('currency', $data) ){
            return new Response("Can`t create a new Stock. Missing information",404);
        }

        $stock = new Stock(null,$data["name"],$data["price"],$data["shares"], $data["currency"]); 
        $db->add($stock);
        $db->commit();

        return new Response("Successfuly insert a new record");
    }

}