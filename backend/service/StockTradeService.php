<?php

/**
 * File: StockTradeService.php
 * Description: Provide handle of stock buy/sell stock and deposit and withdraw money.
 * Author: Manoel Manev
 * Created: 2025-08-08
 */

namespace App\Service;

use App\Model\Portfolio;
use App\Model\Stock;
use App\Controller\StockController;
use App\Controller\CurrencyExchangeRateController;
use App\Model\PortfolioStock;
use App\Core\DbManipulation;
use App\Controller\TransactionHistoryController;
use App\Core\Response;
use App\Model\ProfitAndTaxes;
use App\Service\StockUserPositionService;
use App\Service\ProfitAndTaxesService;

/**
 * Class StockTradeService
 *
 * Encapsulates the business logic for stock and cash transactions.
 * This includes both direct cash operations (deposit/withdraw) and
 * trades involving both a stock and its cash equivalent.
 *
 * Example workflows:
 * - Deposit cash into a portfolio.
 * - Buy a stock, deducting cash from the portfolio.
 * - Sell a stock, adding cash to the portfolio.
 *
 * @package App\Service
 */
class StockTradeService
{
    /**
     * The action to perform (e.g., "BUY", "SELL", "DEPOSIT", "WITHDRAW").
     *
     * @var string
     */
    private string $action;

    /**
     * Transaction-related data including:
     * - currency
     * - portfolioId
     * - quantity
     * - price
     * - name
     * - symbol
     * - allocations
     * - date
     *
     * @var array
     */
    private array $data;

    /**
     * Whether the transaction involves cash only (true) or stock + cash (false).
     *
     * @var bool
     */
    private bool $isCashOnly;

    /**
     * Portfolio involved in the transaction.
     *
     * @var Portfolio
     */
    private Portfolio $portfolio;

    /**
     * Target stock involved in the trade.
     *
     * @var Stock
     */
    private Stock $stock;

    /**
     * Cash-equivalent "stock" entity.
     *
     * @var Stock
     */
    private Stock $cash;

    /**
     * PortfolioStock model for the stock being traded.
     *
     * @var PortfolioStock
     */
    private PortfolioStock $PSModelStock;

    /**
     * PortfolioStock model for the cash equivalent.
     *
     * @var PortfolioStock
     */
    private PortfolioStock $PSModelCash;

    /**
     * StockTradeService constructor.
     *
     * @param string $action     Action type (BUY, SELL, DEPOSIT, WITHDRAW).
     * @param array  $data       Associative array containing transaction details.
     * @param bool   $isCashOnly Whether transaction is cash-only.
     */
    public function __construct(string $action, array $data, bool $isCashOnly = false)
    {
        $this->action = $action;
        $this->data = $data;
        $this->isCashOnly = $isCashOnly;
    }

    /**
     * Main entry point for handling a trade.
     *
     * Steps:
     * 1. Load portfolio.
     * 2. Ensure cash record exists in portfolio.
     * 3. If cash-only:
     *    - Update cash balance.
     *    - Create transaction history.
     *    - Update user position.
     * 4. If stock trade:
     *    - Ensure stock record exists.
     *    - Update stock and cash balances.
     *    - Create transaction history for both stock and cash.
     *    - Update user positions for both stock and cash.
     *
     * @return void
     */
    public function handleStockTradeLogic(): void
    {
        // Extract transaction details
        $stockCurrency   = $this->data["currency"];
        $portfolioId     = $this->data["portfolioId"];
        $stockQuantity   = $this->data["quantity"];
        $transactionDate = $this->data['date'];

        // Load portfolio
        $this->portfolio = $this->getPortfolioModelInstance($portfolioId);

        // Ensure cash "stock" exists
        $this->cash = $this->getStockModelInstance("$stockCurrency cash", $stockCurrency, $stockCurrency, 1, true);
        $this->PSModelCash = $this->getPortfolioStockModelInstance($this->cash, $this->portfolio);

        if ($this->isCashOnly) {
            // Update cash balance
            $this->handleStockTransaction();

            // Record cash transaction
            $transactionHistory = new TransactionHistoryController();
            $transactionHistory->createNewTransactionHistory(
                $this->data['allocations'],
                $this->cash,
                $this->portfolio,
                $stockQuantity,
                1,
                $transactionDate,
                $this->action
            );

            // Update user portfolio positions
            $sups = new StockUserPositionService(
                $this->data["allocations"],
                0,
                $this->action,
                $this->cash,
                $this->portfolio
            );
            $sups->updateUsersStocksPositionInPortfolio();
        } else {
            // Prepare stock entity
            $stockName   = $this->data["name"];
            $stockSymbol = $this->data["symbol"];
            $stockPrice  = $this->data["price"];

            $this->stock = $this->getStockModelInstance($stockName, $stockSymbol, $stockCurrency, $stockPrice);
            $this->PSModelStock = $this->getPortfolioStockModelInstance($this->stock, $this->portfolio);

            // Process trade between stock and cash
            $this->handleStockTransaction();

            // Record stock transaction
            $transactionHistory = new TransactionHistoryController();
            $transactionHistory->createNewTransactionHistory(
                $this->data['allocations'],
                $this->stock,
                $this->portfolio,
                $stockQuantity,
                $stockPrice,
                $transactionDate,
                $this->action
            );

            // Record cash transaction (reverse action)
            $reverseAction = $this->action === "BUY" ? "SELL" : "BUY";
            $transactionHistory->createNewTransactionHistory(
                $this->data['allocations'],
                $this->cash,
                $this->portfolio,
                $stockQuantity,
                $stockPrice,
                $transactionDate,
                $reverseAction,
                true
            );

            // Update stock position
            $sups = new StockUserPositionService(
                $this->data["allocations"],
                $this->data["price"],
                $this->action,
                $this->stock,
                $this->portfolio
            );
            $sups->updateUsersStocksPositionInPortfolio();

            // Update cash position
            $sups->setAction($reverseAction);
            $sups->setStock($this->cash);
            $sups->setCashTransferAfterStockTransaction(true);
            $sups->updateUsersStocksPositionInPortfolio();

            // pass portfolio, stock, users id, date, price
            $pats = new ProfitAndTaxesService(
                $this->stock->getId(),
                $this->cash->getId(),
                $this->portfolio->getId(),
                $this->data["price"],
                $transactionDate, // нз дали ни трябва
                $this->data["allocations"],
                $this->action
            );
            $pats->handleshit();
        }
    }

    /**
     * Retrieves a portfolio model by its ID.
     *
     * @param int $portfolioId Portfolio ID.
     * @return Portfolio
     */
    private function getPortfolioModelInstance(int $portfolioId): Portfolio
    {
        return (new Portfolio())->query()->where(['id', '=', $portfolioId])->first();
    }

    /**
     * Retrieves or creates a Stock model.
     *
     * @param string $stockName     Stock name.
     * @param string $stockSymbol   Stock symbol.
     * @param string $stockCurrency Stock currency code.
     * @param float  $stockPrice    Stock price.
     * @param bool   $isCash        Whether this is a cash-equivalent stock.
     * @return Stock
     */
    private function getStockModelInstance(
        string $stockName,
        string $stockSymbol,
        string $stockCurrency,
        float $stockPrice,
        bool $isCash = false
    ): Stock {
        $stock = new Stock();
        $existingStock = $stock->query()->where(['symbol', '=', $stockSymbol])->first();

        if (!$existingStock) {
            // Create stock record
            $newStock = new StockController();
            $newStock->createNewStockByMethod($stockName, $stockSymbol, $stockCurrency, $stockPrice, $isCash);

            $stock->query()->where(['symbol', '=', $stockSymbol])->first();

            // Create currency exchange rate if cash stock
            if ($isCash) {
                $newCurrencyConnections = new CurrencyExchangeRateController();
                $newCurrencyConnections->createNewCurrencyExchangeRatebyMethod($stock->getId());
            }
        }
        return $stock;
    }

    /**
     * Retrieves or creates a PortfolioStock entry for the given portfolio and stock.
     *
     * @param Stock     $stockInstance     Stock instance.
     * @param Portfolio $portfolioInstance Portfolio instance.
     * @return PortfolioStock
     */
    private function getPortfolioStockModelInstance(Stock $stockInstance, Portfolio $portfolioInstance): PortfolioStock
    {
        $spm = new PortfolioStock();
        $existing = $spm->query()
            ->where(["idPortfolio", "=", $portfolioInstance->getId()])
            ->and()
            ->where(["idStock", "=", $stockInstance->getId()])
            ->first();

        if (!$existing) {
            $db = new DbManipulation();
            $spm->setIdPortfolio($portfolioInstance->getId());
            $spm->setIdStock($stockInstance->getId());
            $spm->setNumStocks(0);
            $spm->setPrice(0);
            $spm->setValueOfStock(0);
            $db->add($spm);
            $db->commit();
        }
        return $spm;
    }

    /**
     * Gets the current monetary value of a portfolio's holding for a given stock.
     *
     * @param PortfolioStock $PSInstance PortfolioStock instance.
     * @return float
     */
    private function getCurrentAmountOfMoneyInPortfolio(PortfolioStock $PSInstance): float
    {
        return $PSInstance->getValueOfStock();
    }

    /**
     * Handles the core stock and/or cash balance adjustments for the transaction.
     *
     * - For cash-only: adjusts the cash balance.
     * - For stock trades: adjusts both stock and cash balances.
     *
     * @return Response|void
     */
    private function handleStockTransaction()
    {
        $stockQuantity = $this->data["quantity"];

        if ($this->isCashOnly) {
            // Update cash-only balance
            $stockPortfolioManagementInstance = $this->updatePortfolioStockBalance(
                $this->PSModelCash,
                $stockQuantity,
                1,
                $this->action
            );

            $db = new DbManipulation();
            $db->add($stockPortfolioManagementInstance);
            $db->commit();
        } else {
            $stockPrice = $this->data["price"];
            $totalPrice = $stockPrice * $stockQuantity;

            // Ensure enough cash for BUY
            if ($this->action === "BUY") {
                $availableCash = $this->getCurrentAmountOfMoneyInPortfolio($this->PSModelCash);
                if ($availableCash < $totalPrice) {
                    return new Response("Not enough Cash", 404);
                }
            }

            // Update stock balance
            $stockPortfolioManagementInstance = $this->updatePortfolioStockBalance(
                $this->PSModelStock,
                $stockQuantity,
                $stockPrice,
                $this->action
            );

            // Update cash balance (reverse action)
            $reverseAction = $this->action === "BUY" ? "SELL" : "BUY";
            $stockPortfolioManagementInstanceForCash = $this->updatePortfolioStockBalance(
                $this->PSModelCash,
                $stockPrice * $stockQuantity,
                1,
                $reverseAction
            );

            $db = new DbManipulation();
            $db->add($stockPortfolioManagementInstance);
            $db->add($stockPortfolioManagementInstanceForCash);
            $db->commit();
        }
    }

    /**
     * Adjusts the quantity, value, and average price for a portfolio stock.
     *
     * @param PortfolioStock $PSInstance       PortfolioStock to update.
     * @param float          $stockQuantity    Quantity of stock.
     * @param float          $stockPrice       Price per unit.
     * @param string         $transactionType  "BUY", "SELL", "DEPOSIT", "WITHDRAW".
     * @return PortfolioStock Updated PortfolioStock instance.
     */
    private function updatePortfolioStockBalance(
        PortfolioStock $PSInstance,
        float $stockQuantity,
        float $stockPrice,
        string $transactionType
    ): PortfolioStock {
        $isBuy = strtolower($transactionType) === 'buy' || strtolower($transactionType) === "deposit";

        $currentQty = $PSInstance->getNumStocks();
        $currentVal = $PSInstance->getValueOfStock();

        if ($isBuy) {
            $newQty = $currentQty + $stockQuantity;
            $newVal = $currentVal + ($stockPrice * $stockQuantity);
            $avgPrice = $newVal / $newQty;

            $PSInstance->setNumStocks($newQty);
            $PSInstance->setPrice($avgPrice);
            $PSInstance->setValueOfStock($newVal);
        } else {
            $newQty = $currentQty - $stockQuantity;
            $newVal = $newQty * $PSInstance->getPrice();

            $PSInstance->setNumStocks($newQty);
            $PSInstance->setValueOfStock($newVal);
        }
        return $PSInstance;
    }
}
