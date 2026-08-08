<?php

namespace App\Enums;

enum SettlementType: string
{
    case Manual = 'manual';
    case Forgiveness = 'forgiveness';
    case Gift = 'gift';
}
