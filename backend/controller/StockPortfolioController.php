<?php

namespace App\Controller;

use App\Core\BaseController;
use App\Core\Response;
use App\Core\Route;

use App\Core\DbManipulation;
use App\Controller\StockController;
use App\Model\StockPortfolioManagement;
use App\Model\Stock;
use App\Model\Portfolio;
use App\Model\StockTransactions;


class StockPortfolioController extends BaseController
{


    #[Route('/addNewStockToPortfolio', methods: ['POST'])]
    public function addNewStockToPortfolio()
    {

        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);


        $stockName = $data["name"];
        $stockSymbol = $data["symbol"];
        $stockPrice = $data["price"];
        $stockQuantity = $data["quantity"];
        $portfolio = $data["portfolioId"];
        $isTheCurrentPriceOfStockThisValue = $data["currentPriceOfStock"];


        $portfolioInstance = new Portfolio();
        $portfolioInstance->query()->where(['id', '=', $portfolio])->first();

        $checkStockIfExists = new Stock();
        $existingStock = $checkStockIfExists->query()->where(['symbol', '=', $stockSymbol])->first();

        //creating a new stock
        if (!$existingStock) {
            $newStock = new StockController();
            $newStock->createNewStock();
            $checkStockIfExists->query()->where(['name', '=', $stockName])->first();
        }

        // ако вече има съществуващо, него да се пълни!!!
        // need to check if exists

        $stockInPortfolio = new StockPortfolioManagement();
        $existingStockPortfolioManagement = $stockInPortfolio->query()->where(["idPortfolio", "=", $portfolioInstance->getId()])->and()->where(["idStock", "=", $checkStockIfExists->getId()])->first();


        if ($existingStockPortfolioManagement) {
            $newNumberOfStocks = $stockQuantity + $stockInPortfolio->getNumStocks();

            //Total value = totalValueA + totalValueB
            $newStockValue = ($stockPrice * $stockQuantity) + $stockInPortfolio->getValueOfStock();

            //Average price = (totalValueA + totalValueB) / (quantityA + quantityB)
            $newAveragePrice = $newStockValue / $newNumberOfStocks;

            $stockInPortfolio->setNumStocks($newNumberOfStocks);
            $stockInPortfolio->setPrice($newAveragePrice);
            $stockInPortfolio->setValueOfStock($newStockValue);
        } else {
            $stockInPortfolio->setIdPortfolio($portfolioInstance->getId());
            $stockInPortfolio->setIdStock($checkStockIfExists->getId());
            $stockInPortfolio->setNumStocks($stockQuantity);
            $stockInPortfolio->setPrice($stockPrice);
            $stockInPortfolio->setValueOfStock($stockPrice * $stockQuantity);
        }

        $stockTransaction = new StockTransactions();
        $stockTransaction->setIdPortfolio($portfolioInstance->getId());
        $stockTransaction->setIdStock($checkStockIfExists->getId());
        $stockTransaction->setNumStocks($stockQuantity);
        $stockTransaction->setPrice($stockPrice);
        $stockTransaction->setDate(date("Y/m/d"));
        $stockTransaction->setTransaction("BUY");

        $db = new DbManipulation();
        $db->add($stockInPortfolio);
        $db->add($stockTransaction);
        $db->commit();

        return new Response("OK");
    }

    #[Route('/getAllStockToPortfolio/{PortfolioID?}')]
    public function getAllStockToPortfolio($PortfolioID)
    {
        $portfolio = new StockPortfolioManagement();
        if ($PortfolioID == null) {
            $array = $portfolio->query()->all();
            return $this->json($array);
        } else {
            $array = $portfolio->query()->where(["idPortfolio", "=", $PortfolioID])->all();
            return $this->json($array);
        }
    }

    #[Route('/deleteStockPorfolio/{id}')]
    public function deleteStockPorfolio($id)
    {
        $stockInPortfolio = new StockPortfolioManagement();
        $stockInPortfolio->query()->where(["id", "=", $id])->first();


        $stockTransactions = new StockTransactions();
        $array = $stockTransactions->query()->where(["idPortfolio", "=", $stockInPortfolio->getIdPortfolio()])->and()->where(["idStock", "=", $stockInPortfolio->getIdStock()])->all(true);

        $db = new DbManipulation();
        $db->delete($stockInPortfolio);
        foreach ($array as $baseModelInstanceClass) {
            $db->delete($baseModelInstanceClass);
        }
        $db->commit();
        return new Response("OK");
    }
}
