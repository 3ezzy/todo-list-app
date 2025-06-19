<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

/**
 * @method User user() Returns the authenticated user
 */
class TaskController extends Controller
{
    /**
     * Get authenticated user
     */
    private function getAuthUser(): User
    {
        /** @var User $user */
        $user = Auth::user();
        return $user;
    }
    /**
     * Display a listing of the resource.
     * GET /api/tasks
     */
    public function index(): JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();
        $tasks = $user->tasks()->latest()->get();
        
        return response()->json($tasks);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     * POST /api/tasks
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
            ]);

            /** @var User $user */
            $user = Auth::user();
            $task = $user->tasks()->create([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? '',
                'completed' => false,
            ]);

            return response()->json($task, 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        }
    }

    /**
     * Display the specified resource.
     * GET /api/tasks/{id}
     */
    public function show(string $id): JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();
        $task = $user->tasks()->find($id);

        if (!$task) {
            return response()->json([
                'message' => 'Task not found'
            ], 404);
        }

        return response()->json($task);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     * PUT /api/tasks/{id}
     */
    public function update(Request $request, string $id): JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();
        $task = $user->tasks()->find($id);

        if (!$task) {
            return response()->json([
                'message' => 'Task not found'
            ], 404);
        }

        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'completed' => 'boolean',
            ]);

            $task->update($validated);

            return response()->json($task);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        }
    }

    /**
     * Remove the specified resource from storage.
     * DELETE /api/tasks/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();
        $task = $user->tasks()->find($id);

        if (!$task) {
            return response()->json([
                'message' => 'Task not found'
            ], 404);
        }

        $task->delete();

        return response()->json([
            'message' => 'Task deleted successfully'
        ]);
    }

    /**
     * Toggle the completion status of the specified task.
     * PATCH /api/tasks/{id}/toggle
     */
    public function toggle(string $id): JsonResponse
    {
        $task = $this->getAuthUser()->tasks()->find($id);

        if (!$task) {
            return response()->json([
                'message' => 'Task not found'
            ], 404);
        }

        $task->update([
            'completed' => !$task->completed
        ]);

        return response()->json($task);
    }
}
