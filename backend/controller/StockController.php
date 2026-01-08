<?php

namespace App\Controller;

use App\Core\BaseController;
use App\Model\Stock;
use App\Core\Route;
use App\Core\DbManipulation;
use App\Core\Response;

class StockController extends BaseController
{
    #[Route('/createStock', methods:["POST"])]
    public function createStock()
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
    #[Route('/getStocks')]
    public function getStock()
    {
        $information = new Stock()->query()->all(); 
        return $this->json($information);
    }
    #[Route('/deleteStock', methods:["POST"])]
    public function deleteStock()
    {
        $db = new DbManipulation();
        $data = json_decode(file_get_contents("php://input"), true);

        if (!array_key_exists('id', $data) ){
            return new Response("Can`t delete Stock. Missing information",404);
        }

        $stock = new Stock();
        $stock = $stock->query()->where("id","=",$data["id"])->first();
        $db->delete($stock);
        $db->commit();

        return new Response("Successfuly deleted a record");
    }

    #[Route('/updateStock', methods:["POST"])]
    public function updateStock()
    {
        $db = new DbManipulation();
        $data = json_decode(file_get_contents("php://input"), true);

        if (!array_key_exists('id', $data) ){
            return new Response("Can`t update Stock. Missing information",404);
        }
        
        $stock = new Stock();
        $stock->query()->where("id","=",$data["id"])->first();

        if (array_key_exists('price', $data)){
            $stock->setPrice($data["price"]);
        }
        if (array_key_exists('shares', $data)){
            $stock->setNumberOfShares($data["shares"]);
        }
        $db->add($stock);
        $db->commit();

        return new Response("Successfuly insert a new record");
    }

}