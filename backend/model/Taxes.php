<?php

namespace App\Model;

use App\Core\BaseModel;

class Taxes extends BaseModel
{
    private ?int $id;
    private string $company;
    private string $date;
    private float $profitFromSale;

    public function __construct(?int $id = null, string $company = '', string $date = '', float $profitFromSale = 0)
    {
        $this->id = $id;
        $this->company = $company;
        $this->date = $date;
        $this->profitFromSale = $profitFromSale;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function getCompany(): string
    {
        return $this->company;
    }

    public function setCompany(string $company): void
    {
        $this->company = $company;
    }

    public function getDate(): string
    {
        return $this->date;
    }

    public function setDate(string $date): void
    {
        $this->date = $date;
    }

    public function getProfitFromSale(): float
    {
        return $this->profitFromSale;
    }

    public function setProfitFromSale(float $profitFromSale): void
    {
        $this->profitFromSale = $profitFromSale;
    }

}