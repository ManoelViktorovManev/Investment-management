<?php

/**
 * File: DividendMaintenanceFeeService.php
 * Description: Provide handle of adding Dividend or Maintance fee to the portfolio logic.
 * Author: Manoel Manev
 * Created: 2025-08-26
 */

namespace App\Service;

use App\Controller\TransactionHistoryController;
use App\Controller\UserPortfolioStockController;
use App\Core\DbManipulation;
use App\Model\UserPortfolioStock;
use App\Model\PortfolioStock;
use App\Model\Portfolio;
use App\Model\Stock;

/**
 * Class DividendMaintenanceFeeService
 *
 *
 * @package App\Service
 */
class DividendMaintenanceFeeService
{
    private string $action;
    private array $data;

    public function __construct(array $data)
    {

        $this->data = $data;
        if ($this->data["isDividend"] == true) {
            $this->action = "DIVIDEND";
            $this->handleDividend();
        } else {
            if (!is_null($this->data["isFees"])) {
                $this->action = "MAINTENANCEFEE";
            } else {
                $this->action = "COMMISSION";
            }
            $this->handleMainteneceFee();
        }
    }


    private function handleDividend(): void
    {
        $db = new DbManipulation();
        $currency = new Stock();
        $currency->query()->where(['id', '=', $this->data["currencyStockId"]])->first();

        $stock = new Stock();
        $stock->query()->where(['id', '=', $this->data["stockId"]])->first();

        $netIncomeFromDividend = $this->data["amount"] * (1 - ($this->data["taxPercentage"] / 100));

        $UserPortfolioStock = new UserPortfolioStock();
        $array = $UserPortfolioStock->query()
            ->where(["stockId", "=",  $this->data["stockId"]])
            ->all(true);

        $arrayForPortfolios = [];
        $arrayForUserData = [];
        foreach ($array as $element) {
            $portfolioId = $element->getPortfolioId();

            if (!array_key_exists($portfolioId, $arrayForPortfolios)) {
                $arrayForPortfolios[$portfolioId] = $element->getStockQuantity();
                $arrayForUserData[$portfolioId] = [$element->getUserId() => $element->getStockQuantity()];
            } else {
                $arrayForPortfolios[$portfolioId] += $element->getStockQuantity();
                $arrayForUserData[$portfolioId] += [$element->getUserId() => $element->getStockQuantity()];
            }
        }

        foreach ($arrayForPortfolios as $key => $values) {
            $portfolioStock = new PortfolioStock();
            $portfolioStock
                ->query()
                ->where(['idStock', '=', $this->data["currencyStockId"]])
                ->and()
                ->where(['idPortfolio', '=', $key])
                ->first();

            $portfolioStock->setNumStocks($portfolioStock->getNumStocks() + ($netIncomeFromDividend * $values));
            $portfolioStock->setValueOfStock($portfolioStock->getValueOfStock() + ($netIncomeFromDividend * $values));

            $db->add($portfolioStock);
        }

        foreach ($arrayForUserData as $portfolioId => $elements) {
            foreach ($elements as $user => $amount) {
                $UserPortfolioStock = new UserPortfolioStock();
                $UserPortfolioStock->query()
                    ->where(["portfolioId", "=",  $portfolioId])
                    ->and()
                    ->where(["userId", "=", $user])
                    ->and()
                    ->where(["stockId", "=",  $this->data["currencyStockId"]])
                    ->first();

                $UserPortfolioStock->setStockQuantity($UserPortfolioStock->getStockQuantity() + ($amount * $netIncomeFromDividend));

                $db->add($UserPortfolioStock);
                $elements[$user] = $amount * $netIncomeFromDividend;
            }
            $portfolio = new Portfolio();
            $portfolio->query()->where(['id', '=', $portfolioId])->first();

            $transactionHistory = new TransactionHistoryController();
            $transactionHistory->createNewTransactionHistory(
                $elements,
                $currency,
                $portfolio,
                ($netIncomeFromDividend * $arrayForPortfolios[$portfolioId]),
                1,
                $this->data["transactionDate"],
                $this->action . " from " . $stock->getName()
            );
        }
        $db->commit();
    }

    private function handleMainteneceFee(): void
    {
        $db = new DbManipulation();

        $currency = new Stock();
        $currency->query()->where(['id', '=', $this->data["currencyStockId"]])->first();

        $portfolio = new Portfolio();
        $portfolio->query()->where(['id', '=', $this->data["portfolioId"]])->first();

        $portfolioStock = new PortfolioStock();
        $portfolioStock
            ->query()
            ->where(['idStock', '=', $this->data["currencyStockId"]])
            ->and()
            ->where(['idPortfolio', '=', $this->data["portfolioId"]])
            ->first();

        $portfolioStock->setNumStocks($portfolioStock->getNumStocks() - $this->data["amount"]);
        $portfolioStock->setValueOfStock($portfolioStock->getValueOfStock() - $this->data["amount"]);

        $db->add($portfolioStock);

        $result = $this->getEquityOwnedByUsersInPortfolio($this->data["portfolioId"]);

        $allocation = [];
        $overAllPercentage = 0;
        if ($this->action == "COMMISSION") {
            // only one user
            foreach ($result as $values) {
                $userId = $values["userId"];

                if (in_array($userId, $this->data["allocation"])) {
                    $overAllPercentage += $values["equity_percent"];
                }
            }

            // $this->data["allocation"]; it holds userId// [1]
        }
        if ($overAllPercentage == 0) {
            $overAllPercentage = 100;
        }
        foreach ($result as $values) {
            $userId = $values["userId"];
            $percent = $values["equity_percent"];
            $sumToRemove = ($percent / $overAllPercentage) * $this->data["amount"];

            $allocation[$userId] = $sumToRemove;

            $UserPortfolioStock = new UserPortfolioStock();
            $UserPortfolioStock->query()
                ->where(["portfolioId", "=",  $this->data["portfolioId"]])
                ->and()
                ->where(["userId", "=", $userId])
                ->and()
                ->where(["stockId", "=",  $this->data["currencyStockId"]])
                ->first();

            $UserPortfolioStock->setStockQuantity($UserPortfolioStock->getStockQuantity() - $sumToRemove);

            $db->add($UserPortfolioStock);
        }
        $db->commit();

        $transactionHistory = new TransactionHistoryController();
        $transactionHistory->createNewTransactionHistory(
            $allocation,
            $currency,
            $portfolio,
            $this->data["amount"],
            1,
            $this->data["transactionDate"],
            $this->action
        );
    }

    private function getEquityOwnedByUsersInPortfolio($PortfolioId)
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
            ROUND((uv.total_value / ts.total_portfolio_value) * 100, 2) AS equity_percent
        FROM user_values uv, total_sum ts
        ORDER BY uv.userId
        ";

        return (new UserPortfolioStock())->query()->raw($sql, [':portfolioId' => $PortfolioId]);;
    }
}
