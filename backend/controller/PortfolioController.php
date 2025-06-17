<?php

namespace App\Controller;

use App\Core\BaseController;
use App\Core\Response;
use App\Core\Route;
use App\Model\Portfolio;
use App\Core\DbManipulation;

class PortfolioController extends BaseController
{

    #[Route('/createNewPortfolio', methods: ['POST'])]
    public function createNewPortfolio()
    {

        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);

        $name = $data["name"];
        $currency = $data["currency"];

        $new_porfolio = new Portfolio();
        $new_porfolio->setName($name);
        $new_porfolio->setCurrency($currency);

        $db = new DbManipulation();
        $db->add($new_porfolio);
        $db->commit();

        return new Response("OK");
    }

    #[Route('/deletePortfolio', methods: ['POST'])]
    public function deletePortfolio()
    {
        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);

        $id = $data["id"];
        $portfolioToDelete = new Portfolio();
        $portfolioToDelete->query()->where(['id', '=', $id])->first();

        $db = new DbManipulation();
        $db->delete($portfolioToDelete);
        $db->commit();

        return new Response("Successfully deleted");
    }

    #[Route('/getAllPortfolios')]
    public function getAllPortfolios()
    {
        $new_porfolio = new Portfolio();
        $all_portfolios = $new_porfolio->query()->all();
        return $this->json($all_portfolios);
    }
}
