<?php

namespace App\Model;

use App\Core\BaseModel;

class TransactionOnStock extends BaseModel
{
    private ?int $id;
    private int $stockId;
    private string $type;
    private int $quantity;
    private float $price;
    private string $currency;
    private float $rateToDefaultCurrency;
    private string $date;
    
    public function __construct(int $stockId=0, string $type='', int $quantity=0, float $price=0, string $currency='', float $rate=0, string $date='')
    {
        $this->id = null;
        $this->stockId = $stockId;
        $this->type = $type;
        $this->quantity = $quantity;
        $this->price = $price;
        $this->currency = $currency;
        $this->rateToDefaultCurrency = $rate;
        $this->date = $date;
    }

    public function getId(): ?int
    {
        return $this->id;
    }
    public function setId(int $id): void
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

    public function getType(): string
    {
        return $this->type;
    }
    public function setTyped(string $type): void
    {
        $this->type = $type;
    }

    public function getQuantity(): int
    {
        return $this->quantity;
    }
    public function setQuantity(int $quantity): void
    {
        $this->quantity = $quantity;
    }
    
    public function getPrice(): float
    {
        return $this->price;
    }
    public function setPrice(float $price): void
    {
        $this->price = $price;
    }

    public function getCurrency(): string
    {
        return $this->currency;
    }
    public function setCurrency(string $currency): void
    {
        $this->currency = $currency;
    }

    public function getDate(): string
    {
        return $this->date;
    }
    public function setDate(string $date): void
    {
        $this->date = $date;
    }

    public function getRateToDefaultCurrency(): float
    {
        return $this->rateToDefaultCurrency;
    }

    public function setRateToDefaultCurrency(float $rateToDefaultCurrency): void
    {
        $this->rateToDefaultCurrency = $rateToDefaultCurrency;
    }   
}