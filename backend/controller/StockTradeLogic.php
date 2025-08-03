<?php

namespace App\Controller;

use App\Core\BaseController;
use App\Core\Response;
use App\Core\Route;

use App\Core\DbManipulation;
use App\Model\PortfolioStock;
use App\Model\Stock;
use App\Model\Portfolio;
use App\Model\TransactionHistory;


class StockTradeLogic extends BaseController
{
    #[Route('/getAllStockToPortfolio/{PortfolioID?}')]
    public function getAllStockToPortfolio($PortfolioID)
    {
        $portfolio = new PortfolioStock();
        if ($PortfolioID == null) {
            $array = $portfolio->query()->all();
            return $this->json($array);
        } else {
            $array = $portfolio->query()->where(["idPortfolio", "=", $PortfolioID])->all();
            return $this->json($array);
        }
    }

    #[Route('/deleteStockPorfolio/{id}')]
    public function deleteStockPorfolio($id)
    {
        $stockInPortfolio = new PortfolioStock();
        $stockInPortfolio->query()->where(["id", "=", $id])->first();


        $stockTransactions = new TransactionHistory();
        $array = $stockTransactions->query()->where(["idPortfolio", "=", $stockInPortfolio->getIdPortfolio()])->and()->where(["idStock", "=", $stockInPortfolio->getIdStock()])->all(true);

        $db = new DbManipulation();
        $db->delete($stockInPortfolio);
        foreach ($array as $baseModelInstanceClass) {
            $db->delete($baseModelInstanceClass);
        }
        $db->commit();
        return new Response("OK");
    }


    /*

        Stock Transaction logic handle

    */
    public function handleStockTransaction($data, string $action, Portfolio $portfolio, Stock $stock, ?PortfolioStock $spmStock, Stock $cash, ?PortfolioStock $spmCash)
    {

        $stockPrice = $data["price"];
        $stockQuantity = $data["quantity"];

        $totalPrice = $stockPrice * $stockQuantity;

        // Check for sufficient cash only on BUY
        if ($action === "BUY") {
            $availableCash = $this->getCurrentAmountOfMoneyInPortfolio($cash, $portfolio);
            if ($availableCash < $totalPrice) {
                return new Response("Not enough Cash", 404);
            }
        }

        //getting StockPortfolioManagement
        $stockPortfolioManagementInstance = $this->getStockPortfolioManagementInstance(
            $spmStock,
            $stock,
            $portfolio,
            $stockQuantity,
            $stockPrice,
            $action
        );

        //updating The Cash in The portfolio, which is reverse action
        $reverseAction = $action === "BUY" ? "SELL" : "BUY";
        $stockPortfolioManagementInstanceForCash = $this->getStockPortfolioManagementInstance(
            $spmCash,
            $cash,
            $portfolio,
            $stockPrice * $stockQuantity,
            1,
            $reverseAction
        );

        $db = new DbManipulation();
        $db->add($stockPortfolioManagementInstance);
        $db->add($stockPortfolioManagementInstanceForCash);
        $db->commit();
    }



    /*

        Cash Transaction logic handle

    */
    public function handleCashTransaction($data, string $action, Portfolio $portfolio, Stock $cash, ?PortfolioStock $spmCash)
    {
        $stockQuantity = $data["quantity"];

        //getting StockPortfolioManagement
        $stockPortfolioManagementInstance = $this->getStockPortfolioManagementInstance(
            $spmCash,
            $cash,
            $portfolio,
            $stockQuantity,
            1,
            $action
        );

        $db = new DbManipulation();
        $db->add($stockPortfolioManagementInstance);
        $db->commit();
    }

    private function getStockPortfolioManagementInstance(?PortfolioStock $spm, Stock $stockInstance, Portfolio $portfolioInstance, float $stockQuantity, float $stockPrice, string $transactionType): ?PortfolioStock
    {
        $isBuy = strtolower($transactionType) === 'buy';

        // check if there is StockPortfolioManagement instance.
        if ($spm) {
            $currentQty = $spm->getNumStocks();
            $currentVal = $spm->getValueOfStock();

            // if we are buying stocks
            if ($isBuy) {
                $newQty = $currentQty + $stockQuantity;
                $newVal = $currentVal + ($stockPrice * $stockQuantity);
                $avgPrice = $newVal / $newQty;

                $spm->setNumStocks($newQty);
                $spm->setPrice($avgPrice);
                $spm->setValueOfStock($newVal);
            }
            // if we are selling stocks or removing cash
            else {

                $newQty = $currentQty - $stockQuantity;
                $newVal = $newQty * $spm->getPrice();

                $spm->setNumStocks($newQty);
                $spm->setValueOfStock($newVal);
            }
        }
        // if there is NO StockPortfolioManagement instance
        else {
            $spm = new PortfolioStock();
            // Set common identifiers
            $spm->setIdPortfolio($portfolioInstance->getId());
            $spm->setIdStock($stockInstance->getId());

            $signedQty = $isBuy ? $stockQuantity : -$stockQuantity;
            $signedValue = $isBuy ? $stockPrice * $stockQuantity : -$stockPrice * $stockQuantity;

            $spm->setNumStocks($signedQty);
            $spm->setPrice($stockPrice);
            $spm->setValueOfStock($signedValue);
        }

        return $spm;
    }


    private function getCurrentAmountOfMoneyInPortfolio(Stock $stockInstance, Portfolio $portfolioInstance): float
    {
        $spm = new PortfolioStock();

        $existing = $spm->query()
            ->where(["idPortfolio", "=", $portfolioInstance->getId()])
            ->and()
            ->where(["idStock", "=", $stockInstance->getId()])
            ->first();

        if ($existing) {
            return $spm->getValueOfStock();
        }
        return 0;
    }
}
