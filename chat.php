<?php
session_start();
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

$raw_input = file_get_contents('php://input');
$payload = json_decode($raw_input, true);
$message = '';

if (is_array($payload) && isset($payload['message'])) {
    $message = trim($payload['message']);
} elseif (isset($_POST['message'])) {
    $message = trim($_POST['message']);
}

if ($message === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Message cannot be empty.']);
    exit;
}

if (!isset($_SESSION['usage_count'])) {
    $_SESSION['usage_count'] = 0;
}

if (USAGE_LIMIT_PER_SESSION > 0 && $_SESSION['usage_count'] >= USAGE_LIMIT_PER_SESSION) {
    http_response_code(429);
    echo json_encode(['error' => 'Usage limit reached. Please try again later.']);
    exit;
}

if (!isset($_SESSION['chat_history'])) {
    $_SESSION['chat_history'] = [];
}

$system_prompt = sprintf(
    "You are the business representative for %s. About the business: %s. Instructions: %s",
    BUSINESS_NAME,
    BUSINESS_ABOUT,
    AI_INSTRUCTIONS
);

$messages = [
    ['role' => 'system', 'content' => $system_prompt],
];

$history = $_SESSION['chat_history'];
$history = array_slice($history, -10);
foreach ($history as $entry) {
    $messages[] = [
        'role' => $entry['role'],
        'content' => $entry['content'],
    ];
}

$messages[] = ['role' => 'user', 'content' => $message];

$payload = [
    'model' => OPENROUTER_MODEL,
    'messages' => $messages,
    'temperature' => 0.7,
];

$ch = curl_init('https://openrouter.ai/api/v1/chat/completions');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . OPENROUTER_API_KEY,
        'HTTP-Referer: https://example.com',
        'X-Title: AI Business Chat Wall',
    ],
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_TIMEOUT => 30,
]);

$result = curl_exec($ch);
if ($result === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to connect to AI service.']);
    curl_close($ch);
    exit;
}

$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code < 200 || $http_code >= 300) {
    http_response_code(502);
    echo json_encode(['error' => 'AI service error.']);
    exit;
}

$data = json_decode($result, true);
$reply = $data['choices'][0]['message']['content'] ?? '';

if ($reply === '') {
    http_response_code(500);
    echo json_encode(['error' => 'Empty AI response.']);
    exit;
}

$_SESSION['chat_history'][] = ['role' => 'user', 'content' => $message];
$_SESSION['chat_history'][] = ['role' => 'assistant', 'content' => $reply];
$_SESSION['usage_count']++;

if (count($_SESSION['chat_history']) > 20) {
    $_SESSION['chat_history'] = array_slice($_SESSION['chat_history'], -20);
}

echo json_encode(['reply' => $reply]);
