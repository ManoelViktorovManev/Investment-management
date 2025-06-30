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
        $stock = new Stock();
        $cashStocks  = $stock->query()->select("id")->where(["isCash", "=", "1"])->all();
        $cashStockIds = array_map(fn($row) => $row['id'], $cashStocks);

        if (empty($cashStockIds)) {
            return $this->json([]); // Return early if no cash stocks
        }

        $userCashs = (new UserStocksInPortfolio())->query()
            ->select("userId,stockId, stockQuantity")
            ->where(["portfolioId", "=", $PortfolioId])
            ->and()
            ->where(["stockId", "IN", $cashStockIds])
            ->all();

        return $this->json($userCashs);
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
