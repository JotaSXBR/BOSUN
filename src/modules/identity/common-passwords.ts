// Senhas comuns com 12+ caracteres (as menores já caem no limite de tamanho), em minúsculas.
// shortcut: lista curta escrita à mão, não as 3.000 de um vazamento; trocar por uma lista pública com fonte se a piloto pedir.
export const COMMON_PASSWORDS: ReadonlySet<string> = new Set([
  "password1234", "password12345", "password123456", "password!234", "passwordpassword",
  "123456789012", "1234567890123", "12345678901234", "123456123456", "123123123123",
  "111111111111", "000000000000", "121212121212", "112233445566", "987654321098",
  "qwertyuiop12", "qwertyuiop123", "qwerty123456", "qwertyqwerty", "qwertyuiopas",
  "1q2w3e4r5t6y", "1qaz2wsx3edc", "zaq12wsxcde3", "asdfghjkl123", "zxcvbnm12345",
  "abcdefghijkl", "abc123abc123", "abcd12345678", "iloveyou1234", "iloveyouiloveyou",
  "letmein12345", "welcome12345", "welcome123456", "admin1234567", "administrator",
  "administrator1", "changeme1234", "trustno11234", "football1234", "baseball1234",
  "superman1234", "batman123456", "princess1234", "sunshine1234", "monkey123456",
  "dragon123456", "master123456", "starwars1234", "pokemon12345", "minecraft123",
  "senha1234567", "senha12345678", "minhasenha123", "mudar123456789", "brasil123456",
  "flamengo1234", "corinthians1", "palmeiras123", "gremio123456", "saopaulo1234",
  "teamo1234567", "deusefiel123", "jesus1234567", "amor12345678", "estrela12345",
]);
