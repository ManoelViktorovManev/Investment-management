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
    private bool $isCash;
    
    public function __construct(string $name='',string $currency='',bool $isCash = false)
    {
        $this->price = $isCash==true?1:0;
        
        $this->name = $name;
        $this->currency = $currency;
        $this->isCash = $isCash;
        
        $this->numberOfShares = 0;
        $this->id = null;
        
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

    public function getIsCash(): bool
    {
        return $this->isCash;
    }

    public function setIsCash(bool $isCash): void
    {
        $this->isCash = $isCash;
    }
   
}