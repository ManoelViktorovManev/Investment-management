<?php

/**
 * File: CurrencyExchangeRateController.php
 * Description: Provides functionality for retrieves all stocks associated with a portfolio and deleting a stock from portfolio.
 * Author: Manoel Manev
 * Created: 2025-08-08
 */

namespace App\Controller;

use App\Core\BaseController;
use App\Core\Response;
use App\Core\Route;
use App\Core\DbManipulation;
use App\Model\PortfolioStock;
use App\Model\TransactionHistory;

/**
 * Class PortfolioStockController
 *
 * Handles stock-related operations for portfolios, such as retrieving all stocks in a portfolio
 * and deleting a specific stock along with its associated transaction history.
 *
 * This controller is responsible for interacting with `PortfolioStock` and `TransactionHistory`
 * models, managing database operations via `DbManipulation`, and returning appropriate responses
 * (usually in JSON format or a plain OK message).
 *
 * @package App\Controller
 */
class PortfolioStockController extends BaseController
{
    /**
     * Retrieves all stocks associated with a portfolio.
     *
     * If the `PortfolioID` parameter is not provided, this method returns all portfolio stocks in the database.
     * If `PortfolioID` is provided, it filters and returns only the stocks belonging to that specific portfolio.
     *
     * Route: GET /getAllStockToPortfolio/{PortfolioID?}
     *
     * @param int|null $PortfolioID Optional. The ID of the portfolio to filter stocks by.
     *
     * @return Response JSON response containing an array of stock records.
     */
    #[Route('/getAllStockToPortfolio/{PortfolioID?}')]
    public function getAllStockToPortfolio($PortfolioID)
    {
        $portfolio = new PortfolioStock();

        if ($PortfolioID === null) {
            $array = $portfolio->query()->all();
        } else {
            $array = $portfolio->query()->where(["idPortfolio", "=", $PortfolioID])->all();
        }

        return $this->json($array);
    }

    /**
     * Deletes a stock from a portfolio along with all its transaction history.
     *
     * Steps performed:
     * 1. Retrieves the portfolio stock by ID.
     * 2. Finds all transactions related to the given portfolio and stock.
     * 3. Deletes the stock from `PortfolioStock` table.
     * 4. Deletes all related transactions from `TransactionHistory` table.
     * 5. Commits the database changes.
     *
     * Route: DELETE /deleteStockPorfolio/{id}
     *
     * @param int $id The ID of the stock entry in the portfolio to be deleted.
     *
     * @return Response A plain text "OK" response upon successful deletion.
     */
    #[Route('/deleteStockPorfolio/{id}')]
    public function deleteStockPorfolio($id)
    {
        $stockInPortfolio = new PortfolioStock();
        $stockInPortfolio->query()->where(["id", "=", $id])->first();

        $stockTransactions = new TransactionHistory();
        $array = $stockTransactions->query()
            ->where(["idPortfolio", "=", $stockInPortfolio->getIdPortfolio()])
            ->and()
            ->where(["idStock", "=", $stockInPortfolio->getIdStock()])
            ->all(true);

        $db = new DbManipulation();
        $db->delete($stockInPortfolio);

        foreach ($array as $baseModelInstanceClass) {
            $db->delete($baseModelInstanceClass);
        }

        $db->commit();

        return new Response("OK");
    }
}
