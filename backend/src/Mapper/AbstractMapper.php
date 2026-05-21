<?php

namespace App\Mapper;

abstract class AbstractMapper
{
    abstract public function map(mixed $data, array $options): array;

    public function mapCollection(iterable $collection, array $options = []): array
    {
        $result = [];
        foreach ($collection as $item) {
            $result[] = $this->map($item, $options);
        }
        return $result;
    }
}
