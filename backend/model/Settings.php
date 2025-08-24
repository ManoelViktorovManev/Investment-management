<?php

namespace App\Model;

use App\Core\BaseModel;

class Settings extends BaseModel
{
    private ?int $id;
    private ?string $defaultCurrency;
    private ?int $managingSuperAdmin;

    public function __construct(?int $id = null, ?string $defaultCurrency = null, ?int $managingSuperAdmin = null)
    {
        $this->id = $id;
        $this->defaultCurrency = $defaultCurrency;
        $this->managingSuperAdmin = $managingSuperAdmin;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): void
    {
        $this->id = $id;
    }

    public function getDefaultCurrency(): ?string
    {
        return $this->defaultCurrency;
    }

    public function setDefaultCurrency(string $defaultCurrency): void
    {
        $this->defaultCurrency = $defaultCurrency;
    }

    public function getManagingSuperAdmin(): ?int
    {
        return $this->managingSuperAdmin;
    }

    public function setManagingSuperAdmin(int $managingSuperAdmin): void
    {
        $this->managingSuperAdmin = $managingSuperAdmin;
    }
}
