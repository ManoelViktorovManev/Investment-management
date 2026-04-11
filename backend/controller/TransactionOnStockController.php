<?php

namespace App\Controller;

use App\Core\BaseController;
use App\Core\Route;
use App\Core\DbManipulation;
use App\Core\Response;
use App\Model\TransactionOnStock;
use App\Model\Stock;

class TransactionOnStockController extends BaseController
{
    #[Route('/addStockTransaction', methods:["POST"])]
    public function createNewCurrencyRate()
    {
        $db = new DbManipulation();
        $data = json_decode(file_get_contents("php://input"), true);

        if (!array_key_exists('type', $data) || !array_key_exists('stockId', $data) || !array_key_exists('quantity', $data)
            || !array_key_exists('price', $data) || !array_key_exists('rate', $data) || !array_key_exists('currency', $data)
            || !array_key_exists('date', $data)){
            
            return new Response("Can`t create a new CurrencyRate. Missing information",404);
        }
        $stock = new Stock();
        $stock->query()->where("id","=",$data["stockId"])->first();
        $newCurrency = new TransactionOnStock($data['stockId'],$data['type'],$data['quantity'], $data['price'], $data['currency'],$data['rate'],$data['date']); 
        $db->add($newCurrency);
        $stock->setPrice($data["price"]);
        if($data['type']=="buy"){
            $stock->setNumberOfShares($stock->getNumberOfShares() + $data['quantity']);
        }
        else{
            $stock->setNumberOfShares($stock->getNumberOfShares() - $data['quantity']);
        }

        $db->add($stock);
        $db->commit();

        return new Response("Successfuly insert a new record");
    }

}