<?php

/**
 * File: CurrencyExchangeRateController.php
 * Description: Provides functionality for creating, retrieving, and updating currency exchange rates.
 * Author: Manoel Manev
 * Created: 2025-07-08
 */

namespace App\Controller;

use App\Core\BaseController;
use App\Core\Response;
use App\Core\Route;
use App\Model\CurrencyExchangeRate;
use App\Core\DbManipulation;
use App\Model\Stock;

/**
 * Class CurrencyExchangeRateController
 *
 * Controller responsible for managing currency exchange rates in the system.
 * Includes methods for creating new exchange rates, retrieving existing ones,
 * and updating rates between currency pairs.
 *
 * @package App\Controller
 */
class CurrencyExchangeRateController extends BaseController
{

    /**
     * Endpoint: POST /createNewCurrencyExchangeRate
     *
     * Creates a new currency exchange rate record in the database.
     *
     * Expected JSON payload:
     * {
     *   "rate": float,
     *   "idFirstCurrency": int,
     *   "idSecondCurrency": int
     * }
     *
     * @return Response Returns "OK" upon successful creation.
     */
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

    /**
     * Endpoint: GET /getExchangeRates
     *
     * Retrieves a list of all exchange rates with their associated currency symbols.
     * Joins the currency exchange rate table with the stock table (for names/symbols).
     *
     * @return Response JSON response with an array of exchange rate data.
     */
    #[Route('/getExchangeRates')]
    public function getExchangeRates()
    {
        $currencyExchangeRateInstance = new CurrencyExchangeRate();
        $currencyExchangeRateInstanceArray = $currencyExchangeRateInstance
            ->query()
            ->select(" currencyexchangerate.id, Stock.Symbol as firstSymbol, S.symbol as secondSymbol, currencyexchangerate.rate")
            ->join("INNER", "STOCK", "currencyexchangerate.idFirstCurrency=Stock.id")
            ->join("INNER", "STOCK as S", "currencyexchangerate.idSecondCurrency=S.id")
            ->all();

        return $this->json($currencyExchangeRateInstanceArray);
    }

    /**
     * Creates default exchange rates (value = 1) from a new currency to all other existing cash currencies.
     *
     * This method is not routed as an endpoint but may be called internally after adding a new currency.
     *
     * @param int $newCurrencyId ID of the newly added currency - Stock
     * @return Response Returns "OK" after successful insertion of default rates
     */
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

    /**
     * Endpoint: POST /updateExchangeRate
     *
     * Updates multiple exchange rates in the database.
     * Avoids updating rows where the rate has not changed.
     *
     * Expected JSON payload:
     * {
     *   "allocations": {
     *     "1": 1.05,
     *     "2": 0.95,
     *     ...
     *   }
     *
     * @return Response Returns "OK" after updating the exchange rates.
     */
    #[Route('/updateExchangeRate', methods: ['POST'])]
    public function updateExchangeRate()
    {

        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);

        $allocations = $data["allocations"];

        $db = new DbManipulation();

        foreach ($allocations as $currencyExchangeRateid => $rate) {
            $CERModel = new CurrencyExchangeRate();
            $CERModel->query()->where(["id", "=", $currencyExchangeRateid])->first();

            // if the price is same, you don`t need to update
            if ($CERModel->getRate() == $rate) {
                continue;
            }
            $CERModel->setRate($rate);

            $db->add($CERModel);
        }

        $db->commit();

        return new Response("OK");
    }

    /**
     * Endpoint: GET /getAllCurrencyExchangeRates
     *
     * Returns all exchange rate records directly from the database.
     *
     * @return Response JSON response with all currency exchange rate entries.
     */
    #[Route('/getAllCurrencyExchangeRates')]
    public function getAllCurrencyExchangeRates()
    {
        return $this->json((new CurrencyExchangeRate())->query()->all());
    }
}
