<?php

/**
 * File: SettingsController.php
 * Description: Controller responsible for managing global application settings such as default currency.
 * Author: Manoel Manev
 * Created: 2025-07-08
 */

namespace App\Controller;

use App\Core\BaseController;
use App\Core\Response;
use App\Core\Route;
use App\Core\DbManipulation;
use App\Model\Settings;

/**
 * Class SettingsController
 *
 * Handles operations related to application-wide settings such as:
 * - Default currency
 * - Aggregated data for initialization (stocks, users, portfolios, exchange rates)
 *
 * @package App\Controller
 */
class SettingsController extends BaseController
{


    /**
     * Internal method for creating a default Settings instance if none exists.
     *
     * @return Settings Returns empty $settings instance.
     */
    public function createSettings(): Settings
    {
        $settings = new Settings();
        $db = new DbManipulation();
        $db->add($settings);
        $db->commit();

        return $settings;
    }

    /**
     * Endpoint: GET /getSettings
     *
     * Retrieves the current global settings. If settings do not exist, they are created with default values.
     *
     * @return Response JSON response containing:
     * {
     *   "defaultCurrency": string,
     *   "managmentSuperAdmin": int
     * }
     */
    #[Route('/getSettings')]
    public function getSettings()
    {
        $settings = new Settings();
        $ifExists = $settings->query()->first();

        if ($ifExists == null) {
            $settings = $this->createSettings();
        }
        return $this->json(['defaultCurrency' => $settings->getDefaultCurrency(), 'managingSuperAdmin' => $settings->getManagingSuperAdmin()]);
    }

    /**
     * Endpoint: POST /updateSettings
     *
     * Updates application settings, particularly the default currency ID.
     * If no settings entry exists, a new one is created.
     *
     * Expected JSON payload:
     * {
     *   "defaultCurrency": int
     * }
     *
     * @return Response Returns "OK" upon successful update.
     */
    #[Route('/updateSettings', methods: ['POST'])]
    public function updateSettings()
    {
        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);

        $newDefaultCurrency = $data["defaultCurrency"];
        $newSuperAdminManager = $data["idSuperAdmin"];

        $db = new DbManipulation();
        $settings = new Settings();

        $ifExists = $settings->query()->first();

        if ($ifExists == null) {
            $settings = $this->createSettings();
        }
        if ($newDefaultCurrency != null) {
            $settings->setDefaultCurrency($newDefaultCurrency);
        }
        if ($newSuperAdminManager != null) {
            $settings->setManagingSuperAdmin($newSuperAdminManager);
        }

        $db->add($settings);
        $db->commit();

        return new Response("OK");
    }

    /**
     * Endpoint: GET /getAllInfromation
     *
     * Retrieves all essential application data for front-end bootstrapping or dashboard display.
     * Returns information about:
     * - Stocks
     * - Portfolios
     * - Users
     * - Settings (default currency)
     * - Currency exchange rates
     *
     * @return Response JSON structured as:
     * {
     *   "stocks": array,
     *   "portfolios": array,
     *   "users": array,
     *   "settings": { "defaultCurrency": int },
     *   "exchangeRates": array
     * }
     */
    #[Route('/getAllInfromation')]
    public function getAllInfromation()
    {

        $results = (new Settings())->query()->multiQuery([
            "SELECT * FROM stock",
            "SELECT * FROM portfolio",
            "SELECT * FROM user",
            "SELECT defaultCurrency, managingSuperAdmin FROM settings",
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
