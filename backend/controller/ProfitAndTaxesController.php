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
            ->where(["userId", "=", $userId])
            ->and()
            ->where(["grossProfit", "IS NOT", null])
            ->all();
        return $this->json($allProfitAndTaxes);
    }
}
