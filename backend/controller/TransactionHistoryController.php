<?php

/**
 * File: TransactionHistoryController.php
 * Description: Controller for managing and retrieving stock transaction history for both portfolios and individual users.
 * Author: Manoel Manev
 * Created: 2025-07-01
 */

namespace App\Controller;

use App\Core\BaseController;
use App\Model\TransactionHistory;
use App\Model\Stock;
use App\Model\Portfolio;
use App\Model\UserTransactionHistory;
use App\Core\DbManipulation;
use App\Core\Route;

/**
 * Class TransactionHistoryController
 *
 * Handles:
 * - Creation of stock transaction history (portfolio + per-user level)
 * - Fetching transaction records with pagination
 * - Counting total number of transactions
 *
 * @package App\Controller
 */
class TransactionHistoryController extends BaseController
{

    /**
     * Internal method for creating a new transaction history entry.
     *
     * This includes:
     * - A portfolio-level transaction record
     * - Multiple user-level allocation records
     *
     * @param array $allocations Mapping of userId to quantity purchased
     * @param Stock $stock Stock involved in the transaction
     * @param Portfolio $portfolio Associated portfolio
     * @param float $stockQuantity Total stock quantity
     * @param float $stockPrice Price per stock unit
     * @param string $transactionDate Date of transaction (YYYY-MM-DD)
     * @param string $transactionType Transaction type (e.g. BUY, SELL)
     * @param bool $afterStockTransaction Handle logic if we made transaction type buying stock then removing cash or reverse.
     *
     * @return void
     */
    public function createNewTransactionHistory(array $allocations, Stock $stock, Portfolio $portfolio, float $stockQuantity, float $stockPrice, string $transactionDate, string $transactionType, bool $afterStockTransaction = false)
    {
        $db = new DbManipulation();

        // Portfolio-level transaction record
        $stockTransaction = new TransactionHistory();
        $stockTransaction->setIdPortfolio($portfolio->getId());
        $stockTransaction->setIdStock($stock->getId());

        // if we are making transaction after selling or buying stock. We perform different operation for cash
        if ($stock->getIsCash() && $afterStockTransaction == true) {
            $stockTransaction->setNumStocks($stockQuantity * $stockPrice);
            $stockTransaction->setPrice(1);
        } else {
            $stockTransaction->setNumStocks($stockQuantity);
            $stockTransaction->setPrice($stockPrice);
        }

        $stockTransaction->setDate($transactionDate);
        $stockTransaction->setTransaction($transactionType);
        $db->add($stockTransaction);

        foreach ($allocations as $userId => $quantity) {
            // Individual user-level transactions
            $stockTransaction = new UserTransactionHistory();
            $stockTransaction->setUserId($userId);
            $stockTransaction->setIdPortfolio($portfolio->getId());
            $stockTransaction->setIdStock($stock->getId());

            // if we are making transaction after selling or buying stock. We perform different operation for cash
            if ($stock->getIsCash() && $afterStockTransaction) {
                $stockTransaction->setNumStocks($quantity * $stockPrice);
                $stockTransaction->setPrice(1);
            } else {
                $stockTransaction->setNumStocks($quantity);
                $stockTransaction->setPrice($stockPrice);
            }
            $stockTransaction->setDate($transactionDate);
            $stockTransaction->setTransaction($transactionType);

            $db->add($stockTransaction);
        }

        $db->commit();
    }

    /**
     * Endpoint: GET /getTransactionHistory/{id}
     *
     * Retrieves a paginated list (10 rows per page) of stock transactions,
     * including portfolio and stock names.
     *
     * @param int $id Offset for pagination (used as LIMIT start)
     *
     * @return Response JSON array of transactions:
     * [
     *   {
     *     "id": int,
     *     "portfolioName": string,
     *     "stockName": string,
     *     "numStocks": float,
     *     "price": string,
     *     "date": string (YYYY-MM-DD),
     *     "transaction": string ("BUY" or "SELL")
     *   },
     *   ...
     * ]
     */
    #[Route('/getTransactionHistory/{tableName}/{pageNumber}/{userId?}')]
    public function getTransactionHistory($tableName, $pageNumber, $userId)
    {
        $transactionInstance = null;
        $withUser = false;
        if ($tableName == 'transaction') {
            $transactionInstance  = new TransactionHistory();
        } else {
            $transactionInstance  = new UserTransactionHistory();
            if ($userId != null) {
                $withUser = true;
            }
        }

        if ($transactionInstance instanceof TransactionHistory) {
            $array = $transactionInstance
                ->query()
                ->select("transactionhistory.id, portfolio.name as portfolioName, stock.name as stockName, transactionhistory.numStocks, transactionhistory.price, transactionhistory.date, transactionhistory.transaction")
                ->join("Inner", "stock", "stock.id = idStock")
                ->join("Inner", "portfolio", "portfolio.id=idPortfolio")
                ->limit(10, $pageNumber)
                ->all();

            return $this->json($array);
        } else {
            if ($withUser) {
                $array = $transactionInstance
                    ->query()
                    ->select("usertransactionhistory.id, portfolio.name as portfolioName, stock.name as stockName, 
                    usertransactionhistory.numStocks, usertransactionhistory.price, usertransactionhistory.date, 
                    usertransactionhistory.transaction")
                    ->join("Inner", "stock", "stock.id = idStock")
                    ->join("Inner", "portfolio", "portfolio.id=idPortfolio")
                    ->where(["userId", "=", $userId])
                    ->limit(10, $pageNumber)
                    ->all();
                return $this->json($array);
            } else {
                $array = $transactionInstance
                    ->query()
                    ->select("usertransactionhistory.id, user.name as userName, portfolio.name as portfolioName, 
                    stock.name as stockName, usertransactionhistory.numStocks, usertransactionhistory.price, 
                    usertransactionhistory.date, usertransactionhistory.transaction")
                    ->join("Inner", "stock", "stock.id = idStock")
                    ->join("Inner", "portfolio", "portfolio.id=idPortfolio")
                    ->join("Inner", "user", "user.id=userId")
                    ->limit(10, $pageNumber)
                    ->all();
                return $this->json($array);
            }
        }
    }

    /**
     * Endpoint: GET /getTransactionHistoryCountResults
     *
     * Returns the total number of stock transactions in the system.
     *
     * @return Response Integer count of total transactions.
     *
     * Example response:
     * 42
     */
    #[Route('/getTransactionHistoryCountResults/{tableName}/{userId?}')]
    public function getCountResults($tableName, $userId)
    {
        $transactionInstance = null;
        $withUser = false;
        if ($tableName == 'transaction') {
            $transactionInstance  = new TransactionHistory();
        } else {
            $transactionInstance  = new UserTransactionHistory();
            if ($userId != null) {
                $withUser = true;
            }
        }

        $result = $withUser == true ? $transactionInstance
            ->query()
            ->select("Count(*) as count")
            ->where(["userId", "=", $userId])
            ->all()
            : $transactionInstance
            ->query()
            ->select("Count(*) as count")
            ->all();

        return $this->json($result[0]["count"]);
    }
}
