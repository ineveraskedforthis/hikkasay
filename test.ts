import { generate_prompt, get_player, llm_player_parse_description } from "./game"
const req = generate_prompt(get_player(1, "1234"), "тест");
console.log(req)