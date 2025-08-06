<?php

namespace App\Controller;

use App\Core\BaseController;
use App\Core\Route;
use App\Service\StockTradeService;
use App\Core\Response;


class PortfolioTransactionController extends BaseController
{
    // old name: PortfolioTradeController
    /*

        STOCK MANIPULATION

    */
    #[Route('/buyStockInPortfolio', methods: ["POST"])]
    public function buyStockInPortfolio()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $stockTradeService = new StockTradeService('BUY', $data);
        $stockTradeService->handleStockTradeLogic();
        return new Response("OK", 200);
    }

    #[Route('/sellStockInPortfolio', methods: ["POST"])]
    public function sellStockInPortfolio()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $stockTradeService = new StockTradeService('SELL', $data);
        $stockTradeService->handleStockTradeLogic();
        return new Response("OK", 200);
    }

    /*

        CASH MANIPULATION

    */
    #[Route('/addCashInPortfolio')]
    public function addCashInPortfolio()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $stockTradeService = new StockTradeService('DEPOSIT', $data, true);
        $stockTradeService->handleStockTradeLogic();
        return new Response("OK", 200);
    }

    #[Route('/removeCashFromPortfolio', methods: ["POST"])]
    public function removeCashFromPortfolio()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $stockTradeService = new StockTradeService('WITHDRAWAL', $data, true);
        $stockTradeService->handleStockTradeLogic();
        return new Response("OK", 200);
    }
}
