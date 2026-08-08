<?php

namespace App\Enums;

enum SettlementStatus: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case Rejected = 'rejected';
    case Forgiven = 'forgiven';
}
