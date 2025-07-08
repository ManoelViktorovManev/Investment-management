<?php

namespace App\Controller;

use App\Core\BaseController;
use App\Core\Response;
use App\Core\Route;
use App\Core\DbManipulation;
use App\Model\Settings;

class SettingsController extends BaseController
{


    public function createSettings()
    {
        $settings = new Settings();
        $db = new DbManipulation();
        $db->add($settings);
        $db->commit();

        return new Response("OK");
    }
    #[Route('/getSettings')]
    public function getSettings()
    {
        $settings = new Settings();
        $ifExists = $settings->query()->first();

        if ($ifExists == null) {
            $this->createSettings();
            $settings->query()->first();
        }
        return $this->json(['defaultCurrency' => $settings->getDefaultCurrency()]);
    }

    #[Route('/updateSettings', methods: ['POST'])]
    public function updateSettings()
    {
        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);

        $newDefaultCurrency = $data["defaultCurrency"];

        $db = new DbManipulation();
        $settings = new Settings();
        $ifExists = $settings->query()->first();
        if ($ifExists == null) {
            $this->createSettings();
            $settings->query()->first();
        }

        $settings->setDefaultCurrency($newDefaultCurrency);

        $db->add($settings);
        $db->commit();

        return new Response("OK");
    }
}
