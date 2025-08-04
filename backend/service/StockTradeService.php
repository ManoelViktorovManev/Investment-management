<?php

namespace App\Service;

use App\Model\Portfolio;
use App\Model\Stock;
use App\Controller\StockController;
use App\Controller\CurrencyExchangeRateController;
use App\Model\PortfolioStock;
use App\Core\DbManipulation;
use App\Controller\TransactionHistoryController;
use App\Controller\UserStockAllocationController;
use App\Core\Response;


/*
    Not ok:

    Portfolio Trade Controller 
    Stock Trade Logic 
    User Stock Allocation Controller
*/

class StockTradeService
{
    private $action;
    private $data;
    private $isCashOnly;

    private Portfolio $portfolio;

    private Stock $stock;
    private Stock $cash;

    private PortfolioStock $PSModelStock;
    private PortfolioStock $PSModelCash;

    public function __construct(string $action, array $data, bool $isCashOnly = false)
    {
        $this->action = $action;
        $this->data = $data;
        $this->isCashOnly = $isCashOnly;
    }

    // handle same logic for buying/ selling stock and deposit and withdraw money.
    public function handleStockTradeLogic()
    {
        // setting the same parameters

        $stockCurrency = $this->data["currency"];
        $portfolioId   = $this->data["portfolioId"];
        $stockQuantity = $this->data["quantity"];
        $transactionDate = $this->data['date'];

        // get portfolio and setting 
        $this->portfolio = $this->getPortfolioModelInstance($portfolioId);

        // Cash stock instance
        $this->cash = $this->getStockModelInstance("$stockCurrency cash", $stockCurrency, $stockCurrency, 1, true);
        $this->PSModelCash = $this->getPortfolioStockModelInstance($this->cash, $this->portfolio);



        // if it is only cash transaction => withdraw or depositing money
        if ($this->isCashOnly) {

            // handle connection between  CASH and Portfolio
            $this->handleStockTransaction();

            // handle Transaction History
            $transactionHistory = new TransactionHistoryController();

            // handle stock transaction
            $transactionHistory->createNewTransactionHistory(
                $this->data['allocations'],
                $this->cash,
                $this->portfolio,
                $stockQuantity,
                1,
                $transactionDate,
                $this->action
            );


            // handle Stock, User and Portfolio interaction
            $usac = new UserStockAllocationController();
            $usac->updateUsersStocksPositionInPortfolio($this->data, $this->action, $this->portfolio, $this->cash);
        } else {
            $stockName     = $this->data["name"];
            $stockSymbol   = $this->data["symbol"];
            $stockPrice    = $this->data["price"];


            // Target stock instance
            $this->stock = $this->getStockModelInstance($stockName, $stockSymbol, $stockCurrency, $stockPrice);
            $this->PSModelStock = $this->getPortfolioStockModelInstance($this->stock, $this->portfolio);


            // handle connection between STOCK, CASH and Portfolio
            $this->handleStockTransaction();

            // handle Transaction History
            $transactionHistory = new TransactionHistoryController();

            // handle stock transaction
            $transactionHistory->createNewTransactionHistory(
                $this->data['allocations'],
                $this->stock,
                $this->portfolio,
                $stockQuantity,
                $stockPrice,
                $transactionDate,
                $this->action
            );

            $reverseAction = $this->action === "BUY" ? "SELL" : "BUY";

            // handle cash transaction
            $transactionHistory->createNewTransactionHistory(
                $this->data['allocations'],
                $this->cash,
                $this->portfolio,
                $stockQuantity,
                $stockPrice,
                $transactionDate,
                $reverseAction,
                true
            );

            // handle Stock, User and Portfolio interaction
            $usac = new UserStockAllocationController();
            $usac->updateUsersStocksPositionInPortfolio($this->data, $this->action, $this->portfolio, $this->stock);
            //remove the cash
            $usac->updateUsersStocksPositionInPortfolio($this->data, $reverseAction, $this->portfolio, $this->cash, true);
        }
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

    private function getPortfolioStockModelInstance(Stock $stockInstance, Portfolio $portfolioInstance): PortfolioStock
    {
        $spm = new PortfolioStock();
        $existing = $spm->query()
            ->where(["idPortfolio", "=", $portfolioInstance->getId()])
            ->and()
            ->where(["idStock", "=", $stockInstance->getId()])
            ->first();

        if (!$existing) {
            // Set new instance if it not exists.
            $db = new DbManipulation();

            $spm->setIdPortfolio($portfolioInstance->getId());
            $spm->setIdStock($stockInstance->getId());
            $spm->setNumStocks(0);
            $spm->setPrice(0);
            $spm->setValueOfStock(0);

            $db->add($spm);
            $db->commit();
        }
        return $spm;
    }



    private function getCurrentAmountOfMoneyInPortfolio(PortfolioStock $PSInstance): float
    {
        return $PSInstance->getValueOfStock();
    }

    private function handleStockTransaction()
    {
        $stockQuantity = $this->data["quantity"];

        // HANDLE LOGIC FOR ONLY CASH TRANSACTION
        if ($this->isCashOnly) {

            $stockPortfolioManagementInstance = $this->updatePortfolioStockBalance(
                $this->PSModelCash,
                $stockQuantity,
                1,
                $this->action
            );

            $db = new DbManipulation();
            $db->add($stockPortfolioManagementInstance);
            $db->commit();
        }

        // HANDLE STOCK AND CASH TRANSACTION
        else {

            $stockPrice = $this->data["price"];

            $totalPrice = $stockPrice * $stockQuantity;

            // Check for sufficient cash only on BUY
            if ($this->action === "BUY") {
                $availableCash = $this->getCurrentAmountOfMoneyInPortfolio($this->PSModelCash);
                if ($availableCash < $totalPrice) {
                    return new Response("Not enough Cash", 404);
                }
            }

            //getting StockPortfolioManagement
            $stockPortfolioManagementInstance = $this->updatePortfolioStockBalance(
                $this->PSModelStock,
                $stockQuantity,
                $stockPrice,
                $this->action
            );

            //updating The Cash in The portfolio, which is reverse action
            $reverseAction = $this->action === "BUY" ? "SELL" : "BUY";
            $stockPortfolioManagementInstanceForCash = $this->updatePortfolioStockBalance(
                $this->PSModelCash,
                $stockPrice * $stockQuantity,
                1,
                $reverseAction
            );

            $db = new DbManipulation();
            $db->add($stockPortfolioManagementInstance);
            $db->add($stockPortfolioManagementInstanceForCash);
            $db->commit();
        }
    }

    private function updatePortfolioStockBalance(PortfolioStock $PSInstance, float $stockQuantity, float $stockPrice, string $transactionType)
    {
        $isBuy = strtolower($transactionType) === 'buy';

        $currentQty = $PSInstance->getNumStocks();
        $currentVal = $PSInstance->getValueOfStock();

        // if we are buying stocks
        if ($isBuy) {
            $newQty = $currentQty + $stockQuantity;
            $newVal = $currentVal + ($stockPrice * $stockQuantity);
            $avgPrice = $newVal / $newQty;

            $PSInstance->setNumStocks($newQty);
            $PSInstance->setPrice($avgPrice);
            $PSInstance->setValueOfStock($newVal);
        }
        // if we are selling stocks or removing cash
        else {

            $newQty = $currentQty - $stockQuantity;
            $newVal = $newQty * $PSInstance->getPrice();

            $PSInstance->setNumStocks($newQty);
            $PSInstance->setValueOfStock($newVal);
        }
        return $PSInstance;
    }

    // private handleTransactionHistory(){
    //     $transactionHistory = new TransactionHistoryController();

    //     // handle stock transaction
    //     $transactionHistory->createNewTransactionHistory(
    //         $this->data['allocations'],
    //         $this->stock,
    //         $this->portfolio,
    //         $stockQuantity,
    //         $stockPrice,
    //         $transactionDate,
    //         $this->action
    //     );

    //     $reverseAction = $this->action === "BUY" ? "SELL" : "BUY";

    //     // handle cash transaction
    //     $transactionHistory->createNewTransactionHistory(
    //         $this->data['allocations'],
    //         $this->cash,
    //         $this->portfolio,
    //         $stockQuantity,
    //         $stockPrice,
    //         $transactionDate,
    //         $reverseAction,
    //         true
    //     );
    // }
}
