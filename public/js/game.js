(async () => {

    const {
        Application,
        Assets,
        AnimatedSprite,
        Texture,
        Rectangle,
        Graphics,
        Container
    } = PIXI

    const app = new Application()

    await app.init({
        resizeTo: window,
        background: '#4d774e'
    })

    document.body.appendChild(app.canvas)

    app.stage.eventMode = 'static'

    //
    // UI
    //
    const ui = new Container()
    app.stage.addChild(ui)

    const playerStats = {
        hp: 100,
        maxHp: 100,
        mp: 100,
        maxMp: 100
    }

    const enemyStats = {
        hp: 100,
        maxHp: 100
    }

    const attackRange = 90
    const playerAttackPower = 20
    const skillAttackPower = 40
    const healAmount = 30
    const buffDuration = 4 * 60
    const buffMultiplier = 1.5
    const attackMpGain = 8
    const skillMpCost = {
        attack: 20,
        heal: 25,
        buff: 18
    }

    let playerAttackBuff = false
    let buffTimer = 0
    let skillCooldowns = {
        attack: 0,
        heal: 0,
        buff: 0
    }

    const hpBarWidth = 80
    const hpBarHeight = 10

    const playerHpBar = new Container()
    const playerHpBarBg = new Graphics()
    playerHpBarBg.rect(0, 0, hpBarWidth, hpBarHeight).fill(0x222222)
    playerHpBarBg.stroke({ color: 0xffffff, width: 1 })
    const playerHpBarFill = new Graphics()
    playerHpBarFill.rect(0, 0, hpBarWidth, hpBarHeight).fill(0x00cc66)
    playerHpBar.addChild(playerHpBarBg, playerHpBarFill)
    ui.addChild(playerHpBar)

    const playerMpBar = new Container()
    const playerMpBarBg = new Graphics()
    playerMpBarBg.rect(0, 0, hpBarWidth, hpBarHeight).fill(0x222222)
    playerMpBarBg.stroke({ color: 0xffffff, width: 1 })
    const playerMpBarFill = new Graphics()
    playerMpBarFill.rect(0, 0, hpBarWidth, hpBarHeight).fill(0x3399ff)
    playerMpBar.addChild(playerMpBarBg, playerMpBarFill)
    ui.addChild(playerMpBar)

    const enemyHpBar = new Container()
    const enemyHpBarBg = new Graphics()
    enemyHpBarBg.rect(0, 0, hpBarWidth, hpBarHeight).fill(0x222222)
    enemyHpBarBg.stroke({ color: 0xffffff, width: 1 })
    const enemyHpBarFill = new Graphics()
    enemyHpBarFill.rect(0, 0, hpBarWidth, hpBarHeight).fill(0xff4d4d)
    enemyHpBar.addChild(enemyHpBarBg, enemyHpBarFill)
    ui.addChild(enemyHpBar)

    function updateHealthBars() {
        const playerRatio = playerStats.hp / playerStats.maxHp
        playerHpBarFill.clear()
        playerHpBarFill.rect(0, 0, hpBarWidth * Math.max(playerRatio, 0), hpBarHeight).fill(0x00cc66)

        const playerMpRatio = playerStats.mp / playerStats.maxMp
        playerMpBarFill.clear()
        playerMpBarFill.rect(0, 0, hpBarWidth * Math.max(playerMpRatio, 0), hpBarHeight).fill(0x3399ff)

        const enemyRatio = enemyStats.hp / enemyStats.maxHp
        enemyHpBarFill.clear()
        enemyHpBarFill.rect(0, 0, hpBarWidth * Math.max(enemyRatio, 0), hpBarHeight).fill(0xff4d4d)
    }

    updateHealthBars()

    const controls = document.createElement('div')
    controls.style.position = 'fixed'
    controls.style.right = '20px'
    controls.style.bottom = '20px'
    controls.style.display = 'flex'
    controls.style.flexDirection = 'column'
    controls.style.gap = '10px'
    controls.style.zIndex = '1000'
    document.body.appendChild(controls)

    const attackButton = document.createElement('button')
    attackButton.textContent = 'Attack'
    attackButton.style.padding = '10px 16px'
    attackButton.style.border = 'none'
    attackButton.style.borderRadius = '10px'
    attackButton.style.background = '#ff6b6b'
    attackButton.style.color = '#fff'
    attackButton.style.fontWeight = '700'
    attackButton.style.cursor = 'pointer'
    attackButton.style.boxShadow = '0 6px 16px rgba(0,0,0,0.25)'
    controls.appendChild(attackButton)

    const skillButtons = {
        attack: document.createElement('button'),
        heal: document.createElement('button'),
        buff: document.createElement('button')
    }

    skillButtons.attack.textContent = 'Skill Attack'
    skillButtons.heal.textContent = 'Skill Heal'
    skillButtons.buff.textContent = 'Skill Buff'

    Object.values(skillButtons).forEach((button) => {
        button.style.padding = '10px 16px'
        button.style.border = 'none'
        button.style.borderRadius = '10px'
        button.style.background = '#4a90e2'
        button.style.color = '#fff'
        button.style.fontWeight = '700'
        button.style.cursor = 'pointer'
        button.style.boxShadow = '0 6px 16px rgba(0,0,0,0.25)'
        controls.appendChild(button)
    })

    function playAttackAnimation() {
        let attackName = 'attack_down'

        if (currentAnimation === 'walk_left' || currentAnimation === 'idle_left') {
            attackName = 'attack_left'
        } else if (currentAnimation === 'walk_right' || currentAnimation === 'idle_right') {
            attackName = 'attack_right'
        } else if (currentAnimation === 'walk_up' || currentAnimation === 'idle_up') {
            attackName = 'attack_up'
        }

        player.textures = animations[attackName]
        player.loop = false
        player.play()
        player.onComplete = () => {
            player.loop = true
            if (currentAnimation === 'walk_left' || currentAnimation === 'idle_left') {
                setAnimation('idle_left')
            } else if (currentAnimation === 'walk_right' || currentAnimation === 'idle_right') {
                setAnimation('idle_right')
            } else if (currentAnimation === 'walk_up' || currentAnimation === 'idle_up') {
                setAnimation('idle_up')
            } else {
                setAnimation('idle_down')
            }
        }
    }

    function handleAttack() {
        if (!enemy.visible || enemyStats.hp <= 0) {
            return
        }

        const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y)

        if (distance > attackRange) {
            return
        }

        playAttackAnimation()
        const damage = playerAttackBuff ? playerAttackPower * buffMultiplier : playerAttackPower
        enemyStats.hp = Math.max(0, enemyStats.hp - damage)
        playerStats.mp = Math.min(playerStats.maxMp, playerStats.mp + attackMpGain)
        updateHealthBars()

        if (enemyStats.hp <= 0) {
            enemy.visible = false
            enemyHpBar.visible = false
        }
    }

    function useSkill(skillName) {
        if (skillCooldowns[skillName] > 0) {
            return
        }

        if (skillName === 'attack') {
            if (playerStats.mp < skillMpCost.attack) {
                return
            }

            if (!enemy.visible || enemyStats.hp <= 0) {
                return
            }

            const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y)
            if (distance > attackRange) {
                return
            }

            playAttackAnimation()
            enemyStats.hp = Math.max(0, enemyStats.hp - skillAttackPower)
            playerStats.mp = Math.max(0, playerStats.mp - skillMpCost.attack)
            updateHealthBars()
            if (enemyStats.hp <= 0) {
                enemy.visible = false
                enemyHpBar.visible = false
            }
            skillCooldowns.attack = 4 * 60
        }

        if (skillName === 'heal') {
            if (playerStats.mp < skillMpCost.heal) {
                return
            }

            playerStats.mp = Math.max(0, playerStats.mp - skillMpCost.heal)
            playerStats.hp = Math.min(playerStats.maxHp, playerStats.hp + healAmount)
            updateHealthBars()
            skillCooldowns.heal = 6 * 60
        }

        if (skillName === 'buff') {
            if (playerStats.mp < skillMpCost.buff) {
                return
            }

            playerStats.mp = Math.max(0, playerStats.mp - skillMpCost.buff)
            playerAttackBuff = true
            buffTimer = buffDuration
            skillCooldowns.buff = 8 * 60
        }
    }

    attackButton.addEventListener('click', () => {
        handleAttack()
    })

    skillButtons.attack.addEventListener('click', () => useSkill('attack'))
    skillButtons.heal.addEventListener('click', () => useSkill('heal'))
    skillButtons.buff.addEventListener('click', () => useSkill('buff'))

    //
    // CREATE FRAMES
    //
    function createFrames(
        texture,
        frameWidth,
        frameHeight,
        totalFrames
    ) {
        const frames = []

        for (let i = 0; i < totalFrames; i++) {
            frames.push(
                new Texture({
                    source: texture.source,
                    frame: new Rectangle(
                        i * frameWidth,
                        0,
                        frameWidth,
                        frameHeight
                    )
                })
            )
        }

        return frames
    }

    //
    // LOAD TEXTURES
    //
    const textures = {
        idle_down: await Assets.load('/player/idle_down.png'),
        idle_up: await Assets.load('/player/idle_up.png'),
        idle_left: await Assets.load('/player/idle_left.png'),
        idle_right: await Assets.load('/player/idle_right.png'),

        walk_down: await Assets.load('/player/walk_down.png'),
        walk_up: await Assets.load('/player/walk_up.png'),
        walk_left: await Assets.load('/player/walk_left.png'),
        walk_right: await Assets.load('/player/walk_right.png'),

        attack_down: await Assets.load('/player/attack_down.png'),
        attack_up: await Assets.load('/player/attack_up.png'),
        attack_left: await Assets.load('/player/attack_left.png'),
        attack_right: await Assets.load('/player/attack_right.png'),
    }

    const enemyTextures = {
        idle: await Assets.load('/enemy/Mushroom-Idle.png'),
        walk: await Assets.load('/enemy/Mushroom-Run.png'),
    }
    //
    // ANIMATIONS
    //
    const animations = {}

    for (const key in textures) {
        animations[key] = createFrames(
            textures[key],
            96,
            80,
            8
        )
    }

    const enemyAnimations = {
        idle: createFrames(
            enemyTextures.idle,
            80,
            64,
            7
        ),

        walk: createFrames(
            enemyTextures.walk,
            80,
            64,
            8
        )
    }

    //
    // PLAYER
    //
    const player = new AnimatedSprite(
        animations.idle_down
    )

    player.animationSpeed = 0.15
    player.play()

    player.anchor.set(0.5)

    player.x = app.screen.width / 2
    player.y = app.screen.height / 2

    app.stage.addChild(player)

    // ENEMY
    const enemy = new AnimatedSprite(
        enemyAnimations.idle
    )

    enemy.anchor.set(0.5)
    enemy.animationSpeed = 0.12
    enemy.play()

    enemy.scale.set(2)

    enemy.x = 300
    enemy.y = 200

    app.stage.addChild(enemy)

    const enemyAI = {
        dx: 0,
        dy: 0,
        timer: 0
    }

    const enemySpeed = 100
    const enemyChaseRange = 250
    const enemyAttackRange = 70
    const enemyAttackDamage = 10
    const enemyAttackCooldown = 1.2 * 60
    let enemyAttackTimer = 0

    //
    // PLAYER SCALE
    //
    function updatePlayerScale() {

        const scale = Math.min(
            app.screen.width / 900,
            app.screen.height / 700
        )

        const playerSize = 2
        const enemySize = 2

        player.scale.set(
            Math.max(scale, 1) * playerSize
        )

        enemy.scale.set(
            Math.max(scale, 1) * enemySize
        )
    }

    updatePlayerScale()

    //
    // JOYSTICK
    //
    const joystick = {
        active: false,
        dx: 0,
        dy: 0,
        radius: 65
    }

    const joystickBase = new Graphics()

    joystickBase.circle(0, 0, joystick.radius)
    joystickBase.fill(0x444444)
    joystickBase.alpha = 0.35

    const joystickKnob = new Graphics()

    joystickKnob.circle(0, 0, 30)
    joystickKnob.fill(0xffffff)
    joystickKnob.alpha = 0.6

    ui.addChild(joystickBase)
    ui.addChild(joystickKnob)

    //
    // RESPONSIVE UI
    //
    function updateUI() {

        ui.visible = true

        joystickBase.x = 100
        joystickBase.y = app.screen.height - 100

        joystickKnob.x = joystickBase.x
        joystickKnob.y = joystickBase.y

        updatePlayerScale()
    }

    updateUI()

    window.addEventListener('resize', updateUI)

    //
    // KEYBOARD
    //
    const keys = {}

    window.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true
    })

    window.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false
    })

    //
    // JOYSTICK TOUCH
    //
    app.stage.on('pointerdown', (e) => {

        const pos = e.global

        const dx = pos.x - joystickBase.x
        const dy = pos.y - joystickBase.y

        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance <= joystick.radius * 2) {
            joystick.active = true
        }
    })

    app.stage.on('pointermove', (e) => {

        if (!joystick.active)
            return

        const pos = e.global

        let dx = pos.x - joystickBase.x
        let dy = pos.y - joystickBase.y

        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance > joystick.radius) {
            dx *= joystick.radius / distance
            dy *= joystick.radius / distance
        }

        joystick.dx = dx / joystick.radius
        joystick.dy = dy / joystick.radius

        joystickKnob.x = joystickBase.x + dx
        joystickKnob.y = joystickBase.y + dy
    })

    function resetJoystick() {

        joystick.active = false

        joystick.dx = 0
        joystick.dy = 0

        joystickKnob.x = joystickBase.x
        joystickKnob.y = joystickBase.y
    }

    app.stage.on('pointerup', resetJoystick)
    app.stage.on('pointerupoutside', resetJoystick)

    //
    // ANIMATION
    //
    let currentAnimation = 'idle_down'

    function setAnimation(name) {

        if (currentAnimation === name)
            return

        currentAnimation = name

        player.textures = animations[name]

        player.play()
    }

    //
    // ENEMY ANIMATION
    //
    let enemyAnimation = 'idle'

    function setEnemyAnimation(name) {

        if (enemyAnimation === name)
            return

        enemyAnimation = name

        enemy.textures = enemyAnimations[name]

        enemy.play()
    }

    //
    // SPEED
    //
    const speed = 250

    //
    // GAME LOOP
    //
    app.ticker.add((ticker) => {

        const delta = ticker.deltaTime / 60

        let moving = false

        const moveX =
            (keys['d'] ? 1 : 0)
            - (keys['a'] ? 1 : 0)
            + joystick.dx

        const moveY =
            (keys['s'] ? 1 : 0)
            - (keys['w'] ? 1 : 0)
            + joystick.dy

        if (moveX !== 0 || moveY !== 0) {

            player.x += moveX * speed * delta
            player.y += moveY * speed * delta

            if (Math.abs(moveX) > Math.abs(moveY)) {

                if (moveX > 0) {
                    setAnimation('walk_right')
                } else {
                    setAnimation('walk_left')
                }

            } else {

                if (moveY > 0) {
                    setAnimation('walk_down')
                } else {
                    setAnimation('walk_up')
                }
            }

            moving = true
        }

        //
        // IDLE
        //
        if (!moving) {

            if (currentAnimation === 'walk_up')
                setAnimation('idle_up')

            else if (currentAnimation === 'walk_down')
                setAnimation('idle_down')

            else if (currentAnimation === 'walk_left')
                setAnimation('idle_left')

            else if (currentAnimation === 'walk_right')
                setAnimation('idle_right')
        }

        //
        // SCREEN BOUNDS
        //
        player.x = Math.max(
            player.width / 2,
            Math.min(
                app.screen.width - player.width / 2,
                player.x
            )
        )

        player.y = Math.max(
            player.height / 2,
            Math.min(
                app.screen.height - player.height / 2,
                player.y
            )
        )

        const enemyAlive = enemy.visible && enemyStats.hp > 0

        if (!enemyAlive) {
            enemyAI.dx = 0
            enemyAI.dy = 0
            enemyAttackTimer = 0
            setEnemyAnimation('idle')
        } else {
            const distanceToPlayer = Math.hypot(
                player.x - enemy.x,
                player.y - enemy.y
            )

            if (distanceToPlayer < enemyChaseRange) {
                const chaseDx = player.x - enemy.x
                const chaseDy = player.y - enemy.y
                const chaseDistance = Math.hypot(chaseDx, chaseDy) || 1

                enemyAI.dx = chaseDx / chaseDistance
                enemyAI.dy = chaseDy / chaseDistance
                enemyAI.timer = 0
            } else {
                enemyAI.timer -= delta

                if (enemyAI.timer <= 0) {
                    enemyAI.timer = 60 + Math.random() * 120

                    enemyAI.dx = Math.floor(Math.random() * 3) - 1
                    enemyAI.dy = Math.floor(Math.random() * 3) - 1
                }
            }

            enemy.x += enemyAI.dx * enemySpeed * delta
            enemy.y += enemyAI.dy * enemySpeed * delta

            enemy.x = Math.max(
                enemy.width / 2,
                Math.min(
                    app.screen.width - enemy.width / 2,
                    enemy.x
                )
            )

            enemy.y = Math.max(
                enemy.height / 2,
                Math.min(
                    app.screen.height - enemy.height / 2,
                    enemy.y
                )
            )

            if (enemyAI.dx !== 0 || enemyAI.dy !== 0) {
                setEnemyAnimation('walk')
            } else {
                setEnemyAnimation('idle')
            }

            if (distanceToPlayer <= enemyAttackRange) {
                enemyAttackTimer -= delta

                if (enemyAttackTimer <= 0) {
                    playerStats.hp = Math.max(0, playerStats.hp - enemyAttackDamage)
                    updateHealthBars()
                    enemyAttackTimer = enemyAttackCooldown
                }
            } else {
                enemyAttackTimer = 0
            }
        }

        if (buffTimer > 0) {
            buffTimer -= delta
            if (buffTimer <= 0) {
                playerAttackBuff = false
            }
        }

        Object.entries(skillCooldowns).forEach(([key, value]) => {
            if (value > 0) {
                skillCooldowns[key] = Math.max(0, value - delta)
            }
        })

        playerHpBar.x = player.x - hpBarWidth / 2
        playerHpBar.y = player.y - player.height / 2 - 22
        playerMpBar.x = player.x - hpBarWidth / 2
        playerMpBar.y = player.y - player.height / 2 - 8

        if (enemy.visible) {
            enemyHpBar.visible = true
            enemyHpBar.x = enemy.x - hpBarWidth / 2
            enemyHpBar.y = enemy.y - enemy.height / 2 - 22
        } else {
            enemyHpBar.visible = false
        }
    })

})();