<?php

namespace App\Controller;

use App\Core\BaseController;
use App\Core\Response;
use App\Core\Route;

use App\Core\DbManipulation;
use App\Model\PortfolioStock;
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
}
