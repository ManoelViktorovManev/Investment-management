<?php

/**
 * File: StockSplitService.php
 * Description: Provide handle of stock split logic.
 * Author: Manoel Manev
 * Created: 2025-08-08
 */

namespace App\Service;

use App\Model\Stock;
use App\Core\DbManipulation;
use App\Model\UserPortfolioStock;
use App\Model\PortfolioStock;

/**
 * Class StockSplitService
 *
 * Handles the application of stock splits to all relevant database records.
 * Ensures that both user portfolio allocations and portfolio stock records
 * reflect the new share counts and adjusted prices after the split.
 *
 * Example:
 * - Before: 1 share at $100
 * - After  : 2 shares at $50
 *
 * @package App\Service
 */
class StockSplitService
{
    /**
     * The stock undergoing a split.
     *
     * @var Stock
     */
    private Stock $stock;

    /**
     * Number of shares before the split.
     *
     * @var int
     */
    private int $numbersOfStocksBeforeSplit;

    /**
     * Number of shares after the split.
     *
     * @var int
     */
    private int $numbersOfStocksAfterSplit;

    /**
     * StockSplitService constructor.
     *
     * @param Stock $stock       Stock entity representing the stock to split.
     * @param int   $beforeSplit Number of shares before the split ratio.
     * @param int   $afterSplit  Number of shares after the split ratio.
     */
    public function __construct(Stock $stock, int $beforeSplit, int $afterSplit)
    {
        $this->stock = $stock;
        $this->numbersOfStocksBeforeSplit = $beforeSplit;
        $this->numbersOfStocksAfterSplit = $afterSplit;
    }

    /**
     * Processes the stock split and updates all relevant records.
     *
     * Steps:
     * 1. Updates each user's stock quantity in `UserPortfolioStock`.
     * 2. Updates each portfolio's stock quantity and adjusts price in `PortfolioStock`.
     * 3. Commits the database transaction.
     *
     * The calculation uses the ratio:
     * `(afterSplit / beforeSplit)` to adjust quantities,
     * and the inverse for adjusting the price.
     *
     * @return void
     */
    public function handleStockSplit(): void
    {
        $db = new DbManipulation();

        // Update user-owned stocks
        $instance = new UserPortfolioStock();
        $array = $instance->query()->where(["stockId", "=", $this->stock->getId()])->all(true);
        foreach ($array as $elements) {
            $elements->setStockQuantity(
                $elements->getStockQuantity() * (float)($this->numbersOfStocksAfterSplit / $this->numbersOfStocksBeforeSplit)
            );
            $db->add($elements);
        }

        // Update portfolio-level stock holdings
        $instance = new PortfolioStock();
        $array = $instance->query()->where(["idStock", "=", $this->stock->getId()])->all(true);
        foreach ($array as $elements) {
            $elements->setNumStocks(
                $elements->getNumStocks() * (float)($this->numbersOfStocksAfterSplit / $this->numbersOfStocksBeforeSplit)
            );
            $elements->setPrice(
                $elements->getPrice() / (float)($this->numbersOfStocksAfterSplit / $this->numbersOfStocksBeforeSplit)
            );
            $db->add($elements);
        }

        // Commit changes in a single transaction
        $db->commit();
    }
}
