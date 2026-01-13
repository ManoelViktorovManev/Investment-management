<?php

namespace App\Controller;

use App\Core\BaseController;
use App\Model\User as UserModel;
use App\Core\Route;
use App\Core\DbManipulation;
use App\Core\Response;

class UserController extends BaseController
{
    // Setting default Currency for a new portfolio
    // Button for adding a new дялове to User
     
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

            $user = new UserModel(null, $name,$shares);
            $db->add($user);
        }
        else{
            foreach($listOfUsers as $element){
                $name= $element["name"];
                $shares = $element["shares"];

                $user = new UserModel(null, $name,$shares);
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
        if (!array_key_exists('userId', $data) || !array_key_exists('mode', $data) || !array_key_exists('updatedShares', $data)){
            return new Response("No existing User",404);
        }
        $db = new DbManipulation();
        $user->query()->where("id","=",$data["userId"])->first();

        if($data["mode"]=="add"){
            // +
            $user->setShares($user->getShares()+$data["updatedShares"]);
        }
        else{
            // -
            $user->setShares($user->getShares()-$data["updatedShares"]);
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