<?php

/**
 * File: UserController.php
 * Description: Controller for handling user management operations such as creation, update, deletion, and retrieval.
 * Author: Manoel Manev
 * Created: 2025-06-17
 */

namespace App\Controller;

use App\Core\BaseController;
use App\Core\Response;
use App\Core\Route;
use App\Model\User;
use App\Core\DbManipulation;

/**
 * Class UserController
 *
 * Handles CRUD operations for user entities, including:
 * - Creating new users
 * - Updating user information
 * - Deleting users
 * - Fetching all or individual users
 *
 * @package App\Controller
 */
class UserController extends BaseController
{

    /**
     * Endpoint: POST /createNewUser
     *
     * Creates a new user in the system.
     *
     * Expected JSON payload:
     * {
     *   "name": string
     * }
     *
     * @return Response Returns "OK" upon successful creation.
     */
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

    /**
     * Endpoint: POST /deleteUser
     *
     * Deletes a user by their ID.
     *
     * Expected JSON payload:
     * {
     *   "id": int
     * }
     *
     * @return Response Returns a success message upon deletion.
     */
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

    /**
     * Endpoint: POST /updateUser
     *
     * Updates the name of an existing user.
     *
     * Expected JSON payload:
     * {
     *   "id": int,
     *   "name": string
     * }
     *
     * @return Response Returns "OK" upon successful update.
     */
    #[Route('/updateUser', methods: ['POST'])]
    public function updateUser()
    {
        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);

        $id = $data["id"];
        $newName = $data["name"];

        $user = new User();
        $user->query()->where(['id', '=', $id])->first();
        $user->setName($newName);


        $db = new DbManipulation();
        $db->add($user);
        $db->commit();

        return new Response("OK");
    }

    /**
     * Endpoint: GET /getAllUsers
     *
     * Retrieves all users from the database.
     *
     * @return Response JSON array of all user records.
     */
    #[Route('/getAllUsers')]
    public function getAllUsers()
    {
        $user = new User();
        $allUsers = $user->query()->all();
        return $this->json($allUsers);
    }

    /**
     * Endpoint: GET /getUser/{id}
     *
     * Retrieves a specific user's name by their ID.
     *
     * @param int $id User ID
     *
     * @return Response JSON with the user name.
     *
     * Example response:
     * {
     *   "name": "Alice"
     * }
     */
    #[Route('/getUser/{id}')]
    public function getUser($id)
    {
        $user = new User();
        $user->query()->where(["id", "=", $id])->first();
        return $this->json(["name" => $user->getName()]);
    }
}
