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

        $name= $data["name"];
        $user = new UserModel(null, $name);
        $db->add($user);
        $db->commit();
        return new Response("Successfuly insert a new record");
    }
    #[Route('/getUsers')]
    public function getUsers()
    {   
        $user = new UserModel();
        $array = $user->query()->all();

        return $this->json($array);
    }

    public function updateUser(){
        // $user 
    }
}