<?php

namespace App\Model;

use App\Core\BaseModel;

class Settings extends BaseModel
{
    private ?int $id;
    private string $defaultCurrency;
    private float $sharePrice;

    
    public function __construct(?int $id = null,string $defaultCurrency='', float $sharePrice = 0)
    {
        $this->id = $id;
        $this->defaultCurrency = $defaultCurrency;
        $this->sharePrice = $sharePrice;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }
    public function getDefaultCurrency(): string
    {
        return $this->defaultCurrency;
    }

    public function setDefaultCurrency(string $defaultCurrency): void
    {
        $this->defaultCurrency = $defaultCurrency;
    }

    public function getSharePrice(): float
    {
        return $this->sharePrice;
    }

    public function setSharePrice(float $sharePrice): void
    {
        $this->sharePrice = $sharePrice;
    }

   
}