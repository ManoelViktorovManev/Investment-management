<?php

namespace App\Service;

use App\Model\Portfolio;
use App\Model\Stock;
use App\Model\StockPortfolioManagement;
use App\Controller\StockController;
use App\Controller\CurrencyExchangeRateController;
use App\Model\PortfolioStock;

/*
    Not ok:

    Portfolio Trade Controller 
    Stock Trade Logic 
    User Stock Allocation Controller
*/

class StockTradeService
{
    public function handleStockTrade(string $action, array $data)
    {
        $stockName     = $data["name"];
        $stockSymbol   = $data["symbol"];
        $stockPrice    = $data["price"];
        $stockCurrency = $data["currency"];
        $portfolioId   = $data["portfolioId"];
        $stockQuantity = $data["quantity"];
        $transactionDate = $data['date'];

        // get portfolio
        $portfolio = $this->getPortfolioModelInstance($portfolioId);

        // Cash stock instance
        $cash = $this->getStockModelInstance("$stockCurrency cash", $stockCurrency, $stockCurrency, 1, true);
        $spmInstanceCash = $this->getPortfolioStockModelInstance($cash, $portfolio);

        // Target stock instance
        $stock = $this->getStockModelInstance($stockName, $stockSymbol, $stockCurrency, $stockPrice);
        $spmInstanceStock = $this->getPortfolioStockModelInstance($stock, $portfolio);

        // // ????? updating 
        // // handle connection between STOCK, CASH and Portfolio
        // $stockPortfolio = new StockTradeLogic();
        // $stockPortfolio->handleStockTransaction($data, $action, $portfolio, $stock, $spmInstanceStock, $cash, $spmInstanceCash);

        // // handle Transaction History
        // $transactionHistory = new TransactionHistoryController();

        // // handle stock transaction
        // $transactionHistory->createNewTransactionHistory(
        //     $data['allocations'],
        //     $stock,
        //     $portfolio,
        //     $stockQuantity,
        //     $stockPrice,
        //     $transactionDate,
        //     $action
        // );

        // $reverseAction = $action === "BUY" ? "SELL" : "BUY";

        // // handle cash transaction
        // $transactionHistory->createNewTransactionHistory(
        //     $data['allocations'],
        //     $cash,
        //     $portfolio,
        //     $stockQuantity,
        //     $stockPrice,
        //     $transactionDate,
        //     $reverseAction,
        //     true
        // );

        // // handle ??????
        // // handle Stock, User and Portfolio interaction
        // $usac = new UserStockAllocationController();
        // $usac->updateUsersStocksPositionInPortfolio($data, $action, $portfolio, $stock);
        // //remove the cash
        // $usac->updateUsersStocksPositionInPortfolio($data, $reverseAction, $portfolio, $cash, true);
    }


    private function getPortfolioModelInstance($portfolioId): Portfolio
    {
        return (new Portfolio())->query()->where(['id', '=', $portfolioId])->first();
    }

    private function getStockModelInstance(string $stockName, string $stockSymbol, string $stockCurrency, float $stockPrice, bool $isCash = false): Stock
    {
        $stock = new Stock();
        $existingStock = $stock->query()->where(['symbol', '=', $stockSymbol])->first();

        //creating a new stock
        if (!$existingStock) {
            $newStock = new StockController();
            $newStock->createNewStockByMethod($stockName, $stockSymbol, $stockCurrency, $stockPrice, $isCash);
            $stock->query()->where(['symbol', '=', $stockSymbol])->first();

            // create a new currency exchange rate instance
            if ($isCash == true) {
                $newCurrencyConnections = new CurrencyExchangeRateController();
                $newCurrencyConnections->createNewCurrencyExchangeRatebyMethod($stock->getId());
            }
        }
        return $stock;
    }

    private function getPortfolioStockModelInstance(Stock $stockInstance, Portfolio $portfolioInstance): ?PortfolioStock
    {
        $spm = new PortfolioStock();
        $existing = $spm->query()
            ->where(["idPortfolio", "=", $portfolioInstance->getId()])
            ->and()
            ->where(["idStock", "=", $stockInstance->getId()])
            ->first();

        return $existing ? $spm : null;
    }


    // private function handleStockTransaction($data, string $action, Portfolio $portfolio, Stock $stock, ?PortfolioStock $spmStock, Stock $cash, ?PortfolioStock $spmCash)
    // {

    //     $stockPrice = $data["price"];
    //     $stockQuantity = $data["quantity"];

    //     $totalPrice = $stockPrice * $stockQuantity;

    //     // Check for sufficient cash only on BUY
    //     if ($action === "BUY") {
    //         $availableCash = $this->getCurrentAmountOfMoneyInPortfolio($cash, $portfolio);
    //         if ($availableCash < $totalPrice) {
    //             return new Response("Not enough Cash", 404);
    //         }
    //     }

    //     //getting StockPortfolioManagement
    //     $stockPortfolioManagementInstance = $this->getStockPortfolioManagementInstance(
    //         $spmStock,
    //         $stock,
    //         $portfolio,
    //         $stockQuantity,
    //         $stockPrice,
    //         $action
    //     );

    //     //updating The Cash in The portfolio, which is reverse action
    //     $reverseAction = $action === "BUY" ? "SELL" : "BUY";
    //     $stockPortfolioManagementInstanceForCash = $this->getStockPortfolioManagementInstance(
    //         $spmCash,
    //         $cash,
    //         $portfolio,
    //         $stockPrice * $stockQuantity,
    //         1,
    //         $reverseAction
    //     );

    //     $db = new DbManipulation();
    //     $db->add($stockPortfolioManagementInstance);
    //     $db->add($stockPortfolioManagementInstanceForCash);
    //     $db->commit();
    // }


    // private function getCurrentAmountOfMoneyInPortfolio(Stock $stockInstance, Portfolio $portfolioInstance): float
    // {
    //     $spm = new PortfolioStock();

    //     $existing = $spm->query()
    //         ->where(["idPortfolio", "=", $portfolioInstance->getId()])
    //         ->and()
    //         ->where(["idStock", "=", $stockInstance->getId()])
    //         ->first();

    //     if ($existing) {
    //         return $spm->getValueOfStock();
    //     }
    //     return 0;
    // }














    // public function handleStockTransaction($data, string $action, Portfolio $portfolio, Stock $stock, ?StockPortfolioManagement $spmStock, Stock $cash, ?StockPortfolioManagement $spmCash)
    // {

    //     $stockPrice = $data["price"];
    //     $stockQuantity = $data["quantity"];

    //     $totalPrice = $stockPrice * $stockQuantity;

    //     // Check for sufficient cash only on BUY
    //     if ($action === "BUY") {
    //         $availableCash = $this->getCurrentAmountOfMoneyInPortfolio($cash, $portfolio);
    //         if ($availableCash < $totalPrice) {
    //             return new Response("Not enough Cash", 404);
    //         }
    //     }

    //     //getting StockPortfolioManagement
    //     $stockPortfolioManagementInstance = $this->getStockPortfolioManagementInstance(
    //         $spmStock,
    //         $stock,
    //         $portfolio,
    //         $stockQuantity,
    //         $stockPrice,
    //         $action
    //     );

    //     //updating The Cash in The portfolio, which is reverse action
    //     $reverseAction = $action === "BUY" ? "SELL" : "BUY";
    //     $stockPortfolioManagementInstanceForCash = $this->getStockPortfolioManagementInstance(
    //         $spmCash,
    //         $cash,
    //         $portfolio,
    //         $stockPrice * $stockQuantity,
    //         1,
    //         $reverseAction
    //     );

    //     $db = new DbManipulation();
    //     $db->add($stockPortfolioManagementInstance);
    //     $db->add($stockPortfolioManagementInstanceForCash);
    //     $db->commit();
    // }
}
