<?php

/**
 * File: UserPortfolioStockController.php
 * Description:  Look down for description.
 * Author: Manoel Manev
 * Created: 2025-08-08
 */

namespace App\Controller;

use App\Core\BaseController;
use App\Core\Route;
use App\Model\UserPortfolioStock;

/**
 * Class UserPortfolioStockController
 *
 * Handles portfolio-related allocation queries for users, including:
 * - Available free cash in a portfolio
 * - Percentage equity owned by each user
 * - All owners of a specific stock
 * - All stocks owned by a specific user
 *
 * @package App\Controller
 */
class UserPortfolioStockController extends BaseController
{

    /**
     * Gets all available cash held by users in a specific portfolio.
     *
     * This can return cash in different currencies (USD, EUR, JPY, etc.),
     * depending on the `stock` table’s `isCash` flag.
     *
     * Route: GET /getUsersFreeCashInPortfolio/{PortfolioId}
     *
     * @param int $PortfolioId The ID of the portfolio.
     * @return \App\Core\Response JSON list of user cash holdings.
     */
    #[Route('/getUsersFreeCashInPortfolio/{PortfolioId}')]
    public function getUsersFreeCashInPortfolio($PortfolioId)
    {
        $userCashs = (new UserPortfolioStock())->query()
            ->select("userId,stockId, stockQuantity")
            ->join("inner", "stock s", "s.id=stockId")
            ->where(["portfolioId", "=", $PortfolioId])
            ->and()
            ->where(["s.isCash", "=", 1])
            ->all();

        return $this->json($userCashs);
    }


    /**
     * Gets the percentage of equity ownership for each user in a portfolio.
     *
     * This method calculates each user's equity share by:
     * 1. Multiplying stock quantity by stock price for each user.
     * 2. Summing all user values to get the total portfolio value.
     * 3. Calculating each user’s percentage of ownership.
     *
     * Route: GET /getEquityOwnedByUsersInPortfolio/{PortfolioId}
     *
     * @param int $PortfolioId The ID of the portfolio.
     * @return \App\Core\Response JSON list of users with their total value and equity percentage.
     */
    #[Route('/getEquityOwnedByUsersInPortfolio/{PortfolioId}')]
    public function getEquityOwnedByUsersInPortfolio($PortfolioId)
    {

        $sql = "
        WITH user_values AS (
            SELECT 
                usp.userId,
                u.name AS userName,
                SUM(CAST(usp.stockQuantity AS FLOAT) * CAST(s.price AS FLOAT)) AS total_value
            FROM userportfoliostock usp
            JOIN stock s ON usp.stockId = s.id
            JOIN user u ON usp.userId = u.id
            WHERE usp.portfolioId = :portfolioId
            GROUP BY usp.userId, u.name
        ),
        total_sum AS (
            SELECT SUM(total_value) AS total_portfolio_value FROM user_values
        )
        SELECT 
            uv.userId,
            uv.userName,
            uv.total_value,
            ROUND((uv.total_value / ts.total_portfolio_value) * 100, 2) AS equity_percent
        FROM user_values uv, total_sum ts
        ORDER BY uv.userId
        ";

        $usersEquity = (new UserPortfolioStock())->query()->raw($sql, [':portfolioId' => $PortfolioId]);
        return $this->json($usersEquity);
    }

    /**
     * Gets all owners of a specific stock.
     *
     * Route: GET /getAllOwnersOfStock/{StockId}
     *
     * @param int $StockId The ID of the stock.
     * @return \App\Core\Response JSON list of users with their stock quantity.
     */
    #[Route('/getAllOwnersOfStock/{StockId}')]
    public function getAllOwnersOfStock($StockId)
    {
        $userCashs = (new UserPortfolioStock())->query()
            ->select("userId, stockQuantity")
            ->where(["stockId", "=", $StockId])
            ->all();

        return $this->json($userCashs);
    }

    /**
     * Gets all stocks owned by one user, or by all users if no user ID is provided.
     *
     * Route: GET /getAllStocksOneUserOwns/{UserId?}
     *
     * @param int|null $UserId Optional user ID. If null, returns all stocks for all users.
     * @return \App\Core\Response JSON list of stocks and quantities.
     */
    #[Route('/getAllStocksOneUserOwns/{UserId?}')]
    public function getAllStocksOneUserOwns($UserId = null)
    {
        $query = (new UserPortfolioStock())->query();

        $UserId == null ?
            $query->select("stockId, userId, stockQuantity") :
            $query->select("stockId, stockQuantity")
            ->where(["userId", "=", $UserId]);

        $userStocks = $query->all();

        return $this->json($userStocks);
    }
}
