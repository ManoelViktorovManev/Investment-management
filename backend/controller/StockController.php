<?php

namespace App\Controller;

use App\Core\BaseController;
use App\Core\Response;
use App\Core\Route;
use App\Core\DbManipulation;
use App\Model\Stock;

class StockController extends BaseController
{

    public function createNewStock($stockName, $stockSymbol, $stockCurrency, $stockPrice, bool $isCash = false)
    {
        $newStock = new Stock();
        $newStock->setName($stockName);
        $newStock->setSymbol($stockSymbol);
        $newStock->setCurrency($stockCurrency);
        $newStock->setPrice($stockPrice);
        $newStock->setIsCash($isCash);

        $db = new DbManipulation();
        $db->add($newStock);
        $db->commit();
    }

    #[Route('/getAllStocks')]
    public function getAllStocks()
    {
        $stock = new Stock();
        $allStocks = $stock->query()->all();

        return $this->json($allStocks);
    }

    #[Route('/getSingleStockData/{id}')]
    public function getSingleStockData($id)
    {
        $stock = new Stock();
        $allStocks = $stock
            ->query()
            ->select("name, currency, price")
            ->where(["id", "=", $id])
            ->all();

        return $this->json($allStocks);
    }


    #[Route('/updateStock', methods: ['POST'])]
    public function updateStock()
    {
        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);

        // $stockId = $data["id"];
        // $stockPrice = $data["price"];
        $allocations = $data["allocations"];

        $db = new DbManipulation();
        foreach ($allocations as $stockId => $stockPrice) {
            $stock = new Stock();
            $stock->query()->where(["id", "=", $stockId])->first();
            if ($stock->getPrice() == $stockPrice) {
                continue;
            }
            $stock->setPrice($stockPrice);

            $db->add($stock);
        }

        $db->commit();

        return new Response("OK");
    }
}
