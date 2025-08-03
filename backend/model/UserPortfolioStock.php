<?php

namespace App\Model;

use App\Core\BaseModel;

class UserPortfolioStock extends BaseModel
{
    private ?int $id;
    private int $stockId;
    private int $portfolioId;
    private int $userId;
    private float $stockQuantity;

    public function __construct(?int $id = null, int $stockId = 0, int $portfolioId = 0, int $userId = 0, float $stockQuantity = 0)
    {
        $this->id = $id;
        $this->stockId = $stockId;
        $this->portfolioId = $portfolioId;
        $this->userId = $userId;
        $this->stockQuantity = $stockQuantity;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): void
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

    public function getPortfolioId(): int
    {
        return $this->portfolioId;
    }

    public function setPortfolioId(int $portfolioId): void
    {
        $this->portfolioId = $portfolioId;
    }

    public function getUserId(): int
    {
        return $this->userId;
    }

    public function setUserId(int $userId): void
    {
        $this->userId = $userId;
    }

    public function getStockQuantity(): float
    {
        return $this->stockQuantity;
    }

    public function setStockQuantity(float $stockQuantity): void
    {
        $this->stockQuantity = $stockQuantity;
    }
}
