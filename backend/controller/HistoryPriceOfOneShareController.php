<?php

namespace App\Controller;

use App\Core\BaseController;
use App\Core\Route;
use App\Core\DbManipulation;
use App\Core\Response;
use App\Model\HistoryPriceOfOneShare;

class HistoryPriceOfOneShareController extends BaseController
{
    #[Route('/createHistoryPrice', methods:["POST"])]
    public function createSettings()
    {
        $db = new DbManipulation();
        
        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);

        $name= $data["date"];
        $sharePrice = $data["sharePrice"];
        $sharePriceHistory = new HistoryPriceOfOneShare(null,$name,$sharePrice);
        $db->add($sharePriceHistory);
        $db->commit();
        return new Response("Successfuly insert a new record");
    }

    #[Route('/getHistoryPrice/{fromDate}/{toDate}')]
    public function getHistoryPrice($fromDate,$toDate)
    {
        $fromDate = \DateTime::createFromFormat('Y-m-d', $fromDate)->format('d.m.Y');
        $toDate   = \DateTime::createFromFormat('Y-m-d', $toDate)->format('d.m.Y');
        $sharePriceHistory = new HistoryPriceOfOneShare();
        $array = $sharePriceHistory->query()->where("date",">=",$fromDate)->and()->where("date","<=",$toDate)->all();
        return $this->json($array);
    }

}