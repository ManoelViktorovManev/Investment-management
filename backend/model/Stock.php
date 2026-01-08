<?php

namespace App\Model;

use App\Core\BaseModel;

class Stock extends BaseModel
{
    private ?int $id;
    private string $name;
    private float $price;
    private float $numberOfShares;
    private string $currency;
    
    public function __construct(?int $id = null,string $name='', float $price = 0, float $numberOfShares = 0, string $currency='')
    {
        $this->id = $id;
        $this->name = $name;
        $this->price = $price;
        $this->numberOfShares = $numberOfShares;
        $this->currency = $currency;
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

    public function getPrice(): float
    {
        return $this->price;
    }

    public function setPrice(float $price): void
    {
        $this->price = $price;
    }

    public function getNumberOfShares(): float
    {
        return $this->numberOfShares;
    }

    public function setNumberOfShares(float $numberOfShares): void
    {
        $this->numberOfShares = $numberOfShares;
    }

    public function getCurrency(): string
    {
        return $this->currency;
    }

    public function setCurrency(string $currency): void
    {
        $this->currency = $currency;
    }

   
}