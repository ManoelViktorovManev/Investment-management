<?php

namespace App\Controller;

use App\Core\BaseController;
use App\Model\StockTransactions;
use App\Model\Stock;
use App\Model\Portfolio;
use App\Model\IndividualUserTransactions;
use App\Core\DbManipulation;
use App\Core\Route;

class TransactionHistoryController extends BaseController
{

    public function createNewStockTransactionsInstance(Stock $stock, Portfolio $portfolio, float $stockQuantity, float $stockPrice, string $transactionDate, string $transactionType)
    {
        $stockTransaction = new StockTransactions();
        $stockTransaction->setIdPortfolio($portfolio->getId());
        $stockTransaction->setIdStock($stock->getId());
        $stockTransaction->setNumStocks($stockQuantity);
        $stockTransaction->setPrice($stockPrice);
        $stockTransaction->setDate($transactionDate);
        $stockTransaction->setTransaction($transactionType);

        $db = new DbManipulation();
        $db->add($stockTransaction);
        $db->commit();
    }

    public function createNewIndividualUserTransactions(array $allocations, Stock $stock, Portfolio $portfolio, float $stockPrice, string $transactionDate, string $transactionType)
    {

        $db = new DbManipulation();
        foreach ($allocations as $userId => $quantity) {
            $stockTransaction = new IndividualUserTransactions();
            $stockTransaction->setUserId($userId);
            $stockTransaction->setIdPortfolio($portfolio->getId());
            $stockTransaction->setIdStock($stock->getId());
            $stockTransaction->setNumStocks($quantity * $stockPrice);
            $stockTransaction->setPrice($stockPrice);

            $stockTransaction->setDate($transactionDate);
            $stockTransaction->setTransaction($transactionType);
            $db->add($stockTransaction);
        }
        $db->commit();
    }

    #[Route('/getTransactionHistory/{id}')]
    public function getTransactionHistory($id)
    {
        $stockTransaction = new StockTransactions();
        $array = $stockTransaction
            ->query()
            ->select("stocktransactions.id, portfolio.name as portfolioName, stock.name as stockName, stocktransactions.numStocks, stocktransactions.price, stocktransactions.date, stocktransactions.transaction")
            ->join("Inner", "stock", "stock.id = idStock")
            ->join("Inner", "portfolio", "portfolio.id=idPortfolio")
            ->limit(10, $id)
            ->all();
        return $this->json($array);
    }

    #[Route('/getTransactionHistoryCountResults')]
    public function getCountResults()
    {
        $stockTransaction = new StockTransactions();
        $result = $stockTransaction
            ->query()
            ->select("Count(*) as count")
            ->all();
        return $this->json($result[0]["count"]);
    }
}
