<?php

namespace App\Controller;

use App\Core\BaseController;
use App\Core\Route;
use App\Model\Portfolio;
use App\Model\User;
use App\Model\Stock;
use App\Model\StockPortfolioManagement;
use App\Model\StockTransactions;

class PortfolioTradeController extends BaseController
{

    /*

        STOCK MANIPULATION

    */
    #[Route('/buyStockInPortfolio', methods: ["POST"])]
    public function buyStockInPortfolio()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $this->handleStockTransaction('BUY', $data);
    }

    #[Route('/sellStockInPortfolio', methods: ["POST"])]
    public function sellStockInPortfolio()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $this->handleStockTransaction('SELL', $data);
    }


    private function handleStockTransaction(string $action, array $data)
    {
        $stockName     = $data["name"];
        $stockSymbol   = $data["symbol"];
        $stockPrice    = $data["price"];
        $stockCurrency = $data["currency"];
        $portfolioId   = $data["portfolioId"];
        $stockQuantity = $data["quantity"];
        $transactionDate = $data['date'];

        // Fetch core instances
        $portfolio = $this->getPortfolioInstance($portfolioId);

        // Cash stock instance
        $cash = $this->getStockInstance("$stockCurrency cash", $stockCurrency, $stockCurrency, 1, true);
        $spmInstanceCash = $this->getStockPortfolioManagementInstance($cash, $portfolio);

        // Target stock instance
        $stock = $this->getStockInstance($stockName, $stockSymbol, $stockCurrency, $stockPrice);
        $spmInstanceStock = $this->getStockPortfolioManagementInstance($stock, $portfolio);

        // handle connection between STOCK, CASH and Portfolio
        $stockPortfolio = new StockTradeLogic();
        $stockPortfolio->handleStockTransaction($data, $action, $portfolio, $stock, $spmInstanceStock, $cash, $spmInstanceCash);

        // handle Transaction History
        $transactionHistory = new TransactionHistoryController();
        // stock transaction history
        $transactionHistory->createNewStockTransactionsInstance(
            $stock,
            $portfolio,
            $stockQuantity,
            $stockPrice,
            $transactionDate,
            $action
        );

        $reverseAction = $action === "BUY" ? "SELL" : "BUY";
        // cash transaction history
        $transactionHistory->createNewStockTransactionsInstance(
            $cash,
            $portfolio,
            $stockQuantity * $stockPrice,
            1,
            $transactionDate,
            $reverseAction
        );

        // handle Stock, User and Portfolio interaction
        $usac = new UserStockAllocationController();
        $usac->updateUsersStocksPositionInPortfolio($data, $action, $portfolio, $stock);
        //remove the cash
        $usac->updateUsersStocksPositionInPortfolio($data, $reverseAction, $portfolio, $cash, true);
    }

    /*

        CASH MANIPULATION

    */
    #[Route('/addCashInPortfolio', methods: ["POST"])]
    public function addCashInPortfolio()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $this->handleCashTransaction('BUY', $data);
    }

    #[Route('/removeCashFromPortfolio', methods: ["POST"])]
    public function removeCashFromPortfolio()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $this->handleCashTransaction('SELL', $data);
    }

    private function handleCashTransaction(string $action, array $data)
    {
        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);

        $cashCurrency = $data["currency"];
        $portfolioId   = $data["portfolioId"];
        $stockQuantity = $data["quantity"];
        $transactionDate = $data['date'];

        //getting instance from portfolio, user and stock
        $portfolio = $this->getPortfolioInstance($portfolioId);
        $cash = $this->getStockInstance($cashCurrency . " cash", $cashCurrency, $cashCurrency, 1, true);
        $spmInstance = $this->getStockPortfolioManagementInstance($cash, $portfolio);


        $stockPortfolio = new StockTradeLogic();
        $stockPortfolio->handleCashTransaction($data, $action, $portfolio, $cash, $spmInstance);


        // handle Transaction History
        $transactionHistory = new TransactionHistoryController();
        // cash transaction history
        $transactionHistory->createNewStockTransactionsInstance(
            $cash,
            $portfolio,
            $stockQuantity,
            1,
            $transactionDate,
            $action
        );

        // update the amount of cash individualy to the users
        $usac = new UserStockAllocationController();
        $usac->updateUsersStocksPositionInPortfolio($data, $action, $portfolio, $cash);
    }




    private function getPortfolioInstance($portfolioId): Portfolio
    {
        return (new Portfolio())->query()->where(['id', '=', $portfolioId])->first();
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

    private function getStockPortfolioManagementInstance(Stock $stockInstance, Portfolio $portfolioInstance): ?StockPortfolioManagement
    {
        $spm = new StockPortfolioManagement();
        $existing = $spm->query()
            ->where(["idPortfolio", "=", $portfolioInstance->getId()])
            ->and()
            ->where(["idStock", "=", $stockInstance->getId()])
            ->first();

        return $existing ? $spm : null;
    }
}
