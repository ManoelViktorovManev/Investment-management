<?php

namespace App\Controller;

use App\Core\BaseController;
use App\Core\Route;
use App\Core\DbManipulation;
use App\Core\Response;
use App\Model\Taxes;
use App\Model\Stock;
use App\Model\User;
use App\Model\TaxesUsers;
use App\Model\Settings;

class TaxesController extends BaseController
{
    #[Route('/createTaxes', methods:["POST"])]
    public function createTaxes()
    {
        $db = new DbManipulation();
        
        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);

        if (!array_key_exists('company', $data) || !array_key_exists('profitFromSale', $data)
             || !array_key_exists('defaultCurrency', $data) ){
            return new Response("Can`t create a new Stock. Missing information",404);
        }
        date_default_timezone_set("Europe/Sofia");
        // $rate=CurrencyExhangeRateController::calculateExchangeRate($data["defaultCurrency"],$data["currency"]);
        // if($rate==null){
        //     return new Response("Non existing rates {$data["defaultCurrency"]} to {$data["currency"]}", 404);
        // }
        // TAXES NOW Company name, date, currency, profit
        $taxes = new Taxes($data["company"],date("d.m.Y"),$data["defaultCurrency"],$data["profitFromSale"]);
        $db->add($taxes);
        // here come the interesting part
        $db->commit();

        // NEWEST UPDATE
        // 1. Calculate the current amount of taxes needed to be paid.
        // 2. Append in the settings
        $settings = new Settings();
        $settings->query()->first();
        $settings->setTaxesToPay($settings->getTaxesToPay()+$data["profitFromSale"]);
        
        $db->add($settings);
        $db->commit();

        // We should create an liability for the company
        if($settings->getTaxesToPay()>0){
            // check if exists
            $libailities = (new Stock())->query()->where("name","=",$settings->getDefaultCurrency() . " taxes own")->first();
            // $libailities
            if($libailities==null){
                StockController::createStockStatick($settings->getDefaultCurrency() . " taxes own",$settings->getDefaultCurrency(),1);
                $libailities = new Stock();
                $libailities->query()->where("name","=",$settings->getDefaultCurrency() . " taxes own")->first();
            }
            $libailities->setNumberOfShares(round(-$settings->getTaxesToPay()*0.09,2));
            $db->add($libailities);
            $db->commit();
        }
        else{
            $libailities = (new Stock())->query()->where("name","=",$settings->getDefaultCurrency() . " taxes own")->first();
            
            if($libailities==null){
                StockController::createStockStatick($settings->getDefaultCurrency() . " taxes own",$settings->getDefaultCurrency(),1);
                $libailities = new Stock();
                $libailities->query()->where("name","=",$settings->getDefaultCurrency() . " taxes own")->first();
            }
            $libailities->setNumberOfShares(0);
            $db->add($libailities);
            $db->commit();

        }






        
        // $usersArray = (new User())->query()->all(true);
        // $settings = new Settings();
        // $settings->query()->first();
        // $taxableIncomeBasedOnNAP = round($data["profitFromSale"]*0.9,2);
        // foreach($usersArray as $user){
        //     // TODO: add three more fields; 10taxesToDefaultCurrency!!!!
        //     if($user->getShares()==0){
        //         continue;
        //     }
        //     //IBTC => (user shares/ all shares) * taxableIncomeBasedOnNAP
        //     $IBTC = round(($user->getShares()/$settings->getallShares())*$taxableIncomeBasedOnNAP,2);
        //     //10% taxes => 0.1 * IBTC
        //     $taxes10percent = round(0.1*$IBTC,2);
        //     //IBC => IBTC - 10% taxes
        //     $IBC = round($IBTC - $taxes10percent,2);
        //     //Commission => IBC * user commision
        //     $commission = round($IBC*($user->getCommissionPercent()/100),2);
        //     //Net income => IBC - commision
        //     $netIncome = $IBC-$commission;

        //     $taxesUsers = new TaxesUsers(null,$taxes->getId(),$user->getId(),$IBTC,$taxes10percent,$IBC,$commission,$netIncome,false);
        //     $db->add($taxesUsers);
        // }
        // $db->commit();
        return new Response("Successfuly insert a new record");
    }

    #[Route('/updatePayedTaxesAndCommisions', methods:["POST"])]
    public function updatePayedTaxesAndCommisions()
    {
        $db = new DbManipulation();
        
        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);

        if (!array_key_exists('taxId', $data) || !array_key_exists('userId', $data)){
            return new Response("Can`t update state. Missing information",404);
        }
        $taxesUsers = new TaxesUsers();
        $taxesUsers->query()->where("taxesId","=",$data["taxId"])->and()->where("userId","=",$data["userId"])->first();

        $state = $taxesUsers->getTaxesAndCommisionPayed();
        $state == 1? $taxesUsers->setTaxesAndCommisionPayed(0) : $taxesUsers->setTaxesAndCommisionPayed(1);
        $db->add($taxesUsers);
        $db->commit();
        return new Response("Successfuly updated a record");
    }

    #[Route('/getTaxes')]
    public function getTaxes()
    {
        return $this->json((new Taxes())->query()->all());
    }

    #[Route('/getUserTaxes')]
    public function getUserTaxes()
    {
        return $this->json((new TaxesUsers())->query()->all());
    }


}