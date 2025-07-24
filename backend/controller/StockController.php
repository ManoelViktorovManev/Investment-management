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

    #[Route('/stockSplit', methods: ['POST'])]
    public function stockSplit()
    {
        // ration 1:2
        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);

        $stockId = $data["stockId"];
        $fromStock = $data["from"];
        $toStock = $data["to"];

        $stock = new Stock();
        $stock->query()->where(["id", "=", $stockId])->first();
        $stock->setPrice($stock->getPrice() / ($toStock / $fromStock));
        // we have to call other shits
        // stockportfoliomanagement, usersstockinPortfolio
        $USAC = new UserStockAllocationController();
        $USAC->stockSplitUpdate($stock, $fromStock, $toStock);

        $PTC = new PortfolioTradeController();
        $PTC->stockSplitUpdate($stock, $fromStock, $toStock);

        $db = new DbManipulation();
        $db->add($stock);
        $db->commit();


        // struwa 40 dolara na akciq i imam 5 akcij => 
        // pri 1:2 => 20 dolara na akciq i 10 akcij 40/ (2/1) => 20
        // pri 2:3 => 26 dolara na akciq i  7,5 akcii                              40/ (3/2)
        // formula 40 / (wtoroto/purwoto)   i 5 * (wtoroto/purwoto)

        return new Response("OK");
    }
}
