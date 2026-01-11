<?php

namespace App\Controller;

use App\Core\BaseController;
use App\Model\TransactionHistoryOnPartition;
use App\Core\Route;
use App\Core\DbManipulation;
use App\Core\Response;

class TransactionHistoryOnPartitionController extends BaseController
{
    
     
    #[Route('/createTransaction', methods:["POST"])]
    public function createUser()
    {
        $db = new DbManipulation();
        
        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);

        if (!array_key_exists('typeTransaction', $data) || !array_key_exists('person', $data)
            || !array_key_exists('sumChange', $data) || !array_key_exists('changePartition', $data)
            || !array_key_exists('priceForPartition', $data) || !array_key_exists('newUserPartitionsNumber', $data)){
            return new Response("Can`t create a new Stock. Missing information",404);
        }
        // I HAVE TO SET THE TIMEZONE => look at date_default_timezone_set()
        date_default_timezone_set("Europe/Sofia");
        $transaction = new TransactionHistoryOnPartition(null,$data["typeTransaction"],date("d.m.Y"), $data["person"], 
            $data["sumChange"], $data["changePartition"],$data["priceForPartition"], $data["newUserPartitionsNumber"]); 
        $db->add($transaction);
        $db->commit();
        return new Response("Successfuly insert a new record");
    }
    #[Route('/getTransactions')]
    public function getUsers()
    {   
        return $this->json((new TransactionHistoryOnPartition())->query()->all());
    }

}