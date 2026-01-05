<?php

namespace App\Controller;

use App\Core\BaseController;
use App\Core\Route;
use App\Core\DbManipulation;
use App\Core\Response;
use App\Model\Settings;

class SettingsController extends BaseController
{
    // Setting default Currency for a new portfolio
    // Button for adding a new дялове to User
     
    #[Route('/updateSettings', methods:["POST"])]
    public function createUser()
    {
        $db = new DbManipulation();
        
        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);

        $name= $data["defaultCurrency"];
        $sharePrice = $data["sharePrice"];
        $allShares = $data["allShares"];
        $settings = new Settings(null,$name,$sharePrice,$allShares);
        $db->add($settings);
        $db->commit();
        return new Response("Successfuly insert a new record");
    }
    #[Route('/getSettings')]
    public function getSettings()
    {   
        $settings = new Settings();
        $array = $settings->query()->all();

        return $this->json($array);
    }

}