<?php

namespace App\Model;

use App\Core\BaseModel;

class CurrencyExchangeRate extends BaseModel
{
    private ?int $id;
    private int $idFirstCurrency;
    private int $idSecondCurrency;
    private float $rate;

    public function __construct(?int $id = null, int $idFirstCurrency = 0, int $idSecondCurrency = 0, float $rate = 0)
    {
        $this->id = $id;
        $this->idFirstCurrency = $idFirstCurrency;
        $this->idSecondCurrency = $idSecondCurrency;
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

    public function getIdFirstCurrency(): int
    {
        return $this->idFirstCurrency;
    }

    public function setIdFirstCurrency(int $idFirstCurrency): void
    {
        $this->idFirstCurrency = $idFirstCurrency;
    }

    public function getIdSecondCurrency(): int
    {
        return $this->idSecondCurrency;
    }

    public function setIdSecondCurrency(int $idSecondCurrency): void
    {
        $this->idSecondCurrency = $idSecondCurrency;
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