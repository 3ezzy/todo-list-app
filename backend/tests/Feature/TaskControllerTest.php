<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Task;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class TaskControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    private function authenticatedUser()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;
        
        return ['user' => $user, 'token' => $token];
    }

    public function test_user_can_get_their_tasks()
    {
        $auth = $this->authenticatedUser();
        $user = $auth['user'];
        $token = $auth['token'];

        // Create some tasks for the user
        Task::factory()->count(3)->create(['user_id' => $user->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json',
        ])->get('/api/tasks');

        $response->assertStatus(200)
                ->assertJsonCount(3);
    }

    public function test_user_can_create_task()
    {
        $auth = $this->authenticatedUser();
        $token = $auth['token'];

        $taskData = [
            'title' => 'Test Task',
            'description' => 'This is a test task description',
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json',
        ])->post('/api/tasks', $taskData);

        $response->assertStatus(201)
                ->assertJson([
                    'title' => 'Test Task',
                    'description' => 'This is a test task description',
                    'completed' => false,
                ]);

        $this->assertDatabaseHas('tasks', $taskData);
    }

    public function test_user_can_update_their_task()
    {
        $auth = $this->authenticatedUser();
        $user = $auth['user'];
        $token = $auth['token'];

        $task = Task::factory()->create(['user_id' => $user->id]);

        $updateData = [
            'title' => 'Updated Task Title',
            'description' => 'Updated description',
            'completed' => true,
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json',
        ])->put("/api/tasks/{$task->id}", $updateData);

        $response->assertStatus(200)
                ->assertJson([
                    'title' => 'Updated Task Title',
                    'description' => 'Updated description',
                    'completed' => true,
                ]);
    }

    public function test_user_can_toggle_task_completion()
    {
        $auth = $this->authenticatedUser();
        $user = $auth['user'];
        $token = $auth['token'];

        $task = Task::factory()->create([
            'user_id' => $user->id,
            'completed' => false,
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json',
        ])->patch("/api/tasks/{$task->id}/toggle");

        $response->assertStatus(200)
                ->assertJson(['completed' => true]);
    }

    public function test_user_can_delete_their_task()
    {
        $auth = $this->authenticatedUser();
        $user = $auth['user'];
        $token = $auth['token'];

        $task = Task::factory()->create(['user_id' => $user->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json',
        ])->delete("/api/tasks/{$task->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }

    public function test_user_cannot_access_other_users_tasks()
    {
        $auth1 = $this->authenticatedUser();
        $auth2 = $this->authenticatedUser();
        
        $task = Task::factory()->create(['user_id' => $auth2['user']->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth1['token'],
            'Accept' => 'application/json',
        ])->get("/api/tasks/{$task->id}");

        $response->assertStatus(404);
    }

    public function test_unauthenticated_user_cannot_access_tasks()
    {
        $response = $this->get('/api/tasks');
        $response->assertStatus(401);
    }
} 