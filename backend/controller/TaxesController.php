<?php

namespace App\Controller;

use App\Core\BaseController;
use App\Core\Route;
use App\Core\DbManipulation;
use App\Core\Response;
use App\Model\Taxes;
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
             || !array_key_exists('currency', $data)){
            return new Response("Can`t create a new Stock. Missing information",404);
        }
        date_default_timezone_set("Europe/Sofia");
        $taxes = new Taxes(null,$data["company"],date("d.m.Y"),$data["profitFromSale"]);
        $db->add($taxes);
        // here come the interesting part
        $db->commit();
        // after commit => taxes have id
        $usersArray = (new User())->query()->all(true);
        $settings = new Settings();
        $settings->query()->first();
        foreach($usersArray as $user){
            // TODO: add three more fields; 10taxesToDefaultCurrency, 
            if($user->getShares()==0){
                continue;
            }
            //IBTC => (user shares/ all shares) * profitFromSale
            $IBTC = round(($user->getShares()/$settings->getallShares())*$data["profitFromSale"],2);
            //10% taxes => 0.1 * IBTC
            $taxes10percent = round(0.1*$IBTC,2);
            //IBC => IBTC - 10% taxes
            $IBC = round($IBTC - $taxes10percent,2);
            //Commission => IBC * user commision
            $commission = round($IBC*($user->getCommissionPercent()/100),2);
            //Net income => IBC - commision
            $netIncome = $IBC-$commission;

            $taxesUsers = new TaxesUsers(null,$taxes->getId(),$user->getId(),$IBTC,$taxes10percent,$IBC,$commission,$netIncome,false);
            $db->add($taxesUsers);
        }
        $db->commit();
        return new Response("Successfuly insert a new record");
    }
}