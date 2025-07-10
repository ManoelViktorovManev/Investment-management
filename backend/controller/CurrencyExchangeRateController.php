<?php

namespace App\Controller;

use App\Core\BaseController;
use App\Core\Response;
use App\Core\Route;
use App\Model\CurrencyExchangeRate;
use App\Core\DbManipulation;
use App\Model\Stock;

class CurrencyExchangeRateController extends BaseController
{

    #[Route('/createNewCurrencyExchangeRate', methods: ['POST'])]
    public function createNewCurrencyExchangeRate()
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

    #[Route('/getExchangeRates')]
    public function getExchangeRates()
    {
        $currencyExchangeRateInstance = new CurrencyExchangeRate();
        $currencyExchangeRateInstanceArray = $currencyExchangeRateInstance
            ->query()
            ->select(" currencyexchangerate.id, Stock.Symbol, S.symbol, currencyexchangerate.rate")
            ->join("INNER", "STOCK", "currencyexchangerate.idFirstCurrency=Stock.id")
            ->join("INNER", "STOCK as S", "currencyexchangerate.idSecondCurrency=S.id")
            ->all();

        return $this->json($currencyExchangeRateInstanceArray);
    }
    public function createNewCurrencyExchangeRatebyMethod($newCurrencyId)
    {
        $currencys = new Stock();
        $array = $currencys->query()->select("id")->where(["isCash", "=", "1"])->all();
        $cashStockIds = array_map(fn($row) => $row['id'], $array);

        $db = new DbManipulation();
        foreach ($cashStockIds as $currencyId) {
            if ($newCurrencyId == $currencyId)
                continue;
            $db->add(new CurrencyExchangeRate(null, $newCurrencyId, $currencyId, 1));
        }
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
