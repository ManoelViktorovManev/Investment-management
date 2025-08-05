<?php

namespace App\Service;

use App\Model\Stock;
use App\Core\DbManipulation;
use App\Model\UserPortfolioStock;
use App\Model\PortfolioStock;

class StockSplitService
{

    private Stock $stock;

    private int $numbersOfStocksBeforeSplit;
    private int $numbersOfStocksAfterSplit;

    public function __construct(Stock $stock, int $beforeSplit, int $afterSplit)
    {
        $this->stock = $stock;
        $this->numbersOfStocksBeforeSplit = $beforeSplit;
        $this->numbersOfStocksAfterSplit = $afterSplit;
    }

    public function handleStockSplit()
    {
        $db = new DbManipulation();
        $instance = new UserPortfolioStock();
        $array = $instance->query()->where(["stockId", "=", $this->stock->getId()])->all(true);
        foreach ($array as $elements) {
            $elements->setStockQuantity($elements->getStockQuantity() * (float)($this->numbersOfStocksAfterSplit / $this->numbersOfStocksBeforeSplit));
            $db->add($elements);
        }


        $instance = new PortfolioStock();
        $array = $instance->query()->where(["idStock", "=", $this->stock->getId()])->all(true);
        foreach ($array as $elements) {
            $elements->setNumStocks($elements->getNumStocks() * (float)($this->numbersOfStocksAfterSplit / $this->numbersOfStocksBeforeSplit));
            $elements->setPrice($elements->getPrice() / (float)($this->numbersOfStocksAfterSplit / $this->numbersOfStocksBeforeSplit));
            $db->add($elements);
        }
        $db->commit();
    }
}
