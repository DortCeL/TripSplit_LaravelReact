<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Trip;

class TripController extends Controller
{
    public function index()
    {
        $trips = Trip::all();
        return Inertia::render('Trips/Index', compact('trips'));
    }

    public function create() {
        return Inertia::render('Trips/Create');
    }

    public function store(Request $request) {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string'
        ]);

        Trip::create($request->all());    // save into db

        Inertia::flash([
                'color' => 'green',
                'message' => 'Trip created successfully',
                'tripName' => $request->name,
            ]);

        return redirect()->route('trips.index');
    }

    public function destroy(Trip $trip) {
        $trip->delete();
        Inertia::flash([
            'color' => 'red',
            'message' => 'Trip deleted successfully',
            'tripName' => $trip->name,
        ]);
        return redirect()->route('trips.index');
    }

    public function edit(Trip $trip) {
        return Inertia::render('Trips/Edit', compact('trip'));
    }

    public function update(Request $request, Trip $trip) {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string'
        ]);

        $trip->update([
            'name' => $request->name,
            'description' => $request->description,
        ]);
        Inertia::flash([
            'color' => 'green',
            'message' => 'Trip updated successfully',
            'tripName' => $request->name,
        ]);
        return redirect()->route('trips.index');
    }
}
