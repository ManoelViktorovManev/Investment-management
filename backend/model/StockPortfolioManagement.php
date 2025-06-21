<?php

namespace App\Model;

use App\Core\BaseModel;

class StockPortfolioManagement extends BaseModel
{
    private ?int $id;
    private int $idPortfolio;
    private int $idStock;
    private float $numStocks;
    private float $price;
    private float $valueOfStock;

    public function __construct(?int $id = null, int $idPortfolio = 0, int $idStock = 0, float $numStocks = 0, float $price = 0, float $valueOfStock = 0)
    {
        $this->id = $id;
        $this->idPortfolio = $idPortfolio;
        $this->idStock = $idStock;
        $this->numStocks = $numStocks;
        $this->price = $price;
        $this->valueOfStock = $valueOfStock;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): void
    {
        $this->id = $id;
    }

    public function getIdPortfolio(): int
    {
        return $this->idPortfolio;
    }

    public function setIdPortfolio(int $idPortfolio): void
    {
        $this->idPortfolio = $idPortfolio;
    }

    public function getIdStock(): int
    {
        return $this->idStock;
    }

    public function setIdStock(int $idStock): void
    {
        $this->idStock = $idStock;
    }

    public function getNumStocks(): float
    {
        return $this->numStocks;
    }

    public function setNumStocks(float $numStocks): void
    {
        $this->numStocks = $numStocks;
    }

    public function getPrice(): float
    {
        return $this->price;
    }

    public function setPrice(float $price): void
    {
        $this->price = $price;
    }

    public function getValueOfStock(): float
    {
        return $this->valueOfStock;
    }

    public function setValueOfStock(float $valueOfStock): void
    {
        $this->valueOfStock = $valueOfStock;
    }
}
