<?php

namespace App\DataFixtures;

use App\Entity\Servico\Profissao;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class ProfissaoFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $profissoes = [
            'Eletricista',
            'Encanador',
            'Pintor',
            'Pedreiro',
            'Marceneiro',
            'Jardineiro',
            'Diarista',
            'Técnico de Ar Condicionado',
            'Chaveiro',
        ];

        foreach ($profissoes as $profissao) {
            $e = new Profissao();
            $e->setDescricao($profissao);
            $manager->persist($e);
            $this->addReference('profissão ' . $profissao, $e);
        }

        $manager->flush();
    }
}
