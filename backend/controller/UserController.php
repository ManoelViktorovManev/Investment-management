<?php

namespace App\Controller;

use App\Core\BaseController;
use App\Model\User as UserModel;
use App\Core\Route;
use App\Core\DbManipulation;
use App\Core\Response;

class UserController extends BaseController
{
     
    #[Route('/createUser', methods:["POST"])]
    public function createUser()
    {
        $db = new DbManipulation();
        
        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);

        $listOfUsers = $data["list"];
        if (empty($listOfUsers)){
            $name= $data["name"];
            $shares = $data["shares"];
            $money = $data['money'];

            $user = new UserModel($name,$shares,$money);
            $db->add($user);
        }
        else{
            foreach($listOfUsers as $element){
                $name= $element["name"];
                $shares = $element["shares"];
                $money = $data['money'];

                $user = new UserModel($name,$shares,$money);
                $db->add($user); 
            }
        }
        
        $db->commit();
        return new Response("Successfuly insert a new record");
    }
    
    #[Route('/getUsers')]
    public function getUsers()
    {   
        return $this->json((new UserModel())->query()->all());
    }

    #[Route('/updateUserShares', methods:["POST"])]
    public function updateUserShares(){
        $data = json_decode(file_get_contents("php://input"), true);

        $user = new UserModel();
        if (!array_key_exists('userId', $data) || !array_key_exists('mode', $data) || !array_key_exists('updatedShares', $data) || !array_key_exists('sharePrice', $data)){
            return new Response("No existing User",404);
        }
        $db = new DbManipulation();
        $user->query()->where("id","=",$data["userId"])->first();

        if($data["mode"]=="add"){
            // +
            $user->setShares($user->getShares()+$data["updatedShares"]);
            $user->setAllMoneyInvested($user->getAllMoneyInvested() + ($data["updatedShares"]*$data['sharePrice']));
            $user->setAverageSharePrice(round($user->getAllMoneyInvested()/$user->getShares(),5));
        }
        else{
            // -
            $user->setShares($user->getShares()-$data["updatedShares"]);
            $user->setAllMoneyInvested($user->getShares() * $user->getAverageSharePrice());
            if($user->getAverageSharePrice()<$data["sharePrice"] && $user->getCommissionPercent()>0){
                $profit = $data["sharePrice"] - $user->getAverageSharePrice();
                $commision = $profit * $data["updatedShares"] * $user->getCommissionPercent();
                $user->setAmountCommisionToPayToOwner($commision+$user->getAmountCommisionToPayToOwner());
            }
        }

        $db->add($user);
        $db->commit();
        return new Response("Successfuly updated a record");

    }

    #[Route('/updateUserCommision', methods:["POST"])]
    public function updateUserCommision(){
        $data = json_decode(file_get_contents("php://input"), true);

        $user = new UserModel();
        $listOfUsers = $data["list"];
        $db = new DbManipulation();
        if (empty($listOfUsers)){
            return new Response("NO list to update",404);
        }
        else{
            foreach($listOfUsers as $element){
                $id= $element["id"];
                $newCommision = $element["commissionPercent"];
                $user = new UserModel();
                $user->query()->where("id","=",$id)->first();
                $user->setCommisionPercent($newCommision);
                $db->add($user); 
            }
        }
       
        $db->commit();
        return new Response("Successfuly updated a record");

    }
}