import { generate_prompt, get_player, llm_player_parse_description } from "./game"
import DDGS from "./duckai";
let player = get_player(1, "Тестовый");
{
    const req = generate_prompt(player, "Покупаю самоцвет на рынке");
    // console.log(req)
    const ddgs = new DDGS();
    ddgs.chat(req, "gpt-4o-mini").then((value) => {
        llm_player_parse_description(value)
        console.log(value)
        {
            const req = generate_prompt(player, "Использую самоцвет");
            // console.log(req)
            const ddgs = new DDGS();
            ddgs.chat(req, "gpt-4o-mini").then((value) => {
                llm_player_parse_description(value)
                console.log(value)
            }).catch((reason) => {
                console.log(reason)
            });
        }
    }).catch((reason) => {
        console.log(reason)
    });
}

