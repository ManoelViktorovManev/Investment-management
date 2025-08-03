<?php

/**
 * File: StockController.php
 * Description: Controller responsible for managing stocks, including creation, updates, splits, and retrieval.
 * Author: Manoel Manev
 * Created: 2025-06-17
 */

namespace App\Controller;

use App\Core\BaseController;
use App\Core\Response;
use App\Core\Route;
use App\Core\DbManipulation;
use App\Model\Stock;

/**
 * Class StockController
 *
 * Handles operations related to stock management including:
 * - Creating new stocks
 * - Updating stock prices
 * - Performing stock splits
 * - Retrieving all stocks
 *
 * @package App\Controller
 */
class StockController extends BaseController
{

    /**
     * Internal method for creating a new stock entry.
     *
     * @param string $stockName Name of the stock
     * @param string $stockSymbol Symbol of the stock
     * @param string $stockCurrency Stock Currency - USD, EUR ...
     * @param float $stockPrice Price per stock
     * @param bool $isCash Whether this stock is a cash/currency type
     */
    public function createNewStockByMethod($stockName, $stockSymbol, $stockCurrency, $stockPrice, bool $isCash = false)
    {
        $newStock = new Stock(null, $stockName, $stockSymbol, $stockCurrency, $stockPrice, $isCash);

        $db = new DbManipulation();
        $db->add($newStock);
        $db->commit();
    }

    /**
     * Endpoint: POST /createStock
     *
     * Creates a new stock. If it is a cash/currency stock (`isCash = true`),
     * a new currency exchange rate entry is also initialized.
     *
     * Expected JSON payload:
     * {
     *   "stockName": string,
     *   "stockSymbol": string,
     *   "stockCurrency": int,
     *   "stockPrice": float,
     *   "isCash": bool
     * }
     *
     * @return Response Returns "OK" on success.
     */
    #[Route('/createStock', methods: ['POST'])]
    public function createStockByPost()
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

        // If this is a cash-type stock, set up exchange rate mapping
        if ($isCash == true) {
            $newStock->query()->where(['symbol', '=', $stockSymbol])->first();
            $newCurrencyConnections = new CurrencyExchangeRateController();
            $newCurrencyConnections->createNewCurrencyExchangeRatebyMethod($newStock->getId());
        }
        return new Response("OK");
    }

    /**
     * Endpoint: GET /getAllStocks
     *
     * Retrieves a list of all stocks from the database.
     *
     * @return Response JSON array of stock objects.
     */
    #[Route('/getAllStocks')]
    public function getAllStocks()
    {
        $stock = new Stock();
        $allStocks = $stock->query()->all();

        return $this->json($allStocks);
    }

    /**
     * Endpoint: POST /updateStock
     *
     * Updates the prices of one or more stocks.
     * Skips updates if the new price matches the existing one.
     *
     * Expected JSON payload:
     * {
     *   "allocations": {
     *     "stockId": int,
     *     "stockPrice": float,
     *    
     *   }
     * }
     *
     * @return Response Returns "OK" on successful update.
     */
    #[Route('/updateStock', methods: ['POST'])]
    public function updateStock()
    {
        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);

        $allocations = $data["allocations"];

        $db = new DbManipulation();
        $stock = new Stock();
        foreach ($allocations as $stockId => $stockPrice) {

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

    /**
     * Endpoint: POST /stockSplit
     *
     * Performs a stock split by adjusting the price and propagating the change
     * across user allocations and portfolio trades.
     *
     * Expected JSON payload:
     * {
     *   "stockId": int,
     *   "from": int,
     *   "to": int
     * }
     *
     * Example for a 1:2 split: from = 1, to = 2
     *
     * @return Response Returns "OK" after split operation.
     */
    #[Route('/stockSplit', methods: ['POST'])]
    public function stockSplit()
    {
        // ration 1:2
        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);

        $stockId = $data["stockId"];
        $fromStock = $data["from"];
        $toStock = $data["to"];

        // updating price after stock split
        $stock = new Stock();
        $stock->query()->where(["id", "=", $stockId])->first();
        $stock->setPrice($stock->getPrice() / ($toStock / $fromStock));

        $USAC = new UserStockAllocationController();
        $USAC->stockSplitUpdate($stock, $fromStock, $toStock);

        $PTC = new PortfolioTradeController();
        $PTC->stockSplitUpdate($stock, $fromStock, $toStock);

        $db = new DbManipulation();
        $db->add($stock);
        $db->commit();
        return new Response("OK");
    }
}
