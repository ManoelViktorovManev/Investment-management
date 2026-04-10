<?php

namespace App\Controller;

use App\Core\BaseController;
use App\Model\Stock;
use App\Core\Route;
use App\Core\DbManipulation;
use App\Core\Response;
use App\Model\Settings;

class StockController extends BaseController
{
    #[Route('/createStock', methods:["POST"])]
    public function createStock()
    {
        $db = new DbManipulation();
        $data = json_decode(file_get_contents("php://input"), true);
        // we handle and isCash
        if (!array_key_exists('name', $data) ||  !array_key_exists('currency', $data) || !array_key_exists('isCash', $data) ){
            return new Response("Can`t create a new Stock. Missing information",404);
        }

        $stock = new Stock($data["name"],$data["currency"],$data["isCash"]); 
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

    #[Route('/updateMultipleStocks', methods:["POST"])]
    public function updateMultipleStocks()
    {
        $db = new DbManipulation();
        $data = json_decode(file_get_contents("php://input"), true);

        if (!array_key_exists('list', $data) || !array_key_exists('date', $data)
             || !array_key_exists('amountOfShares', $data) || !array_key_exists('currency', $data)){
            return new Response("Can`t update Stock. Missing information",404);
        }

        // $allShares = (new Stock())->query()->all(true);
        foreach($data["list"] as $stockElement)
        {
            $stock = new Stock($stockElement["id"], $stockElement["name"],$stockElement["price"],$stockElement["numberOfShares"], $stockElement["currency"]);
            $db->add($stock);
        }
        $db->commit();
        // we need to get entire portfolio price now + currency

        $calculation = self::calculatePortfolioValue($data["currency"]);

        if ($calculation == null) {
            return new Response("No existing rate", 404);
        }       
        // now we update settings
        $settings = new Settings();
        $settings->query()->first();
        $settings->setSharePrice(round($calculation/$settings->getallShares(),5));
        $db->add($settings);
        $db->commit();

        //finally we add the new element in db HistoryPriceOFONeShare :)
        HistoryPriceOfOneShareController::createStaticInstance($data["date"],$settings->getSharePrice());
        return new Response("Successfuly insert a new record");
    }
    
   
    public static function calculatePortfolioValue($currency)
    {
        $allStocks = (new Stock())->query()->all(true);
        $calculation = 0;
        foreach($allStocks as $stock){
            
            if($stock->getCurrency()!=$currency){
               
                $rate=CurrencyExhangeRateController::calculateExchangeRate($stock->getCurrency(),$currency);
                if($rate==null){
                    return new Response("Non existing rates {$stock->getCurrency()} to {$currency}", 404);
                }
                $calculation= $calculation + round($stock->getPrice() * $stock->getNumberOfShares() * $rate,2);
                
            }
            else{
                $calculation= $calculation + round($stock->getPrice() * $stock->getNumberOfShares(),2);
            }
        }
        return $calculation;
    }

    #[Route('/getPortfolioSize/{currency}')]
    public function getPortfolioSize($currency)
    {
       
        $calculation = self::calculatePortfolioValue($currency);

        if ($calculation !== null) {
            return $this->json(["portfolioValue"=>$calculation, "currency"=>$currency]);
        }

        return new Response("No existing rate", 404);
    }
}