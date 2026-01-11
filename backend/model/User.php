<?php

namespace App\Model;

use App\Core\BaseModel;

class User extends BaseModel
{
    private ?int $id;
    private string $name;
    private float $shares;
    private float $commissionPercent;

    public function __construct(?int $id = null, string $name = '', float $shares = 0, float $commissionPercent = 0)
    {
        $this->id = $id;
        $this->name = $name;
        $this->shares = $shares;
        $this->commissionPercent = $commissionPercent;
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

    public function getShares(): float
    {
        return $this->shares;
    }

    public function setShares(float $shares): void
    {
        $this->shares = $shares;
    }

    public function getCommissionPercent(): float
    {
        return $this->commissionPercent;
    }

    public function setCommisionPercent(float $commissionPercent): void
    {
        $this->commissionPercent = $commissionPercent;
    }
}