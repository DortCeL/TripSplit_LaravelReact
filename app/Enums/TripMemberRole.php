<?php

namespace App\Enums;

enum TripMemberRole: string
{
    case Owner = 'owner';
    case Admin = 'admin';
    case Member = 'member';
}
