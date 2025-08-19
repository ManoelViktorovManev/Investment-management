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
            $result = $instance->compare($currentData);

            if ($result == false) {
                $dbInstance->add($currentData);
            }
            // if($currentData->getIsPayed() == true)
        }
        $dbInstance->commit();


        return new Response("OK");
    }
}
