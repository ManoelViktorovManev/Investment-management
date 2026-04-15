<?php

namespace App\Model;

use App\Core\BaseModel;

class StockPositionLots extends BaseModel
{
    private ?int $id;
    private int $stockId;
    private float $price;
    private float $quantity;

    public function __construct(int $stockId = 0, float $price = 0, float $quantity = 0)
    {
        $this->id = null;
        $this->stockId = $stockId;
        $this->price = $price;
        $this->quantity = $quantity;
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

    public function getPrice(): float
    {
        return $this->price;
    }

    public function setPrice(float $price): void
    {
        $this->price = $price;
    }

    public function getQuantity(): float
    {
        return $this->quantity;
    }

    public function setQuantity(float $quantity): void
    {
        $this->quantity = $quantity;
    }
}