<?php

namespace App\Model;

use App\Core\BaseModel;

class TaxesUsers extends BaseModel
{
    private ?int $id;
    private int $taxesId;
    private int $userId;
    private float $IBTC;
    private float $taxes10Percent;
    private float $IBC;
    private float $commision;
    private float $netIncome;
    private bool $taxesAndCommisionPayed;

    public function __construct(?int $id = null, int $taxesId = 0, int $userId = 0, float $IBTC = 0, float $taxes10Percent = 0,
        float $IBC = 0, float $commision = 0, float $netIncome = 0, bool $taxesAndCommisionPayed = false
    )
    {
        $this->id = $id;
        $this->taxesId = $taxesId;
        $this->userId = $userId;
        $this->IBTC = $IBTC;
        $this->taxes10Percent = $taxes10Percent;
        $this->IBC = $IBC;
        $this->commision = $commision;
        $this->netIncome = $netIncome;
        $this->taxesAndCommisionPayed = $taxesAndCommisionPayed;
        
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function getTaxesId(): int
    {
        return $this->taxesId;
    }

    public function setTaxesId(int $taxesId): void
    {
        $this->taxesId = $taxesId;
    }

    public function getUserId(): int
    {
        return $this->userId;
    }

    public function setUserId(int $userId): void
    {
        $this->userId = $userId;
    }

    public function getIBTC(): float
    {
        return $this->IBTC;
    }

    public function setIBTC(float $IBTC): void
    {
        $this->IBTC = $IBTC;
    }

    public function getTaxes10Percent(): float
    {
        return $this->taxes10Percent;
    }

    public function setTaxes10Percent(float $taxes10Percent): void
    {
        $this->taxes10Percent = $taxes10Percent;
    }

    public function getIBC(): float
    {
        return $this->IBC;
    }

    public function setIBC(float $IBC): void
    {
        $this->IBC = $IBC;
    }

    public function getCommision(): float
    {
        return $this->commision;
    }

    public function setCommision(float $commision): void
    {
        $this->commision = $commision;
    }

    public function getNetIncome(): float
    {
        return $this->netIncome;
    }

    public function setNetIncome(float $netIncome): void
    {
        $this->netIncome = $netIncome;
    }

    public function getTaxesAndCommisionPayed(): bool
    {
        return $this->taxesAndCommisionPayed;
    }

    public function setTaxesAndCommisionPayed(bool $taxesAndCommisionPayed): void
    {
        $this->taxesAndCommisionPayed = $taxesAndCommisionPayed;
    }
}