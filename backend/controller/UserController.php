<?php

namespace App\Controller;

use App\Core\BaseController;
use App\Core\Response;
use App\Core\Route;
use App\Model\User;
use App\Core\DbManipulation;

class UserController extends BaseController
{

    #[Route('/createNewUser', methods: ['POST'])]
    public function createNewUser()
    {

        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);

        $name = $data["name"];

        $new_user = new User();
        $new_user->setName($name);

        $db = new DbManipulation();
        $db->add($new_user);
        $db->commit();

        return new Response("OK");
    }

    #[Route('/deleteUser', methods: ['POST'])]
    public function deleteUser()
    {
        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);

        $id = $data["id"];
        $userToDelete = new User();
        $userToDelete->query()->where(['id', '=', $id])->first();

        $db = new DbManipulation();
        $db->delete($userToDelete);
        $db->commit();

        return new Response("Successfully deleted");
    }

    #[Route('/getAllUsers')]
    public function getAllUsers()
    {
        $user = new User();
        $allUsers = $user->query()->all();
        return $this->json($allUsers);
    }

    #[Route('/getUser/{id}')]
    public function getUser($id)
    {
        $user = new User();
        $user->query()->where(["id", "=", $id])->first();
        return $this->json(["name" => $user->getName()]);
    }
}
