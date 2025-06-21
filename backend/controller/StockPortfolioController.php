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


    #[Route('/buyStockInPortfolio', methods: ['POST'])]
    public function buyStockInPortfolio()
    {

        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);


        $stockName = $data["name"];
        $stockSymbol = $data["symbol"];
        $stockPrice = $data["price"];
        $stockQuantity = $data["quantity"];
        $portfolioId = $data["portfolioId"];
        $stockCurrency = $data['currency'];

        $transactionDate = $data['date'];

        //getting Portfolio instance
        $portfolio = new Portfolio();
        $portfolio->query()->where(['id', '=', $portfolioId])->first();

        //setting the Cash position!
        $stockOfCash = $this->getStockInstance($stockCurrency . " cash", $stockCurrency, $stockCurrency, 1, true);

        // we use the newest function:
        $amountOfMoneyInThisAccount = $this->getCurrentAmountOfMoneyInPortfolio($stockOfCash, $portfolio);

        if ($amountOfMoneyInThisAccount < $stockPrice * $stockQuantity) {
            return new Response("Not enough Cash", 404);
        }

        //getting Stock instance
        $stock = $this->getStockInstance($stockName, $stockSymbol, $stockCurrency, $stockPrice);

        //getting StockPortfolioManagement
        $stockPortfolioManagementInstance = $this->getStockPortfolioManagementInstance($stock, $portfolio, $stockQuantity, $stockPrice, "BUY");

        //setting StockTransaction
        $stockTransaction = $this->setNewStockTransactionsInstance($stock, $portfolio, $stockQuantity, $stockPrice, $transactionDate, "BUY");

        //updating The Cash in The portfolio
        $stockPortfolioManagementInstanceForCash = $this->getStockPortfolioManagementInstance($stockOfCash, $portfolio, $stockPrice * $stockQuantity, 1, "SELL");

        //recording the transaction of the cash in the portfolio
        $stockTransactionForCash = $this->setNewStockTransactionsInstance($stockOfCash, $portfolio, $stockPrice * $stockQuantity, 1, $transactionDate, "SELL");

        $db = new DbManipulation();
        $db->add($stockPortfolioManagementInstance);
        $db->add($stockTransaction);
        $db->add($stockPortfolioManagementInstanceForCash);
        $db->add($stockTransactionForCash);
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

    #[Route('/sellStockInPortfolio', methods: ['POST'])]
    public function sellStockInPortfolio()
    {
        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);

        $stockName = $data["name"];
        $stockSymbol = $data["symbol"];
        $stockPrice = $data["price"];
        $stockQuantity = $data["quantity"];
        $portfolioId = $data["portfolioId"];
        $stockCurrency = $data['currency'];

        $transactionDate = $data['date'];

        //getting Portfolio instance
        $portfolio = new Portfolio();
        $portfolio->query()->where(['id', '=', $portfolioId])->first();

        //getting Stock instance
        $stock = $this->getStockInstance($stockName, $stockSymbol, $stockCurrency, $stockPrice);

        //getting StockPortfolioManagement
        $stockPortfolioManagementInstance = $this->getStockPortfolioManagementInstance($stock, $portfolio, $stockQuantity, $stockPrice, "SELL");

        //setting StockTransaction
        $stockTransaction = $this->setNewStockTransactionsInstance($stock, $portfolio, $stockQuantity, $stockPrice, $transactionDate, "SELL");

        //setting the Cash position!
        $stockOfCash = $this->getStockInstance($stockCurrency . " cash", $stockCurrency, $stockCurrency, 1);

        $stockPortfolioManagementInstanceForCash = $this->getStockPortfolioManagementInstance($stockOfCash, $portfolio, $stockPrice * $stockQuantity, 1, "BUY");

        //setting StockTransaction
        $stockTransactionForCash = $this->setNewStockTransactionsInstance($stockOfCash, $portfolio, $stockPrice * $stockQuantity, 1, $transactionDate, "BUY");


        $db = new DbManipulation();
        $db->add($stockPortfolioManagementInstance);
        $db->add($stockTransaction);
        $db->add($stockPortfolioManagementInstanceForCash);
        $db->add($stockTransactionForCash);
        $db->commit();

        return new Response("OK");
    }
    #[Route('/updateCashAmount', methods: ['POST'])]
    public function updateCashAmount()
    {
        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);

        // name = symbol = currency => Example: USD Cash/
        $stockQuantity = $data["quantity"];
        $portfolioId = $data["portfolioId"];
        $stockCurrency = $data['currency'];

        $transactionDate = $data['date'];

        //getting Portfolio instance
        $portfolio = new Portfolio();
        $portfolio->query()->where(['id', '=', $portfolioId])->first();

        //setting the Cash position!
        $stockOfCash = $this->getStockInstance($stockCurrency . " cash", $stockCurrency, $stockCurrency, 1, true);

        // Load existing cash position (if any)
        $spm = new StockPortfolioManagement();
        $existing = $spm->query()
            ->where(["idPortfolio", "=", $portfolio->getId()])
            ->and()
            ->where(["idStock", "=", $stockOfCash->getId()])
            ->first();

        // Determine if this is BUY or SELL
        $currentQty = $existing ? $spm->getNumStocks() : 0;
        $difference = $stockQuantity - $currentQty;

        if ($difference === 0) {
            return new Response("OK", 200);
        }

        $transactionType = $difference > 0 ? "BUY" : "SELL";
        $adjustedQuantity = abs($difference); // only pass positive quantity

        $stockPortfolioManagementInstanceForCash = $this->getStockPortfolioManagementInstance(
            $stockOfCash,
            $portfolio,
            $adjustedQuantity,
            1,
            $transactionType
        );

        //setting StockTransaction
        $stockTransactionForCash = $this->setNewStockTransactionsInstance(
            $stockOfCash,
            $portfolio,
            $adjustedQuantity,
            1,
            $transactionDate,
            $transactionType
        );

        $db = new DbManipulation();
        $db->add($stockPortfolioManagementInstanceForCash);
        $db->add($stockTransactionForCash);
        $db->commit();

        return new Response("OK");
    }

    private function getStockInstance(string $stockName, string $stockSymbol, string $stockCurrency, float $stockPrice, bool $isCash = false): Stock
    {
        $stock = new Stock();
        $existingStock = $stock->query()->where(['symbol', '=', $stockSymbol])->first();

        //creating a new stock
        if (!$existingStock) {
            $newStock = new StockController();
            $newStock->createNewStock($stockName, $stockSymbol, $stockCurrency, $stockPrice, $isCash);
            $stock->query()->where(['symbol', '=', $stockSymbol])->first();
        }
        return $stock;
    }

    private function getStockPortfolioManagementInstance(Stock $stockInstance, Portfolio $portfolioInstance, float $stockQuantity, float $stockPrice, string $transactionType): ?StockPortfolioManagement
    {

        $spm = new StockPortfolioManagement();

        $existing = $spm->query()
            ->where(["idPortfolio", "=", $portfolioInstance->getId()])
            ->and()
            ->where(["idStock", "=", $stockInstance->getId()])
            ->first();


        $isBuy = strtolower($transactionType) === 'buy';

        // check if there is StockPortfolioManagement instance.
        if ($existing) {
            $currentQty = $spm->getNumStocks();
            $currentVal = $spm->getValueOfStock();

            // if we are buying stocks
            if ($isBuy) {
                $newQty = $currentQty + $stockQuantity;
                $newVal = $currentVal + ($stockPrice * $stockQuantity);
                $avgPrice = $newVal / $newQty;

                $spm->setNumStocks($newQty);
                $spm->setPrice($avgPrice);
                $spm->setValueOfStock($newVal);
            }
            // if we are selling stocks or removing cash
            else {

                $newQty = $currentQty - $stockQuantity;
                $newVal = $newQty * $spm->getPrice();

                $spm->setNumStocks($newQty);
                $spm->setValueOfStock($newVal);
            }
        }
        // if there is NO StockPortfolioManagement instance
        else {
            // Set common identifiers
            $spm->setIdPortfolio($portfolioInstance->getId());
            $spm->setIdStock($stockInstance->getId());

            $signedQty = $isBuy ? $stockQuantity : -$stockQuantity;
            $signedValue = $isBuy ? $stockPrice * $stockQuantity : -$stockPrice * $stockQuantity;

            $spm->setNumStocks($signedQty);
            $spm->setPrice($stockPrice);
            $spm->setValueOfStock($signedValue);
        }

        return $spm;
    }

    private function setNewStockTransactionsInstance(Stock $stock, Portfolio $portfolio, float $stockQuantity, float $stockPrice, string $transactionDate, string $transactionType): StockTransactions
    {
        $stockTransaction = new StockTransactions();
        $stockTransaction->setIdPortfolio($portfolio->getId());
        $stockTransaction->setIdStock($stock->getId());
        $stockTransaction->setNumStocks($stockQuantity);
        $stockTransaction->setPrice($stockPrice);
        $stockTransaction->setDate($transactionDate);
        $stockTransaction->setTransaction($transactionType);
        return $stockTransaction;
    }

    private function getCurrentAmountOfMoneyInPortfolio(Stock $stockInstance, Portfolio $portfolioInstance): float
    {
        $spm = new StockPortfolioManagement();

        $existing = $spm->query()
            ->where(["idPortfolio", "=", $portfolioInstance->getId()])
            ->and()
            ->where(["idStock", "=", $stockInstance->getId()])
            ->first();

        if ($existing) {
            return $spm->getValueOfStock();
        }
        return 0;
    }
}
