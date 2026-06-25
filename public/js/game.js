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
        maxHp: 100
    }

    const enemyStats = {
        hp: 100,
        maxHp: 100
    }

    const attackRange = 90

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

        const enemyRatio = enemyStats.hp / enemyStats.maxHp
        enemyHpBarFill.clear()
        enemyHpBarFill.rect(0, 0, hpBarWidth * Math.max(enemyRatio, 0), hpBarHeight).fill(0xff4d4d)
    }

    updateHealthBars()

    const attackButton = document.createElement('button')
    attackButton.textContent = 'Attack'
    attackButton.style.position = 'fixed'
    attackButton.style.right = '20px'
    attackButton.style.bottom = '20px'
    attackButton.style.zIndex = '1000'
    attackButton.style.padding = '10px 16px'
    attackButton.style.border = 'none'
    attackButton.style.borderRadius = '10px'
    attackButton.style.background = '#ff6b6b'
    attackButton.style.color = '#fff'
    attackButton.style.fontWeight = '700'
    attackButton.style.cursor = 'pointer'
    attackButton.style.boxShadow = '0 6px 16px rgba(0,0,0,0.25)'
    document.body.appendChild(attackButton)

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
        enemyStats.hp = Math.max(0, enemyStats.hp - 20)
        updateHealthBars()

        if (enemyStats.hp <= 0) {
            enemy.visible = false
            enemyHpBar.visible = false
        }
    }

    attackButton.addEventListener('click', () => {
        handleAttack()
    })

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

        enemyAI.timer -= delta

        if (enemyAI.timer <= 0) {

            enemyAI.timer = 60 + Math.random() * 120

            enemyAI.dx = Math.floor(Math.random() * 3) - 1
            enemyAI.dy = Math.floor(Math.random() * 3) - 1
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

        playerHpBar.x = player.x - hpBarWidth / 2
        playerHpBar.y = player.y - player.height / 2 - 22

        if (enemy.visible) {
            enemyHpBar.visible = true
            enemyHpBar.x = enemy.x - hpBarWidth / 2
            enemyHpBar.y = enemy.y - enemy.height / 2 - 22
        } else {
            enemyHpBar.visible = false
        }
    })

})();