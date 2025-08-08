<?php

/**
 * File: StockUserPositionService.php
 * Description: Provide handle update user position.
 * Author: Manoel Manev
 * Created: 2025-08-08
 */

namespace App\Service;

use App\Model\Stock;
use App\Model\Portfolio;
use App\Model\UserPortfolioStock;

use App\Core\DbManipulation;

/**
 * StockUserPositionService
 * 
 * Service responsible for updating or creating user stock positions inside a portfolio.
 * It can handle both stock trades and cash transactions associated with those trades.
 * 
 * Typical usage scenario:
 * - Buying or selling stocks for multiple users in a portfolio
 * - Adjusting cash balances after a stock transaction
 * - Creating new user-stock records if they do not already exist
 * 
 */
class StockUserPositionService
{
    /**
     * @var array<int,float> Allocation mapping: userId => quantity of stocks/cash change
     */
    private array $allocation;

    /**
     * @var float Price of the stock at the moment of transaction
     */
    private float $price;

    /**
     * @var string Action type: 'BUY' or 'SELL'
     */
    private string $action;

    /**
     * @var Stock Stock object representing the traded stock or cash instrument
     */
    private Stock $stock;

    /**
     * @var Portfolio Portfolio object representing the portfolio where positions are updated
     */
    private Portfolio $portfolio;

    /**
     * @var bool Whether cash balance should be adjusted after stock transactions
     */
    private bool $cashTransferAfterStockTransaction;

    /**
     * Constructor
     *
     * @param array<int,float> $allocation  User allocation mapping (userId => quantity)
     * @param float            $price       Price per stock unit
     * @param string           $action      Trade action ('BUY' or 'SELL')
     * @param Stock            $stock       Stock being traded
     * @param Portfolio        $portfolio   Portfolio where changes apply
     * @param bool             $cashTransferAfterStockTransaction Whether to adjust cash balances after a stock transaction
     */
    public function __construct(
        array $allocation,
        float $price,
        string $action,
        Stock $stock,
        Portfolio $portfolio,
        bool $cashTransferAfterStockTransaction = false
    ) {
        $this->allocation = $allocation;
        $this->price = $price;
        $this->action = $action;
        $this->stock = $stock;
        $this->portfolio = $portfolio;
        $this->cashTransferAfterStockTransaction = $cashTransferAfterStockTransaction;
    }

    /**
     * Sets the trade action ('BUY' or 'SELL')
     *
     * @param string $action
     */
    public function setAction(string $action): void
    {
        $this->action = $action;
    }

    /**
     * Sets the stock being traded
     *
     * @param Stock $stock
     */
    public function setStock(Stock $stock): void
    {
        $this->stock = $stock;
    }

    /**
     * Enables or disables cash transfer adjustments after stock transactions
     *
     * @param bool $state
     */
    public function setCashTransferAfterStockTransaction(bool $state): void
    {
        $this->cashTransferAfterStockTransaction = $state;
    }

    /**
     * Updates or creates stock/cash positions for all users in the allocation
     * 
     * Process:
     * 1. Loops through each user in the allocation.
     * 2. Checks if the user already owns the stock in the portfolio.
     * 3. If not, creates a new record.
     * 4. If yes, updates stock or cash quantities depending on:
     *      - BUY/SELL action
     *      - Whether the asset is cash or stock
     *      - Whether cash adjustments are enabled
     * 5. Persists all changes in the database and commits the transaction.
     *
     * @return void
     */
    public function updateUsersStocksPositionInPortfolio(): void
    {
        $db = new DbManipulation();

        foreach ($this->allocation as $userId => $quantity) {
            $instance = new UserPortfolioStock();
            $instanceOfUserStocks = $instance->query()
                ->where(["portfolioId", "=", $this->portfolio->getId()])
                ->and()
                ->where(["userId", "=", $userId])
                ->and()
                ->where(["stockId", "=", $this->stock->getId()])
                ->first();

            if (!$instanceOfUserStocks) {
                // Create new user-stock record
                $instance->setStockId($this->stock->getId());
                $instance->setUserId($userId);
                $instance->setPortfolioId($this->portfolio->getId());
                $instance->setStockQuantity($quantity);
            } else {
                // Update existing record
                if ($this->action == "BUY") {
                    if ($this->stock->getIsCash() && $this->cashTransferAfterStockTransaction) {
                        $instance->setStockQuantity($instance->getStockQuantity() + ($quantity * $this->price));
                    } else {
                        $instance->setStockQuantity($instance->getStockQuantity() + $quantity);
                    }
                } else {
                    if ($this->stock->getIsCash() && $this->cashTransferAfterStockTransaction) {
                        $instance->setStockQuantity($instance->getStockQuantity() - ($quantity * $this->price));
                    } else {
                        $instance->setStockQuantity($instance->getStockQuantity() - $quantity);
                    }
                }
            }

            $db->add($instance);
        }

        $db->commit();
    }
}
