import { generate_prompt, get_player, llm_player_parse_description } from "./game"
import DDGS from "./duckai";

const req = generate_prompt(get_player(1, "Тестовый"), "тренирую тело и разум");
console.log(req)
const ddgs = new DDGS();
ddgs.chat(req, "gpt-4o-mini").then((value) => {
    llm_player_parse_description(value)
    console.log(value)
}).catch((reason) => {
    console.log(reason)
});