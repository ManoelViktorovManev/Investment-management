<?php

namespace App\Model;

use App\Core\BaseModel;

class User extends BaseModel
{
    private ?int $id;
    private string $name;
    private float $shares;
    private float $commissionPercent;
    private float $averageSharePrice;
    private float $allMoneyInvested;
    private float $amountCommisionToPayToOwner;

    public function __construct(string $name = '', float $shares = 0, float $moneyInvested = 0)
    {
        $this->id = null;
        $this->name = $name;
        $this->shares = $shares;
        $this->commissionPercent = 0;
        $this->allMoneyInvested = $moneyInvested;
        $this->averageSharePrice = $this->shares!=0?round($this->allMoneyInvested/$this->shares,5):0;
        $this->amountCommisionToPayToOwner = 0;
        
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    public function getShares(): float
    {
        return $this->shares;
    }

    public function setShares(float $shares): void
    {
        $this->shares = $shares;
    }

    public function getCommissionPercent(): float
    {
        return $this->commissionPercent;
    }

    public function setCommisionPercent(float $commissionPercent): void
    {
        $this->commissionPercent = $commissionPercent;
    }

    public function getAverageSharePrice(): float
    {
        return $this->averageSharePrice;
    }

    public function setAverageSharePrice(float $averageSharePrice): void
    {
        $this->averageSharePrice = $averageSharePrice;
    }

    public function getAllMoneyInvested(): float
    {
        return $this->allMoneyInvested;
    }

    public function setAllMoneyInvested(float $allMoneyInvested): void
    {
        $this->allMoneyInvested = $allMoneyInvested;
    }

    public function getAmountCommisionToPayToOwner(): float
    {
        return $this->amountCommisionToPayToOwner;
    }

    public function setAmountCommisionToPayToOwner(float $amountCommisionToPayToOwner): void
    {
        $this->amountCommisionToPayToOwner = $amountCommisionToPayToOwner;
    }
}