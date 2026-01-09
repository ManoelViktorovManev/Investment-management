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
        return $this->json((new Stock())->query()->all());
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
        $stock->query()->where("id","=",$data["id"])->first();
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
    
    #[Route('/calculatePortfolioValue/{currency}')]
    public function calculatePortfolioValue($currency)
    {
        // we are looking to EUR
        $allStocks = (new Stock())->query()->all(true);
        $calculation = 0;
        $currencys = CurrencyExhangeRateController::getExchangeRates();
        foreach($allStocks as $stock){
            
            if($stock->getCurrency()!=$currency){
               
                $state = false;
                foreach($currencys as $curr){
                    // tuk se 4upi
                    if(($curr->getFirstCurrency() == $stock->getCurrency() || $curr->getSecondCurrency() == $stock->getCurrency()) 
                        && ($curr->getFirstCurrency() == $currency || $curr->getSecondCurrency() == $currency))
                    {
                        $state = true;
                        if($curr->getFirstCurrency() == $stock->getCurrency()){
                            // AKA Here is DOLAR USD=> EUR = *0.86 => (1USD = 0.86 EUR)
                            $calculation= $calculation + round($stock->getPrice() * $stock->getNumberOfShares() * $curr->getRate(),2);
                        }
                        else{
                            //reverse
                            $calculation= $calculation+ round($stock->getPrice() * $stock->getNumberOfShares() / $curr->getRate(),2);
                        }
                        break;
                    }
                }
                if($state == false){
                    return new Response("Non existing rates", 404);
                }
            }
            else{
                $calculation= $calculation + ($stock->getPrice() * $stock->getNumberOfShares());
            }
        }
        return $this->json(["portfolioValue"=>$calculation, "currency"=>$currency]);
    }

}