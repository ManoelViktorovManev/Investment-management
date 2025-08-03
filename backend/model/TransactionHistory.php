<?php

namespace App\Model;

use App\Core\BaseModel;

class TransactionHistory extends BaseModel
{
    private ?int $id;
    private int $idPortfolio;
    private int $idStock;
    private int $numStocks;
    private float $price;
    private string $date;
    private string $transaction;

    public function __construct(?int $id = null, int $idPortfolio = 0, int $idStock = 0, int $numStocks = 0, float $price = 0, string $date = "", string $transaction = "")
    {
        $this->id = $id;
        $this->idPortfolio = $idPortfolio;
        $this->idStock = $idStock;
        $this->numStocks = $numStocks;
        $this->price = $price;
        $this->date = $date;
        $this->transaction = $transaction;
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

    public function getNumStocks(): int
    {
        return $this->numStocks;
    }

    public function setNumStocks(int $numStocks): void
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

    public function getDate(): string
    {
        return $this->date;
    }

    public function setDate(string $date): void
    {
        $this->date = $date;
    }

    public function getTransaction(): string
    {
        return $this->transaction;
    }

    public function setTransaction(string $transaction): void
    {
        $this->transaction = $transaction;
    }
}
