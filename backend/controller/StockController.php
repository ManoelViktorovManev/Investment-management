<?php

namespace App\Controller;

use App\Core\BaseController;
use App\Core\Response;
use App\Core\Route;
use App\Core\DbManipulation;
use App\Model\Stock;

class StockController extends BaseController
{

    #[Route('/createNewStock', methods: ['POST'])]
    public function createNewStock()
    {
        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);

        $stockName = $data["name"];
        $stockSymbol = $data["symbol"];
        $stockCurrency = $data["currency"];
        $stockPrice = $data["price"];

        $newStock = new Stock();
        $newStock->setName($stockName);
        $newStock->setSymbol($stockSymbol);
        $newStock->setCurrency($stockCurrency);
        $newStock->setPrice($stockPrice);

        $db = new DbManipulation();
        $db->add($newStock);
        $db->commit();

        return new Response("OK");
    }

    #[Route('/getAllStocks')]
    public function getAllStocks()
    {
        $stock = new Stock();
        $allStocks = $stock->query()->all();


        return $this->json($allStocks);
    }

    #[Route('/updateStock', methods: ['POST'])]
    public function updateStock()
    {
        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);

        $stockId = $data["id"];
        $stockPrice = $data["price"];

        $stock = new Stock();
        $stock->query()->where(["id", "=", $stockId])->first();

        $stock->setPrice($stockPrice);

        $db = new DbManipulation();
        $db->add($stock);
        $db->commit();

        return new Response("OK");
    }
}
