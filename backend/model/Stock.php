<?php

namespace App\Model;

use App\Core\BaseModel;

class Stock extends BaseModel
{
    private ?int $id;
    private string $name;
    private string $symbol;
    private string $currency;
    private float $price;
    private bool $isCash;

    public function __construct(?int $id = null, string $name = '', string $symbol = '', string $currency = '', float $price = 0, bool $isCash = false)
    {
        $this->id = $id;
        $this->name = $name;
        $this->symbol = $symbol;
        $this->currency = $currency;
        $this->price = $price;
        $this->isCash = $isCash;
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

    public function getSymbol(): string
    {
        return $this->symbol;
    }

    public function setSymbol(string $symbol): void
    {
        $this->symbol = $symbol;
    }

    public function getCurrency(): string
    {
        return $this->currency;
    }

    public function setCurrency(string $currency): void
    {
        $this->currency = $currency;
    }

    public function getPrice(): float
    {
        return $this->price;
    }

    public function setPrice(float $price): void
    {
        $this->price = $price;
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
