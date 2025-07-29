<?php

namespace App\Controller;

use App\Core\BaseController;
use App\Model\StockTransactions;
use App\Model\Stock;
use App\Model\Portfolio;
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

    #[Route('/getTransactionHistory/{id}')]
    public function getTransactionHistory($id)
    {
        $stockTransaction = new StockTransactions();
        $array = $stockTransaction->query()->limit(10, $id)->all();
        return $this->json($array);
    }
}
