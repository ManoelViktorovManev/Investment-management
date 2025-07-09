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
        $newStock = new Stock(null, $stockName, $stockSymbol, $stockCurrency, $stockPrice, $isCash);

        $db = new DbManipulation();
        $db->add($newStock);
        $db->commit();
    }


    #[Route('/createStock', methods: ['POST'])]
    public function createStock()
    {
        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);

        $stockName = $data["stockName"];
        $stockSymbol = $data["stockSymbol"];
        $stockCurrency = $data["stockCurrency"];
        $stockPrice = $data["stockPrice"];
        $isCash = $data["isCash"];


        $newStock = new Stock(null, $stockName, $stockSymbol, $stockCurrency, $stockPrice, $isCash);

        $db = new DbManipulation();
        $db->add($newStock);
        $db->commit();

        if ($isCash == true) {
            $newStock->query()->where(['symbol', '=', $stockSymbol])->first();
            $newCurrencyConnections = new CurrencyExchangeRateController();
            $newCurrencyConnections->createNewCurrencyExchangeRatebyMethod($newStock->getId());
        }
        return new Response("OK");
    }


    #[Route('/getCash')]
    public function getCash()
    {
        $stock = new Stock();
        $allStocks = $stock->query()->select("id")->where(["isCash", "=", "1"])->all();

        return $this->json($allStocks);
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

        $allocations = $data["allocations"];

        $db = new DbManipulation();
        foreach ($allocations as $stockId => $stockPrice) {
            $stock = new Stock();
            $stock->query()->where(["id", "=", $stockId])->first();

            // if the price is same, you don`t need to update
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
