<?php

namespace App\Model;

use App\Core\BaseModel;

class HistoryPriceOfOneShare extends BaseModel
{
    private ?int $id;
    private string $date;
    private float $sharePrice;
    
    public function __construct(?int $id = null,string $date='', float $sharePrice = 0)
    {
        $this->id = $id;
        $this->date = $date;
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
    public function getDate(): string
    {
        return $this->date;
    }

    public function setDate(string $date): void
    {
        $this->date = $date;
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