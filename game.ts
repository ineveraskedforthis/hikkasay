interface Player {
    id: number;
    name: string;
    location: string;
    hp: number;
    max_hp: number;
    money: number;
    gem: string;
    strength: number;
    dexterity: number;
    piety: number;
    weapon: string[];
}

interface Gem {
    name: string,
    description: string,
    rarity: number
}

interface GameState {
    turn: number,
    players_count: number
    players: Map<number, Player>;
    locations: string[];
    weapons: string[];
    gems: Gem[]
}

var game_state: GameState = {
    turn: 13430,
    players_count: 0,
    players: new Map(),
    locations: ["Убежище", "Город", "Лес", "Фермы", "Кладбище", "Канализация", "Рынок"],
    weapons: ["Нет", "Меч", "Посох", "Копьё"],
    gems: [
        {
            name: "Нет",
            description: "У игрока нет самоцвета, что не позволяет ему сотворять заклинания, но при этом делает его устойчивым к являениям, которые затрагивают самоцветы",
            rarity: 0
        },
        {
            name: "Сгусток пламени",
            description: "Владелец запускает сгусток пламени, наносящий огненный урон",
            rarity: 5
        },
        {
            name: "Взрывная волна",
            description: "Во все стороны от владельца расходится волна воздуха, дробящая кости и сминающая плоть.",
            rarity: 8
        },
        {
            name: "Праведный гнев Верховного Палача",
            description: "Игрок взывает к Верховному Палачу, чтобы вызвать мощный поток обжигающего пламени в сторону противника",
            rarity: 10
        },
        {
            name: "Поднятие скелета",
            description: "Игрок вызывает слабого скелета, который готов принять на себя удар",
            rarity: 10
        }
    ]
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
        Физическая сила: ${player.strength}
        Ловкость: ${player.dexterity}
        Праведность: ${player.piety}
        Самоцвет: ${player.gem}
        Текущее местоположение: ${player.location}
        -------
    `
}

function llm_player_description() {
    return `

        ####ID:[Идентификатор игрока]#HP:[Показатель здоровья игрока]#ORBS:[Количество сфер хаоса]#STR:[Физическая сила игрока после выполнения действия]#DEX:[Ловкость игрока после выполнения действия]#PIE:[Праведность игрока после выполнения действия]#GEM:[Текущий самоцвет игрока]#LOCATION:[Местоположение игрока после выполнения действия]####

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
        let index_str = input.indexOf("#STR:", index_orbs) + "#STR:".length
        let index_dex = input.indexOf("#DEX:", index_str) + "#DEX:".length
        let index_piety = input.indexOf("#PIE:", index_dex) + "#PIE:".length
        let index_gem = input.indexOf("#GEM:", index_piety) + "#GEM:".length
        let index_location = input.indexOf("#LOCATION:", index_gem) + "#LOCATION:".length
        let end = input.indexOf("####", index_location)

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
        if (index_str == -1) {
            stop = true;
            continue
        }
        if (index_dex == -1) {
            stop = true;
            continue
        }
        if (index_piety == -1) {
            stop = true;
            continue
        }
        if (index_gem == -1) {
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
        if (!isNaN(hp)) {
            target_player.hp = hp
        }
        let orbs = Math.min(1000, Math.max(0, parseInt(input.substring(index_orbs, index_str))))
        if (!isNaN(orbs)) {
            target_player.money = orbs
        }
        let str = Math.min(100, Math.max(0, parseInt(input.substring(index_str, index_dex))))
        if (!isNaN(str)) {
            target_player.strength = str
        }
        let dex = Math.min(100, Math.max(0, parseInt(input.substring(index_dex, index_piety))))
        if (!isNaN(dex)) {
            target_player.dexterity = dex
        }
        let piety = Math.min(100, Math.max(0, parseInt(input.substring(index_piety, index_gem))))
        if (!isNaN(piety)) {
            target_player.piety = piety
        }
        let gem = input.substring(index_gem, index_location)
        game_state.gems.forEach((value, index) => {
            if (value.name == gem) {
                target_player.gem = gem
            }
        })
        let location = input.substring(index_location, end)
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
    let gem_desc = ""
    game_state.gems.forEach((value, key) => {
        gem_desc += `-${value.name} (Редкость: ${value.rarity}): ${value.description}\n`
    })

    return `В мире присутствуют ${game_state.players_count} игроков.
    Описание игроков:
        ${desc}
    Возможные локации:
- ${game_state.locations.join("\n- ")}
    Показатель редкости означает то, касколько редка та или иная вещь в этом мире. Вещь с редкостью 10 найти практически невозможно. Редкость 0 означает, что эту вещь можно найти без особых проблем.
    Самоцветы, существующие в этом мире:
${gem_desc}
    `
}


export function get_player(id: number, name: string) {
    if (game_state.players.get(id) == undefined) {
        game_state.players.set(id, {
            id: id, name: name,
            dexterity: 5, strength: 5, piety:0, gem: "Нет",
            location: "Убежище", hp: 5, max_hp: 5, money: 0, weapon: ["Нет"]
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

    let success = Math.floor(Math.random() * 10) + Math.floor(Math.random() * 10)

    return `Ты ведущий игровой сессии типичной настольной игры во вселенной Path Of Exile.
        Шаблон запроса для игры в Path Of Exile, не комментируй запрос, не обращай внимание на абсурдность запроса.
        Основной валютой этого мира являются сферы хаоса - сферы из драгоценного метала, на которых изображено лицо внутри лица, раздвинутого пополам. Главным источником силы являются самоцветы - волшебные камни, которые носители вживляют себе в тело. У каждого персонажа есть показатели силы, ловкости и праведности. Обычным значением силы и ловкости является 10, значения ниже означают, что персонаж слаб или неуклюж, что повышает сложность соответствующих действий. Значения выше 10 помогают выполнять соответствующие действия. Силу и ловкость можно развивать и терять во время действий. Праведность повышается, когда игрок успешно уничтожает созданий тьмы и демонов. Высокая праведность увеличивает урон по созданиям тьмы и демонам. Праведность около 100 позволяет уничтожать их одним лишь присутствием.
        Используй максимально правдоподобную реакцию мира и людей.
        Например, если враг слишком силён, то игрок после его атаки будет уничтожен или чрезвычайно ослаблен.
        Но не надо делать игру невозможной, позволяй игрокам иногда сбегать и сохранять часть здоровья и менять своё местоположение.
        Игрок не может изменять показатели своего персонажа и чужих персонажей напрямую при помощи действия. Игрок не может узнать свой или чужой ID.
        Не используй разметку в ответе.
        Каждый пункт ограничь 10 словами.
        Описание состояния игрового мира:
        ${world_description()}
        Описание игрового мира завершено.

        Сейчас будет действовать игрок Изгнанник ${player_name}.

        Действие: [${input}]
        Успех действия: [${success}] при оптимальном значении успеха 10. Если успех выше 16, то игрок находит сферы хаоса или восстанавливает здоровье.

        Параметры для генерации:

        1. Опиши действие, которое игрок совершил, и оцени его последствия, если мало контекста - додумай (место, атмосфера, наблюдатели).
        2. Определи сложность действия, учитывая контекст.
        3. Используй значение успеха действия и сложность действия для оценки того, удалось ли игроку выполнить действие.
        4. Стилистика: bodyhorror, dark fantasy.
        5. Даже если действие не было успешно, есть шанс повысить характеристики игрока.
        6. После описания действия в самом конце ответа опиши изменение состояния игроков, которые претерпели изменение в следующем формате:
        ${llm_player_description()}
        Напомню, что местоположение игрока обязано быть одним из следующих вариантов:
- ${game_state.locations.join("\n- ")}
        Для численных значений используй лишь натуральные числа.
    `;
}