<?php

namespace App\Controller;

use App\Core\BaseController;
use App\Core\Response;
use App\Core\Route;
use App\Model\CurrencyExchangeRate;
use App\Core\DbManipulation;

class CurrencyExchangeRateController extends BaseController
{

    #[Route('/createNewCurrencyExchangeRate', methods: ['POST'])]
    public function createNewPortfolio()
    {

        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);

        $rate = $data["rate"];
        $idFirstCurrency = $data["idFirstCurrency"];
        $idSecondCurrency = $data["idSecondCurrency"];

        $currencyExchangeRateInstance = new CurrencyExchangeRate(null, $idFirstCurrency, $idSecondCurrency, $rate);

        $db = new DbManipulation();
        $db->add($currencyExchangeRateInstance);
        $db->commit();

        return new Response("OK");
    }

    #[Route('/updateExchangeRate', methods: ['POST'])]
    public function updateExchangeRate()
    {

        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);

        $id = $data["id"];
        $newExchangeRate = $data["newRate"];

        $currencyExchangeRateInstance = new CurrencyExchangeRate();
        $currencyExchangeRateInstance->query()->where(['id', '=', $id])->first();
        $currencyExchangeRateInstance->setRate($newExchangeRate);

        $db = new DbManipulation();
        $db->add($currencyExchangeRateInstance);
        $db->commit();

        return new Response("OK");
    }
    #[Route('/getAllCurrencyExchangeRates')]
    public function getAllCurrencyExchangeRates()
    {
        return $this->json((new CurrencyExchangeRate())->query()->all());
    }
}
