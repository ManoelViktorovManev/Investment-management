<?php

namespace App\Controller;

use App\Core\BaseController;
use App\Core\Route;
use App\Core\DbManipulation;
use App\Core\Response;
use App\Model\Stock;
use App\Model\StockPositionLots;

class StockPositionLotsController extends BaseController
{
    
    #[Route('/getAveragePrice/{stockId}', methods:["GET"])]
    public function getAveragePrice($stockId){
        $stock = new Stock();
        $stock->query()->where("id","=",$stockId)->first();
        if($stock->getIsCash() == true || $stock->getId() == null){
            return new Response('Non existing stock',404);
        }
           
        $result = self::performAverageStockPriceCalculation($stockId);
        return $this->json($result,200);
    }

    
    public static function getAveragePriceForStock($stockId){
        return self::performAverageStockPriceCalculation($stockId);
    }

    public static function performSell($stockId,$amountToSell){
        // We perform here FIFO
        $stockPosition = new StockPositionLots();
        $arrayOfPositions = $stockPosition->query()->where("stockId","=",$stockId)->all(true);

        $db = new DbManipulation();
        foreach($arrayOfPositions as $instance){
            
            if($amountToSell>=$instance->getQuantity()){
                $amountToSell-=$instance->getQuantity();
                $db->delete($instance);
            }
            else{
                $instance->setQuantity($instance->getQuantity()-$amountToSell);
                $db->add($instance);
                break;
            }
        }
        $db->commit();
    }
    private static function performAverageStockPriceCalculation($stockId){
        $stockPosition = new StockPositionLots();
        $arrayOfPositions = $stockPosition->query()->select("price, quantity")->where("stockId","=",$stockId)->all();
        
        $amount = 0;
        $investedSum = 0;
        foreach($arrayOfPositions as $value){
            $investedSum = $investedSum + ($value["price"] * $value["quantity"]);
            $amount = $amount + $value["quantity"];
        }
        $averagePrice = round($investedSum/$amount,4);
        return ["investedSum"=>$investedSum,"amount"=>$amount,"averagePrice"=>$averagePrice];
    }

}