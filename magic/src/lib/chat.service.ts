export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatResponse {
  userId: string;
  chat: {
    message: string;
  };
}

export async function sendChatMessage(message: string, userId?: string): Promise<ChatResponse> {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const endpoint = `${baseUrl}/api/chat`;
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, userId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.log(errorData);
    throw new Error(errorData.error || 'Failed to send message');
  }

  return response.json();
}
