<?php

namespace App\Controller;

use App\Core\BaseController;
use App\Model\CurrencyExchangeRate;
use App\Core\Route;
use App\Core\DbManipulation;
use App\Core\Response;

class CurrencyExhangeRateController extends BaseController
{
    #[Route('/createNewCurrencyRate', methods:["POST"])]
    public function createNewCurrencyRate()
    {
        $db = new DbManipulation();
        $data = json_decode(file_get_contents("php://input"), true);

        if (!array_key_exists('firstCurrency', $data) || !array_key_exists('secondCurrency', $data) || !array_key_exists('rate', $data)){
            return new Response("Can`t create a new CurrencyRate. Missing information",404);
        }

        $newCurrency = new CurrencyExchangeRate(null,$data["firstCurrency"],$data["secondCurrency"],$data["rate"]); 
        $db->add($newCurrency);
        $db->commit();

        return new Response("Successfuly insert a new record");
    }

    #[Route('/getExchangeRates')]
    public function getExchangeRatesAPICall()
    {
       return $this->json((new CurrencyExchangeRate())->query()->all());
    }
    /**
     * @return CurrencyExchangeRate[]
     */
    
    public static function getExchangeRates(): mixed{
        return (new CurrencyExchangeRate())->query()->all(true);
    }

    #[Route('/getExchangeRate/{firstCurrency}/{secondCurrency}')]
    public function getExchangeRate($firstCurrency, $secondCurrency)
    {
        $rate = self::calculateExchangeRate($firstCurrency, $secondCurrency);

        if ($rate !== null) {
            return $this->json([
                "from" => $firstCurrency,
                "to"   => $secondCurrency,
                "result" => $rate
            ]);
        }

        return new Response("No existing rate", 404);
    }


    public static function calculateExchangeRate($firstCurrency, $secondCurrency)
    {
        $exchangeratesarray = (new CurrencyExchangeRate())->query()->all(true);
        $rate = null;

        foreach ($exchangeratesarray as $rates) {
            if (
                ($rates->getFirstCurrency() == $firstCurrency || $rates->getSecondCurrency() == $firstCurrency)
                && ($rates->getFirstCurrency() == $secondCurrency || $rates->getSecondCurrency() == $secondCurrency)
            ) {
                if ($rates->getFirstCurrency() == $firstCurrency) {
                    $rate = $rates->getRate();
                } else {
                    $rate = round(1/$rates->getRate(), 4);
                }
            }
        }

        return $rate;
    }



    #[Route('/deleteExchangeRate', methods:["POST"])]
    public function deleteExchangeRate()
    {
        $db = new DbManipulation();
        $data = json_decode(file_get_contents("php://input"), true);

        if (!array_key_exists('id', $data) ){
            return new Response("Can`t delete Stock. Missing information",404);
        }

        $rate = new CurrencyExchangeRate();
        $rate = $rate->query()->where("id","=",$data["id"])->first();
        $db->delete($rate);
        $db->commit();

        return new Response("Successfuly deleted a record");
    }

    #[Route('/updateExchangeRate', methods:["POST"])]
    public function updateExchangeRate()
    {
        $db = new DbManipulation();
        $data = json_decode(file_get_contents("php://input"), true);

        if (!array_key_exists('id', $data) || !array_key_exists('rate', $data) ){
            return new Response("Can`t update Stock. Missing information",404);
        }
        
        $rate = new CurrencyExchangeRate();
        $rate->query()->where("id","=",$data["id"])->first();

        $rate->setRate($data["rate"]);
        
        $db->add($rate);
        $db->commit();

        return new Response("Successfuly updated a new record");
    }

}