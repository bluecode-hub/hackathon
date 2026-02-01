from google import genai

client = genai.Client(api_key="AIzaSyCTbQ0fupxWojlOb0cH3iuJaJzxXlUwZ4Q")

response = client.models.generate_content(
    model="gemini-3-flash-preview", contents="Explain how AI works in a few words"
)
print(response.text)
