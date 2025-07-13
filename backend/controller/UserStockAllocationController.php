<?php

namespace App\Controller;

use App\Core\BaseController;
use App\Core\Response;
use App\Core\Route;
use App\Model\UserStocksInPortfolio;
use App\Model\Stock;
use App\Core\DbManipulation;
use App\Model\Portfolio;

class UserStockAllocationController extends BaseController
{

    #[Route('/getUsersFreeCashInPortfolio/{PortfolioId}')]
    public function getUsersFreeCashInPortfolio($PortfolioId)
    {
        $userCashs = (new UserStocksInPortfolio())->query()
            ->select("userId,stockId, stockQuantity")
            ->join("inner", "stock s", "s.id=stockId")
            ->where(["portfolioId", "=", $PortfolioId])
            ->and()
            ->where(["s.isCash", "=", 1])
            ->all();

        return $this->json($userCashs);
    }


    #[Route('/getEquityOwnedByUsersInPortfolio/{PortfolioId}')]
    public function getEquityOwnedByUsersInPortfolio($PortfolioId)
    {

        $sql = "
        WITH user_values AS (
            SELECT 
                usp.userId,
                u.name AS userName,
                SUM(CAST(usp.stockQuantity AS FLOAT) * CAST(s.price AS FLOAT)) AS total_value
            FROM userstocksinportfolio usp
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

        $usersEquity = (new UserStocksInPortfolio())->query()->raw($sql, [':portfolioId' => $PortfolioId]);
        return $this->json($usersEquity);
    }


    #[Route('/getAllOwnersOfStock/{StockId}')]
    public function getAllOwnersOfStock($StockId)
    {
        $userCashs = (new UserStocksInPortfolio())->query()
            ->select("userId, stockQuantity")
            ->where(["stockId", "=", $StockId])
            ->all();

        return $this->json($userCashs);
    }

    #[Route('/getAllStocksOneUserOwns/{UserId?}')]
    public function getAllStocksOneUserOwns($UserId = null)
    {
        $query = (new UserStocksInPortfolio())->query();

        $UserId == null ?
            $query->select("stockId, userId, stockQuantity") :
            $query->select("stockId, stockQuantity")
            ->where(["userId", "=", $UserId]);

        $userStocks = $query->all();

        return $this->json($userStocks);
    }


    #[Route('/getAllUsersStocksInPortfolio')]
    public function getAllUsersStocksInPortfolio()
    {

        $stock = new UserStocksInPortfolio();
        $allStocks = $stock->query()->all();

        return $this->json($allStocks);
    }

    public function updateUsersStocksPositionInPortfolio($data, $action, Portfolio $portfolio, Stock $stock, bool $cashTransferAfterStockTransaction = false)
    {
        // it is form like this {"1":2,"3":8}, where first element is id of User and secound element is amount to add for his account
        $allocations = $data["allocations"];

        $db = new DbManipulation();
        foreach ($allocations as $userId => $quantity) {
            $instance = new UserStocksInPortfolio();
            $instanceOfUserStocks = $instance->query()
                ->where(["portfolioId", "=", $portfolio->getId()])
                ->and()
                ->where(["userId", "=", $userId])
                ->and()
                ->where(["stockId", "=", $stock->getId()])
                ->first();

            if (!$instanceOfUserStocks) {
                // create a new one
                $instance->setStockId($stock->getId());
                $instance->setUserId($userId);
                $instance->setPortfolioId($portfolio->getId());
                $instance->setStockQuantity($quantity);
            } else {
                // update existing one

                // there are two options: STOCK OR CASH
                // {1:10, 2:2.5, 3:2.5}
                if ($action == "BUY") {


                    if ($stock->getIsCash() && $cashTransferAfterStockTransaction) {
                        $instance->setStockQuantity($instance->getStockQuantity() + ($quantity * $data["price"]));
                    } else {
                        // it is stocks
                        $instance->setStockQuantity($instance->getStockQuantity() + $quantity);
                    }
                } else {
                    // it is cash
                    if ($stock->getIsCash() && $cashTransferAfterStockTransaction) {
                        $instance->setStockQuantity($instance->getStockQuantity() - ($quantity * $data["price"]));
                    } else {
                        // it is stocks
                        $instance->setStockQuantity($instance->getStockQuantity() - $quantity);
                    }
                }
            }

            $db->add($instance);
        }
        $db->commit();
        return new Response("OK");
    }
}
