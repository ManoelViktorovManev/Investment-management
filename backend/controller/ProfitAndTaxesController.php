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

                $currency = new Stock();
                $currency->query()->where(['id', '=', $currentData->getCashId()])->first();

                $stock = new Stock();
                $stock->query()->where(['id', '=', $currentData->getStockId()])->first();

                $portfolio = new Portfolio();
                $portfolio->query()->where(['id', '=', $currentData->getPortfolioId()])->first();

                $UserPortfolioStock = new UserPortfolioStock();

                // take the user and superAdminUser id
                $whereStatement = null;
                if ($currentData->getUserId() == $superAdmin) {
                    $whereStatement = [$superAdmin];
                } else {
                    $whereStatement = [$currentData->getUserId(), $superAdmin];
                }
                $array = $UserPortfolioStock->query()
                    ->where(["stockId", "=",  $currentData->getCashId()])
                    ->and()
                    ->where(["portfolioId", "=", $currentData->getPortfolioId()])
                    ->and()
                    ->where(["userId", "IN", $whereStatement])
                    ->all(true);

                if ($currentData->getUserId() == $superAdmin) {
                    $array[0]->setStockQuantity($array[0]->getStockQuantity() - $currentData->getTaxesToPay());

                    $dbInstance->add($array[0]);
                } else {
                    if ($array[0]->getUserId() == $superAdmin) {
                        $array[1]->setStockQuantity($array[1]->getStockQuantity() - $currentData->getTaxesToPay() - $currentData->getManagementFeesToPay());
                        $array[0]->setStockQuantity($array[0]->getStockQuantity() + $currentData->getManagementFeesToPay());
                    } else {
                        $array[1]->setStockQuantity($array[1]->getStockQuantity() + $currentData->getManagementFeesToPay());
                        $array[0]->setStockQuantity($array[0]->getStockQuantity() - $currentData->getTaxesToPay() - $currentData->getManagementFeesToPay());
                    }
                    // add them 
                    $dbInstance->add($array[0]);
                    $dbInstance->add($array[1]);
                }


                $psinstance = new PortfolioStock();
                $psinstance
                    ->query()
                    ->where(["idPortfolio", "=", $currentData->getPortfolioId()])
                    ->and()
                    ->where(["idStock", "=", $currentData->getCashId()])
                    ->first();

                // only remove taxes, because management fees if transfered to the superAdmin
                $psinstance->setNumStocks($psinstance->getNumStocks() - $currentData->getTaxesToPay());
                $psinstance->setValueOfStock($psinstance->getNumStocks());
                //add them
                $dbInstance->add($psinstance);

                //transactionhistory
                $transactionHistory = new TransactionHistoryController();
                $transactionHistory->createNewTransactionHistory(
                    $currentData->getUserId() == $superAdmin ? [$superAdmin => $currentData->getTaxesToPay()] : [$currentData->getUserId() => $currentData->getTaxesToPay()], // OK
                    $currency, // ok
                    $portfolio, // ok
                    $currentData->getTaxesToPay(), // ok
                    1, //OK ???
                    date("Y-m-d"), // OK 
                    "Goverment Taxes" // OK
                );
                if ($currentData->getUserId() != $superAdmin) {
                    $transactionHistory->createNewTransactionHistory(
                        [$currentData->getUserId() => $currentData->getManagementFeesToPay(), $superAdmin => $currentData->getManagementFeesToPay()], // OK
                        $currency, // ok
                        $portfolio, // ok
                        $currentData->getManagementFeesToPay(), // ok
                        1, //OK
                        date("Y-m-d"), // OK 
                        "Management Fees" // OK
                    );
                }
            }
        }
        $dbInstance->commit();


        return new Response("OK");
    }
}
