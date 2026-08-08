<?php

namespace App\Enums;

enum TripStatus: string
{
    case Active = 'active';
    case Completed = 'completed';
    case Archived = 'archived';
}
