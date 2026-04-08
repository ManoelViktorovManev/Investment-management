<?php

namespace App\Controller;

use App\Core\BaseController;
use App\Core\Route;
use App\Core\DbManipulation;
use App\Core\Response;
use App\Model\HistoryPriceOfOneShare;

class HistoryPriceOfOneShareController extends BaseController
{
    // #[Route('/createHistoryPrice', methods:["POST"])]
    // public function createSettings()
    // {
    //     $db = new DbManipulation();
        
    //     $rawInput = file_get_contents("php://input");
    //     $data = json_decode($rawInput, true);

    //     $name= $data["date"];
    //     $sharePrice = $data["sharePrice"];
        
    //     $sharePriceHistory = new HistoryPriceOfOneShare(null,$name,$sharePrice);
    //     $db->add($sharePriceHistory);
    //     $db->commit();
    //     return new Response("Successfuly insert a new record");
    // }

    public static function createStaticInstance($date,$sharePrice){
        $db = new DbManipulation();
        $formatedDate = \DateTime::createFromFormat('d.m.Y', $date)->format('Y-m-d');
        $sharePriceHistory = new HistoryPriceOfOneShare(null,$formatedDate,$sharePrice);
        $db->add($sharePriceHistory);
        $db->commit();
        return;
    }
    #[Route('/getHistoryPrice/{fromDate}/{toDate}')]
    public function getHistoryPrice($fromDate,$toDate)
    {
        // $fromDate = \DateTime::createFromFormat('Y-m-d', $fromDate)->format('d.m.Y');
        // $toDate   = \DateTime::createFromFormat('Y-m-d', $toDate)->format('d.m.Y');
        $sharePriceHistory = new HistoryPriceOfOneShare();
        $array = $sharePriceHistory->query()->where("date",">=",$fromDate)->and()->where("date","<=",$toDate)->all();
        return $this->json($array);
    }

    #[Route('/getLastRecordedDate')]
    public function getLastRecordedDate()
    {
        date_default_timezone_set("Europe/Sofia");
        $now = date("Y-m-d");

        $sharePriceHistory = new HistoryPriceOfOneShare();
        
        // Get last recorded row
        $sharePriceHistory->query()
            ->where("date", "<=", $now)
            ->order(["date", "DESC"])
            ->first();

        
        // check if db is empty => record todays price
        if($sharePriceHistory->getId()==null){
            return $this->json([
            "lastRecorder" => null,
            "datesToRecord" => 1,
             "missingDates" => [$now]
        ]);
        }
        $lastDate = $sharePriceHistory->getDate(); 

        // Convert to DateTime objects
        $today = \DateTime::createFromFormat('Y-m-d', $now);
        $lastDt = \DateTime::createFromFormat('Y-m-d', $lastDate);

        $missingDates = [];
        $cursor = clone $lastDt;
        $cursor->modify('+1 day');

        while ($cursor < $today) {
            $missingDates[] = $cursor->format('d.m.Y');
            $cursor->modify('+1 day');
        }

        return $this->json([
            "lastRecorder" => $lastDate,
            "datesToRecord" => count($missingDates),
             "missingDates" => $missingDates
        ]);
    }

}