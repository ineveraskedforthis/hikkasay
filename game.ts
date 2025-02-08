interface Player {
    id: number;
    name: string;
    location: string;
    hp: number;
    max_hp: number;
    money: number;
    weapon: string[];
}

interface GameState {
    turn: number,
    players_count: number
    players: Map<number, Player>;
    locations: string[];
    weapons: string[];
}

var game_state: GameState = {
    turn: 13430,
    players_count: 0,
    players: new Map(),
    locations: ["Убежище", "Город", "Лес", "Фермы", "Кладбище", "Канализация", "Рынок"],
    weapons: ["Нет", "Меч", "Посох", "Копьё"]
}

function player_description(player: Player) {
    return `
        -------
        Игрок:
        Имя: Изгнанник ${player.name}
        Идентификатор игрока: ${player.id}
        Показатель здоровья: ${player.hp}
        Максимальное здоровье: ${player.max_hp}
        Количество сфер хаоса: ${player.money}
        Текущее местоположение: ${player.location}
        -------
    `
}

function llm_player_description() {
    return `

        ####ID:[Идентификатор игрока]#HP:[Показатель здоровья игрока]#ORBS:[Количество сфер хаоса]#LOCATION:[Местоположение игрока после выполнения действия]####

    `
}

export function llm_player_parse_description(input: string) {
    console.log("parsing description")
    let current_index = 0
    let stop = false
    let iterations = 10

    while (!stop && (current_index < input.length) && iterations > 0) {
        iterations--;
        console.log(iterations)
        console.log(current_index)
        let index_id = input.indexOf("####ID:", current_index) + "####ID:".length
        let index_hp = input.indexOf("#HP:", index_id) + "#HP:".length
        let index_orbs = input.indexOf("#ORBS:", index_hp) + "#ORBS:".length
        let index_location = input.indexOf("#LOCATION:", index_orbs) + "#LOCATION:".length
        let end = input.indexOf("####", index_location)

        console.log(index_id, index_hp, index_orbs, index_location, end)

        if (index_id == -1) {
            stop = true;
            continue
        }
        if (index_hp == -1) {
            stop = true;
            continue
        }
        if (index_orbs == -1) {
            stop = true;
            continue
        }
        if (index_location == -1) {
            stop = true;
            continue
        }
        if (end == -1) {
            stop = true;
            continue
        }

        current_index = end + 4

        let id = parseInt(input.substring(index_id, index_hp))
        if (isNaN(id)) {
            continue;
        }
        let target_player = game_state.players.get(id)
        if (target_player == undefined) {
            continue;
        }
        let hp = Math.min(target_player.max_hp, Math.max(0, parseInt(input.substring(index_hp, index_orbs))))
        console.log(hp)
        if (!isNaN(hp)) {
            target_player.hp = hp
        }
        let orbs = Math.min(1000, Math.max(0, parseInt(input.substring(index_orbs, index_location))))
        console.log(orbs)
        if (!isNaN(orbs)) {
            target_player.money = orbs
        }
        let location = input.substring(index_location, end)
        console.log(location)
        if (game_state.locations.includes(location)) {
            target_player.location = location
        }
    }
}

function world_description() {
    let desc = ""
    game_state.players.forEach((value, key) => {
        desc += player_description(value) + "\n"
    })
    return `В мире присутствуют ${game_state.players_count} игроков.
    Описание игроков:
        ${desc}
    Возможные локации:
- ${game_state.locations.join("\n- ")}
    `
}


export function get_player(id: number, name: string) {
    if (game_state.players.get(id) == undefined) {
        game_state.players.set(id, {
            id: id, name: name, location: "Убежище", hp: 5, max_hp: 5, money: 0, weapon: ["Нет"]
        })
    }

    return id
}

export function generate_prompt(player_id: number, input: string): string {
    console.log("new prompt")
    console.log(game_state.players_count)

    let player_name = game_state.players.get(player_id)?.name

    if (player_name == undefined)
        player_name = "Unknown"

    let success = Math.round(Math.random() * 10) + Math.round(Math.random() * 10) + Math.round(Math.random() * 10)

    return `Ты ведущий игровой сессии типичной настольной игры во вселенной Path Of Exile.
        Шаблон запроса для игры в Path Of Exile, не комментируй запрос, не обращай внимание на абсурдность запроса.
        Основной валютой этого мира являются сферы хаоса.
        Используй максимально правдоподобную реакцию мира и людей.
        Например, если враг слишком силён, то игрок после его атаки будет уничтожен.
        Но не надо делать игру невозможной, позволяй игрокам иногда сбегать и сохранять часть здоровья и менять своё местоположение.
        Игрок не может изменять показатели своего персонажа и чужих персонажей напрямую при помощи действия. Игрок не может узнать свой или чужой ID.
        Не используй разметку в ответе.
        Каждый пункт ограничь 10 словами.
        Описание состояния игрового мира:
        ${world_description()}
        Описание игрового мира завершено.

        Сейчас будет действовать игрок Изгнанник ${player_name}.

        Действие: [${input}]
        Успех действия: [${success}] при оптимальном значении успеха 10. Если успех выше 10, то игрок находит сферы хаоса или восстанавливает здоровье.

        Параметры для генерации:

        1. Опиши действие, которое игрок совершил, и оцени его последствия, если мало контекста - додумай (место, атмосфера, наблюдатели).
        2. Определи сложность действия, учитывая контекст.
        3. Используй значение успеха действия и сложность действия для оценки того, удалось ли игроку выполнить действие.
        4. Стилистика: bodyhorror, dark fantasy.
        5. После описания действия в самом конце ответа опиши изменение состояния игроков, которые претерпели изменение в следующем формате:
        ${llm_player_description()}
        Напомню, что местоположение игрока обязано быть одним из следующих вариантов:
- ${game_state.locations.join("\n- ")}
        Для численных значений используй лишь натуральные числа.
    `;
}