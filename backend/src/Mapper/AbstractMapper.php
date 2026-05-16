<?php

namespace App\Mapper;

abstract class AbstractMapper
{
    abstract public function map(mixed $data): array;

    public function mapCollection(iterable $collection): array
    {
        $result = [];
        foreach ($collection as $item) {
            $result[] = $this->map($item);
        }
        return $result;
    }
}
