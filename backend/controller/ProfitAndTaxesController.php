<?php

/**
 * File: StockController.php
 * Description: Controller responsible for managing stocks, including creation, updates, splits, and retrieval.
 * Author: Manoel Manev
 * Created: 2025-08-17
 */

namespace App\Controller;

use App\Core\BaseController;
use App\Core\Route;
use App\Model\ProfitAndTaxes;
use App\Core\Response;
use App\Core\DbManipulation;

use App\Controller\TransactionHistoryController;
use App\Controller\UserPortfolioStockController;
use App\Model\UserPortfolioStock;
use App\Model\PortfolioStock;
use App\Model\Portfolio;
use App\Model\Stock;

/**
 * Class ProfitAndTaxesController
 *

 * @package App\Controller
 */
class ProfitAndTaxesController extends BaseController
{

    #[Route('/getAllProfitAndTaxesWithGrossProfit')]
    public function getAllProfitAndTaxesWithGrossProfit()
    {

        $instance = new ProfitAndTaxes();
        $allProfitAndTaxes = $instance
            ->query()
            ->where(["grossProfit", "IS NOT", null])
            ->all();
        return $this->json($allProfitAndTaxes);
    }

    #[Route('/getProfitAndTaxesWithGrossProfit/{userId}')]
    public function getProfitAndTaxesWithGrossProfit($userId)
    {

        $instance = new ProfitAndTaxes();
        $allProfitAndTaxes = $instance
            ->query()
            ->select("profitandtaxes.id, userId, stock.name as stockName, stockId, portfolio.name as portfolioName, portfolioId,
            s.name as currencyName, cashId, profitandtaxes.stockQuantity, profitandtaxes.boughtPrice,
            profitandtaxes.soldPrice, profitandtaxes.grossProfit, profitandtaxes.taxesToPayPercantage,
            profitandtaxes.taxesToPay, profitandtaxes.managementFeesToPay, profitandtaxes.managementFeesToPayPercantage,
            profitandtaxes.netProfit, profitandtaxes.isPayed")
            ->join("Inner", "stock", "stock.id=stockId")
            ->join("Inner", "portfolio", "portfolio.id=portfolioId")
            ->join("Inner", "stock s", "s.id=cashId")
            ->where(["userId", "=", $userId])
            ->and()
            ->where(["grossProfit", "IS NOT", null])
            ->all();
        return $this->json($allProfitAndTaxes);
    }

    #[Route('/updateProfitAndTaxes', methods: ['POST'])]
    public function updateProfitAndTaxes()
    {

        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);
        $dbInstance = new DbManipulation();

        $currentData = $data["currentData"];
        $superAdmin = $data["superUserId"];

        foreach ($currentData as $PTInstance) {
            $instance = new ProfitAndTaxes();
            $instance
                ->query()
                ->where(["id", "=", $PTInstance["id"]])
                ->first();

            $currentData = new ProfitAndTaxes(
                $PTInstance["id"],
                $PTInstance["stockId"],
                $PTInstance["cashId"],
                $PTInstance["portfolioId"],
                $PTInstance["userId"],
                $PTInstance["stockQuantity"],
                $PTInstance["boughtPrice"],
                $PTInstance["soldPrice"],
                $PTInstance["boughtDate"],
                $PTInstance["soldDate"],
                $PTInstance["grossProfit"],
                $PTInstance["taxesToPayPercantage"],
                $PTInstance["taxesToPay"],
                $PTInstance["managementFeesToPay"],
                $PTInstance["managementFeesToPayPercantage"],
                $PTInstance["netProfit"],
                $PTInstance["isPayed"]
            );
            // we compare, because it can be not updated.
            $result = $instance->compare($currentData);

            if ($result == false) {
                $dbInstance->add($currentData);
            }
            // trybwa da se naprawi logikata za prehwurlyane na dqalovete.

            // if ($currentData->getIsPayed() == true && $result == false) {
            if ($currentData->getIsPayed() == true) {
                // Update PortfolioStock, TransactionHistory, UserPortfolioStock, UserTransactionHistory
                // if ($currentData->getUserId() == $superAdmin) {
                // }
                $currency = new Stock();
                $currency->query()->where(['id', '=', $currentData->getCashId()])->first();

                $stock = new Stock();
                $stock->query()->where(['id', '=', $currentData->getStockId()])->first();

                $UserPortfolioStock = new UserPortfolioStock();

                // take the user and superAdminUser id
                $array = $UserPortfolioStock->query()
                    ->where(["stockId", "=",  $currentData->getCashId()])
                    ->and()
                    ->where(["portfolioId", "=", $currentData->getPortfolioId()])
                    ->and()
                    ->where(["userId", "IN", 1]);
            }
        }
        $dbInstance->commit();


        return new Response("OK");
    }
}
