<?php

namespace App\Model;

use App\Core\BaseModel;

class TransactionHistoryOnPartition extends BaseModel
{
    private ?int $id;
    private string $typeTransaction;
    private string $date;
    private string $person;
    private float $sumChange;
    private float $changePartition;
    private float $priceForPartition;
    private float $newUserPartitionsNumber;
    
    public function __construct(?int $id = null,string $typeTransaction ='', string $date = '', string $person = '',
    float $sumChange = 0, float $changePartition = 0, float $priceForPartition = 0, float $newUserPartitionsNumber = 0
    )
    {
        $this->id = $id;
        $this->typeTransaction = $typeTransaction;
        $this->date = $date;
        $this->person = $person;
        $this->sumChange = $sumChange;
        $this->changePartition = $changePartition;
        $this->priceForPartition = $priceForPartition;
        $this->newUserPartitionsNumber = $newUserPartitionsNumber;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }
    public function getTypeTransaction(): string
    {
        return $this->typeTransaction;
    }

    public function setTypeTransaction(string $typeTransaction): void
    {
        $this->typeTransaction = $typeTransaction;
    }

    public function getDate(): string
    {
        return $this->date;
    }

    public function setDate(string $date): void
    {
        $this->date = $date;
    }

    public function getPerson(): string
    {
        return $this->person;
    }

    public function setPerson(string $person): void
    {
        $this->person = $person;
    }

    public function getSumChange(): float
    {
        return $this->sumChange;
    }

    public function setSumChange(float $sumChange): void
    {
        $this->sumChange = $sumChange;
    }




    public function getChangePartition(): float
    {
        return $this->changePartition;
    }

    public function setChangePartition(float $changePartition): void
    {
        $this->changePartition = $changePartition;
    }


    public function getPriceForPartition(): float
    {
        return $this->priceForPartition;
    }

    public function setPriceForPartition(float $priceForPartition): void
    {
        $this->priceForPartition = $priceForPartition;
    }


    public function getNewUserPartitionsNumber(): float
    {
        return $this->newUserPartitionsNumber;
    }

    public function setNewUserPartitionsNumber(float $newUserPartitionsNumber): void
    {
        $this->newUserPartitionsNumber = $newUserPartitionsNumber;
    }


   
}