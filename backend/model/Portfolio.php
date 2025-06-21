<?php

namespace App\Model;

use App\Core\BaseModel;

class Portfolio extends BaseModel
{
    private ?int $id;
    private string $name;
    // private string $currency;
    // private float $valueOfPortfolio;

    public function __construct(?int $id = null, string $name = '')
    {
        $this->id = $id;
        $this->name = $name;
        // $this->currency = $currency;
        // $this->valueOfPortfolio = $valueOfPortfolio;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): void
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

    // public function getCurrency(): string
    // {
    //     return $this->currency;
    // }

    // public function setCurrency(string $currency): void
    // {
    //     $this->currency = $currency;
    // }

    // public function getValueOfPortfolio(): float
    // {
    //     return $this->valueOfPortfolio;
    // }

    // public function setValueOfPortfolio(float $valueOfPortfolio): void
    // {
    //     $this->valueOfPortfolio = $valueOfPortfolio;
    // }
}
