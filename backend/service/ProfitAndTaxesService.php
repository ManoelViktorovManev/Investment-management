<?php

namespace App\Service;

use App\Model\ProfitAndTaxes;
use App\Core\DbManipulation;

class ProfitAndTaxesService
{
    private int $stockId;
    private int $portfolioId;
    private float $price;
    private string $date;
    private array $allocations;
    private string $action;

    private DbManipulation $dbm;

    /*
    private ?int $id;
    private int $stockId; // ok
    private int $porfolioId; // ok
    private int $userId;  // ok
    private float $stockQunatity;   // ok
    private float $boughtPrice; // ok
    private float $soldPrice;
    private string $boughtDate; // ok
    private string $soldDate;
    private float $grossProfit; // here we are done, za6oto nyama powe4e informaciya nagore da populwa6
    private float $taxesToPayPecantage;
    private float $taxesToPay;
    private float $managementFeesToPay;
    private float $managementFeesToPayPercantage;
    private float $netProfit;
    private bool $isPayed;
    */
    public function __construct(int $stockId, int $portfolioId, float $price, string $date, array $allocations, string $action)
    {
        $this->stockId = $stockId;
        $this->portfolioId = $portfolioId;
        $this->price = $price;
        $this->date = $date;
        $this->allocations = $allocations;
        $this->action = $action;
        $this->dbm = new DbManipulation();
    }
    public function handleshit()
    {
        foreach ($this->allocations as $userId => $allocation) {
            $instance = $this->getProfitAndTaxesModel($userId);
            if ($this->action == "BUY") {
                // calculate current price
                if (is_null($instance->getStockQunatity()) || is_null($instance->getBoughtPrice())) {
                    $instance->setStockQunatity($allocation);
                    $instance->setBoughtPrice($this->price);
                } else {
                    $newPrice = $this->calculateAverageBoughtPrice($instance, $allocation);
                    $instance->setStockQunatity($allocation + $instance->getStockQunatity());
                    $instance->setBoughtPrice($newPrice);
                }
            } else {
                // remember the current amount of stocks
                $rememberOldStockAllocation = $instance->getStockQunatity();

                // set the new quantity so to calculate the return
                $instance->setStockQunatity($allocation);
                $instance->setSoldPrice($this->price);
                $instance->setGrossProfit($this->calculateGrossProfit($instance));

                // create new instance so now we have the rest of amount of stocks 
                $newInstance = new ProfitAndTaxes();

                $newInstance->setUserId($instance->getUserId());
                $newInstance->setPorfolioId($instance->getPortfolioId());
                $newInstance->setStockId($instance->getStockId());
                $newInstance->setStockQunatity($rememberOldStockAllocation - $allocation);
                $newInstance->setBoughtPrice($instance->getBoughtPrice());

                $this->dbm->add($newInstance);
            }

            $this->dbm->add($instance);
        }
        $this->dbm->commit();
    }

    private function getProfitAndTaxesModel(int $userId): ProfitAndTaxes
    {
        $instance = new ProfitAndTaxes();
        $existing = $instance->query()
            ->where(['userId', '=', $userId])
            ->and()
            ->where(['portfolioId', '=', $this->portfolioId])
            ->and()
            ->where(['stockId', '=', $this->stockId])
            ->and()
            ->where(['grossProfit', 'IS', null])
            ->first();

        if (!$existing) {
            $db = new DbManipulation();
            $instance->setUserId($userId);
            $instance->setPorfolioId($this->portfolioId);
            $instance->setStockId($this->stockId);
            $db->add($instance);
            $db->commit();
        }

        return $instance;
    }
    private function calculateGrossProfit(ProfitAndTaxes $instance): float
    {
        $investedMoneys = $instance->getBoughtPrice() * $instance->getStockQunatity();

        $afterSellingMoneys = $instance->getSoldPrice() * $instance->getStockQunatity();

        return round($afterSellingMoneys - $investedMoneys, 4, PHP_ROUND_HALF_DOWN);
    }
    private function calculateAverageBoughtPrice(ProfitAndTaxes $instance, $allocation): float
    {
        //TODO: ROUND to four number.
        $currentValue = $instance->getStockQunatity() * $instance->getBoughtPrice();
        $addingValue = $this->price * $allocation;
        $numberOfAllStocks = $allocation + $instance->getStockQunatity();

        $finalCalculation = ($currentValue + $addingValue) / $numberOfAllStocks;
        return round($finalCalculation, 4, PHP_ROUND_HALF_DOWN);
    }
}
