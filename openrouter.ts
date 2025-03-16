import dotenv from "dotenv";
dotenv.config();

const token = process.env.OPENROUTER_TOKEN;
if (!token) {
  throw new Error("OPENROUTER_TOKEN is not defined in the environment variables");
}

class OpenRouter {
  async chat(keywords: string): Promise<string> {
    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.0-flash-lite-preview-02-05:free",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `${keywords}. Важно: не используй Markdown, ответ не более 400 слов.`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }

      const data = await response.json(); // Преобразуем ответ в JSON

      // Проверяем наличие choices и выводим ответ от ИИ
      if (data.choices && data.choices.length > 0) {
        const message = data.choices[0].message; // Получаем первое сообщение
        return message.content;
      } else {
        return "No choices available.";
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("There was a problem with the fetch operation:", error);
        return "Error occurred: " + error.message; // Возвращаем сообщение об ошибке
      } else {
        console.error("Unexpected error:", error);
        return "An unexpected error occurred.";
      }
    }
  }
}

export default OpenRouter;
