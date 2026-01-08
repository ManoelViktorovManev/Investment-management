<?php

namespace App\Model;

use App\Core\BaseModel;

class CurrencyExchangeRate extends BaseModel
{
    private ?int $id;
    private string $firstCurrency;
    private string $secondCurrency;
    private float $rate;

    public function __construct(?int $id = null, string $firstCurrency = '', string $secondCurrency = '', float $rate = 0)
    {
        $this->id = $id;
        $this->firstCurrency = $firstCurrency;
        $this->secondCurrency = $secondCurrency;
        $this->rate = $rate;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): void
    {
        $this->id = $id;
    }

    public function getFirstCurrency(): string
    {
        return $this->firstCurrency;
    }

    public function setFirstCurrency(string $firstCurrency): void
    {
        $this->firstCurrency = $firstCurrency;
    }

    public function getSecondCurrency(): string
    {
        return $this->secondCurrency;
    }

    public function setSecondCurrency(string $secondCurrency): void
    {
        $this->secondCurrency = $secondCurrency;
    }

    public function getRate(): float
    {
        return $this->rate;
    }

    public function setRate(float $rate): void
    {
        $this->rate = $rate;
    }
}