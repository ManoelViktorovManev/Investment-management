<?php

/**
 * File: PortfolioController.php
 * Description: Manages creation, updating, deletion, and retrieval of investment portfolios.
 * Author: Manoel Manev
 * Created: 2025-07-26
 */

namespace App\Controller;

use App\Core\BaseController;
use App\Core\Response;
use App\Core\Route;
use App\Model\Portfolio;
use App\Core\DbManipulation;

/**
 * Class PortfolioController
 *
 * Handles API endpoints related to user portfolios. Provides CRUD operations
 * (Create, Read, Update, Delete) for investment portfolios stored in the database.
 *
 * @package App\Controller
 */
class PortfolioController extends BaseController
{

    /**
     * Endpoint: POST /createNewPortfolio
     *
     * Creates a new portfolio record in the database.
     *
     * Expected JSON payload:
     * {
     *   "name": string
     * }
     *
     * @return Response Returns "OK" upon successful portfolio creation.
     */
    #[Route('/createNewPortfolio', methods: ['POST'])]
    public function createNewPortfolio()
    {

        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);

        $name = $data["name"];

        $new_porfolio = new Portfolio(null, $name);

        $db = new DbManipulation();
        $db->add($new_porfolio);
        $db->commit();

        return new Response("OK");
    }

    /**
     * Endpoint: POST /deletePortfolio
     *
     * Deletes a portfolio from the database by its ID.
     *
     * Expected JSON payload:
     * {
     *   "id": int
     * }
     *
     * @return Response Returns a confirmation message after successful deletion.
     */
    #[Route('/deletePortfolio', methods: ['POST'])]
    public function deletePortfolio()
    {
        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);

        $id = $data["id"];

        $portfolioToDelete = (new Portfolio())->query()->where(['id', '=', $id])->first();

        $db = new DbManipulation();
        $db->delete($portfolioToDelete);
        $db->commit();

        return new Response("Successfully deleted");
    }


    /**
     * Endpoint: POST /updatePortfolio
     *
     * Updates the name of an existing portfolio.
     *
     * Expected JSON payload:
     * {
     *   "id": int,
     *   "name": string
     * }
     *
     * @return Response Returns "OK" upon successful update.
     */
    #[Route('/updatePortfolio', methods: ['POST'])]
    public function updatePortfolio()
    {

        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);

        $name = $data["name"];
        $id = $data["id"];

        $porfolio = new Portfolio();
        $porfolio->query()->where(['id', '=', $id])->first();
        $porfolio->setName($name);

        $db = new DbManipulation();
        $db->add($porfolio);
        $db->commit();

        return new Response("OK");
    }

    /**
     * Endpoint: GET /getAllPortfolios
     *
     * Retrieves all portfolio records from the database.
     *
     * @return Response JSON response containing an array of portfolios.
     */
    #[Route('/getAllPortfolios')]
    public function getAllPortfolios()
    {
        $new_porfolio = new Portfolio();
        $all_portfolios = $new_porfolio->query()->all();
        return $this->json($all_portfolios);
    }
}
