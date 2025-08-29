<?php

/**
 * File: PorfolioTransactionController.php
 * Description: Provides functionality for handleling buying/selling stock and adding and removing cash from portfolio.
 * Author: Manoel Manev
 * Created: 2025-08-08
 */

namespace App\Controller;

use App\Core\BaseController;
use App\Core\Route;
use App\Service\StockTradeService;
use App\Core\Response;
use App\Service\DividendMaintenanceFeeService;

/**
 * Class PortfolioTransactionController
 *
 * Provides API endpoints for handling portfolio stock and cash transactions.
 * Routes in this controller are designed to receive POST requests with JSON payloads,
 * which are processed by the StockTradeService for execution.
 *
 * @package App\Controller
 */
class PortfolioTransactionController extends BaseController
{
    /*
     * ----------------------------
     *  STOCK MANIPULATION ROUTES
     * ----------------------------
     */

    /**
     * Buys stocks in a portfolio.
     *
     * Route: POST /buyStockInPortfolio
     *
     * Expected JSON body:
     * {
     *   "name": string,
     *   "symbol": string,
     *   "currency": string,
     *   "price": float,
     *   "quantity": float,
     *   "portfolioId": int,
     *   "date": string,
     *   "isStock": int,
     *   "allocations": array,
     *   "commission": int,
     *   "currencyCommission": string
     * }
     *
     * @return Response Returns HTTP 200 OK on successful purchase.
     */
    #[Route('/buyStockInPortfolio', methods: ["POST"])]
    public function buyStockInPortfolio()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $stockTradeService = new StockTradeService('BUY', $data);
        $stockTradeService->handleStockTradeLogic();
        return new Response("OK", 200);
    }

    /**
     * Sells stocks from a portfolio.
     *
     * Route: POST /sellStockInPortfolio
     *
     * Expected JSON body:
     * {
     *   "name": string,
     *   "symbol": string,
     *   "currency": string,
     *   "price": float,
     *   "quantity": float,
     *   "portfolioId": int,
     *   "date": string,
     *   "isStock": int,
     *   "allocations": array,
     *   "commission": int,
     *   "currencyCommission": string
     * }
     *
     * @return Response Returns HTTP 200 OK on successful sale.
     */
    #[Route('/sellStockInPortfolio', methods: ["POST"])]
    public function sellStockInPortfolio()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $stockTradeService = new StockTradeService('SELL', $data);
        $stockTradeService->handleStockTradeLogic();
        return new Response("OK", 200);
    }

    /*
     * ----------------------------
     *  CASH MANIPULATION ROUTES
     * ----------------------------
     */

    /**
     * Adds cash to a portfolio.
     *
     * Route: POST /addCashInPortfolio
     *
     * Expected JSON body:
     * {
     *   "name": string,
     *   "symbol": string,
     *   "currency": string,
     *   "price": float,
     *   "quantity": float,
     *   "portfolioId": int,
     *   "date": string,
     *   "isStock": int,
     *   "allocations": array,
     *   "commission": int,
     *   "currencyCommission": string
     * }
     *
     * @return Response Returns HTTP 200 OK on successful deposit.
     */
    #[Route('/addCashInPortfolio', methods: ["POST"])]
    public function addCashInPortfolio()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $stockTradeService = new StockTradeService('DEPOSIT', $data, true);
        $stockTradeService->handleStockTradeLogic();
        return new Response("OK", 200);
    }

    /**
     * Removes cash from a portfolio.
     *
     * Route: POST /removeCashFromPortfolio
     *
     * Expected JSON body:
     * {
     *   "name": string,
     *   "symbol": string,
     *   "currency": string,
     *   "price": float,
     *   "quantity": float,
     *   "portfolioId": int,
     *   "date": string,
     *   "isStock": int,
     *   "allocations": array,
     *   "commission": int,
     *   "currencyCommission": string
     * }
     *
     * @return Response Returns HTTP 200 OK on successful withdrawal.
     */
    #[Route('/removeCashFromPortfolio', methods: ["POST"])]
    public function removeCashFromPortfolio()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $stockTradeService = new StockTradeService('WITHDRAWAL', $data, true);
        $stockTradeService->handleStockTradeLogic();
        return new Response("OK", 200);
    }


    #[Route('/addDividentOrMaintenanceFee', methods: ["POST"])]
    public function addDivident()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $asdf = new DividendMaintenanceFeeService($data);
        return new Response("OK", 200);
    }
}
