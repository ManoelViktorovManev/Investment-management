<?php

namespace App\Controller;

use App\Core\BaseController;
use App\Core\Response;
use App\Core\Route;
use App\Core\DbManipulation;
use App\Core\QueryBuilder;
use App\Model\Settings;

class SettingsController extends BaseController
{


    public function createSettings()
    {
        $settings = new Settings();
        $db = new DbManipulation();
        $db->add($settings);
        $db->commit();

        return new Response("OK");
    }
    #[Route('/getSettings')]
    public function getSettings()
    {
        $settings = new Settings();
        $ifExists = $settings->query()->first();

        if ($ifExists == null) {
            $this->createSettings();
            $settings->query()->first();
        }
        return $this->json(['defaultCurrency' => $settings->getDefaultCurrency()]);
    }

    #[Route('/updateSettings', methods: ['POST'])]
    public function updateSettings()
    {
        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);

        $newDefaultCurrency = $data["defaultCurrency"];

        $db = new DbManipulation();
        $settings = new Settings();
        $ifExists = $settings->query()->first();
        if ($ifExists == null) {
            $this->createSettings();
            $settings->query()->first();
        }

        $settings->setDefaultCurrency($newDefaultCurrency);

        $db->add($settings);
        $db->commit();

        return new Response("OK");
    }

    #[Route('/getAllInfromation')]
    public function getAllInfromation()
    {

        $results = (new Settings())->query()->multiQuery([
            "SELECT * FROM stock",
            "SELECT * FROM portfolio",
            "SELECT * FROM user",
            "SELECT defaultCurrency FROM settings",
            "SELECT  currencyexchangerate.id, Stock.Symbol as firstSymbol, S.symbol as secondSymbol, currencyexchangerate.rate 
            FROM currencyexchangerate 
            INNER JOIN STOCK ON currencyexchangerate.idFirstCurrency=Stock.id  
            INNER JOIN STOCK as S ON currencyexchangerate.idSecondCurrency=S.id"
        ]);

        $stocks = $results[0];
        $portfolios = $results[1];
        $users = $results[2];
        $settings = $results[3][0];
        $exchangeRate = $results[4];

        return $this->json([
            "stocks" => $stocks,
            "portfolios" => $portfolios,
            "users" => $users,
            "settings" => $settings,
            "exchangeRates" => $exchangeRate
        ]);
    }
}
