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
            ->select("profitandtaxes.id, stock.name as stockName, stockId, portfolio.name as portfolioName, portfolioId,
            s.name as currencyName, cashId, profitandtaxes.stockQunatity, profitandtaxes.boughtPrice,
            profitandtaxes.soldPrice, profitandtaxes.grossProfit, profitandtaxes.taxesToPayPecantage,
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


        // $id = $data["id"];
        // ????? look down and think about isPayed dali ni trebwa
        // TRQBWA Ni da znaem w kakwa waluta sme demek, trqbwa da se pazi edno pole za walutata koya e

        $currentData = $data["currentData"];

        foreach ($currentData as $PTInstance) {
            $instance = new ProfitAndTaxes();
            $instance
                ->query()
                ->where(["id", "=", $PTInstance["id"]])
                ->first();



            // here we have to compare
            // problem s tipa? $PTInstance["id"]=> string????
            $asdf = new ProfitAndTaxes(
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
                $PTInstance["taxesToPay"],
                $PTInstance["stockId"],
                $PTInstance["stockId"],
                $PTInstance["stockId"],
                $PTInstance["stockId"],
                $PTInstance["stockId"]
            );
            $result = $instance->compare($asdf);
        }


        return new Response("OK");
    }
}
