<?php
session_start();
require_once __DIR__ . '/config.php';

if (!isset($_SESSION['chat_history'])) {
    $_SESSION['chat_history'] = [];
}

$chat_history = $_SESSION['chat_history'];
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title><?php echo htmlspecialchars(BUSINESS_NAME); ?> - AI Business Chat Wall</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-100 text-slate-900 min-h-screen">
    <div class="max-w-3xl mx-auto px-4 py-10">
        <header class="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-4">
            <div class="flex items-center gap-4">
                <div class="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xl">
                    <?php echo htmlspecialchars(substr(BUSINESS_NAME, 0, 2)); ?>
                </div>
                <div>
                    <h1 class="text-2xl font-semibold"><?php echo htmlspecialchars(BUSINESS_NAME); ?></h1>
                    <p class="text-sm text-slate-500">AI Business Chat Wall</p>
                </div>
            </div>
            <p class="text-slate-600"><?php echo htmlspecialchars(BUSINESS_ABOUT); ?></p>
        </header>

        <main class="mt-8 bg-white rounded-3xl shadow-sm p-6">
            <div id="chat-container" class="space-y-4">
                <?php foreach ($chat_history as $message): ?>
                    <?php $is_user = $message['role'] === 'user'; ?>
                    <div class="flex <?php echo $is_user ? 'justify-end' : 'justify-start'; ?>">
                        <div class="max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed <?php echo $is_user ? 'bg-emerald-500 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'; ?>">
                            <?php echo nl2br(htmlspecialchars($message['content'])); ?>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
            <div class="mt-6 border-t pt-4">
                <form id="chat-form" class="flex flex-col gap-3">
                    <textarea id="message" rows="3" class="w-full rounded-2xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ask us anything..."></textarea>
                    <div class="flex items-center justify-between">
                        <p class="text-xs text-slate-400">Public chat. Please be respectful.</p>
                        <button type="submit" class="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2 text-white font-medium hover:bg-emerald-600 transition">
                            Send
                        </button>
                    </div>
                </form>
            </div>
        </main>
    </div>

    <script>
        const chatForm = document.getElementById('chat-form');
        const chatContainer = document.getElementById('chat-container');
        const messageInput = document.getElementById('message');

        const appendMessage = (content, role) => {
            const wrapper = document.createElement('div');
            wrapper.className = `flex ${role === 'user' ? 'justify-end' : 'justify-start'}`;

            const bubble = document.createElement('div');
            bubble.className = `max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${role === 'user' ? 'bg-emerald-500 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`;
            bubble.textContent = content;

            wrapper.appendChild(bubble);
            chatContainer.appendChild(wrapper);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        };

        chatForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const message = messageInput.value.trim();
            if (!message) {
                return;
            }

            appendMessage(message, 'user');
            messageInput.value = '';
            messageInput.focus();

            try {
                const response = await fetch('chat.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message })
                });

                const data = await response.json();
                if (data.reply) {
                    appendMessage(data.reply, 'assistant');
                } else {
                    appendMessage(data.error || 'Sorry, something went wrong.', 'assistant');
                }
            } catch (error) {
                appendMessage('Network error. Please try again.', 'assistant');
            }
        });
    </script>
</body>
</html>
