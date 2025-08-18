<?php

namespace App\Model;

use App\Core\BaseModel;

class ProfitAndTaxes extends BaseModel
{
    private ?int $id;
    private int $stockId;
    private int $cashId;
    private int $portfolioId;
    private int $userId;
    private ?float $stockQunatity;
    private ?float $boughtPrice;
    private ?float $soldPrice;
    private ?string $boughtDate;
    private ?string $soldDate;
    private ?float $grossProfit;
    private ?float $taxesToPayPecantage;
    private ?float $taxesToPay;
    private ?float $managementFeesToPay;
    private ?float $managementFeesToPayPercantage;
    private ?float $netProfit;
    private ?bool $isPayed;

    public function __construct(?int $id = null, int $stockId = 0, int $cashId = 0, int $portfolioId = 0, int $userId = 0, ?float $stockQunatity = null, ?float $boughtPrice = null, ?float $soldPrice = null, ?string $boughtDate = null, ?string $soldDate = null, ?float $grossProfit = null, ?float $taxesToPayPecantage = null, ?float $taxesToPay = null, ?float $managementFeesToPay = null, ?float $managementFeesToPayPercantage = null, ?float $netProfit = null, ?bool $isPayed = null)
    {
        $this->id = $id;
        $this->stockId = $stockId;
        $this->cashId = $cashId;
        $this->portfolioId = $portfolioId;
        $this->userId = $userId;
        $this->stockQunatity = $stockQunatity;
        $this->boughtPrice = $boughtPrice;
        $this->soldPrice = $soldPrice;
        $this->boughtDate = $boughtDate;
        $this->soldDate = $soldDate;
        $this->grossProfit = $grossProfit;
        $this->taxesToPayPecantage = $taxesToPayPecantage;
        $this->taxesToPay = $taxesToPay;
        $this->managementFeesToPay = $managementFeesToPay;
        $this->managementFeesToPayPercantage = $managementFeesToPayPercantage;
        $this->netProfit = $netProfit;
        $this->isPayed = $isPayed;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): void
    {
        $this->id = $id;
    }

    public function getStockId(): int
    {
        return $this->stockId;
    }

    public function setStockId(int $stockId): void
    {
        $this->stockId = $stockId;
    }

    public function getCashId(): int
    {
        return $this->cashId;
    }

    public function setCashId(int $cashId): void
    {
        $this->cashId = $cashId;
    }

    public function getPortfolioId(): int
    {
        return $this->portfolioId;
    }

    public function setPorfolioId(int $portfolioId): void
    {
        $this->portfolioId = $portfolioId;
    }

    public function getUserId(): int
    {
        return $this->userId;
    }

    public function setUserId(int $userId): void
    {
        $this->userId = $userId;
    }

    public function getStockQunatity(): ?float
    {
        return $this->stockQunatity;
    }

    public function setStockQunatity(float $stockQunatity): void
    {
        $this->stockQunatity = $stockQunatity;
    }

    public function getBoughtPrice(): ?float
    {
        return $this->boughtPrice;
    }

    public function setBoughtPrice(float $boughtPrice): void
    {
        $this->boughtPrice = $boughtPrice;
    }

    public function getSoldPrice(): ?float
    {
        return $this->soldPrice;
    }

    public function setSoldPrice(float $soldPrice): void
    {
        $this->soldPrice = $soldPrice;
    }

    public function getBoughtDate(): ?string
    {
        return $this->boughtDate;
    }

    public function setBoughtDate(string $boughtDate): void
    {
        $this->boughtDate = $boughtDate;
    }

    public function getSoldDate(): ?string
    {
        return $this->soldDate;
    }

    public function setSoldDate(string $soldDate): void
    {
        $this->soldDate = $soldDate;
    }

    public function getGrossProfit(): ?float
    {
        return $this->grossProfit;
    }

    public function setGrossProfit(float $grossProfit): void
    {
        $this->grossProfit = $grossProfit;
    }

    public function getTaxesToPayPecantage(): ?float
    {
        return $this->taxesToPayPecantage;
    }

    public function setTaxesToPayPecantage(float $taxesToPayPecantage): void
    {
        $this->taxesToPayPecantage = $taxesToPayPecantage;
    }

    public function getTaxesToPay(): ?float
    {
        return $this->taxesToPay;
    }

    public function setTaxesToPay(float $taxesToPay): void
    {
        $this->taxesToPay = $taxesToPay;
    }

    public function getManagementFeesToPay(): ?float
    {
        return $this->managementFeesToPay;
    }

    public function setManagementFeesToPay(float $managementFeesToPay): void
    {
        $this->managementFeesToPay = $managementFeesToPay;
    }

    public function getManagementFeesToPayPercantage(): ?float
    {
        return $this->managementFeesToPayPercantage;
    }

    public function setManagementFeesToPayPercantage(float $managementFeesToPayPercantage): void
    {
        $this->managementFeesToPayPercantage = $managementFeesToPayPercantage;
    }

    public function getNetProfit(): ?float
    {
        return $this->netProfit;
    }

    public function setNetProfit(float $netProfit): void
    {
        $this->netProfit = $netProfit;
    }

    public function getIsPayed(): ?bool
    {
        return $this->isPayed;
    }

    public function setIsPayed(bool $isPayed): void
    {
        $this->isPayed = $isPayed;
    }

    public function compare(ProfitAndTaxes $otherInstance): bool
    {
        return $this->id === $otherInstance->id &&
            $this->stockId === $otherInstance->stockId &&
            $this->cashId === $otherInstance->cashId &&
            $this->portfolioId === $otherInstance->portfolioId &&
            $this->userId === $otherInstance->userId &&
            $this->stockQunatity === $otherInstance->stockQunatity &&
            $this->boughtPrice === $otherInstance->boughtPrice &&
            $this->soldPrice === $otherInstance->soldPrice &&
            $this->boughtDate === $otherInstance->boughtDate &&
            $this->soldDate === $otherInstance->soldDate &&
            $this->grossProfit === $otherInstance->grossProfit &&
            $this->taxesToPayPecantage === $otherInstance->taxesToPayPecantage &&
            $this->taxesToPay === $otherInstance->taxesToPay &&
            $this->managementFeesToPay === $otherInstance->managementFeesToPay &&
            $this->managementFeesToPayPercantage === $otherInstance->managementFeesToPayPercantage &&
            $this->netProfit === $otherInstance->netProfit &&
            $this->isPayed === $otherInstance->isPayed;
    }
}
