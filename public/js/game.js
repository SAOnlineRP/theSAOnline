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

    //
    // CREATE FRAMES
    //
    function createFrames(texture) {
        const frames = []

        for (let i = 0; i < 8; i++) {
            frames.push(
                new Texture({
                    source: texture.source,
                    frame: new Rectangle(
                        i * 96,
                        0,
                        96,
                        80
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
    }

    //
    // ANIMATIONS
    //
    const animations = {}

    for (const key in textures) {
        animations[key] = createFrames(textures[key])
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

    //
    // PLAYER SCALE
    //
    function updatePlayerScale() {

        const scale = Math.min(
            app.screen.width / 900,
            app.screen.height / 700
        )

        player.scale.set(
            Math.max(scale, 1)
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

        joystickBase.x = 80
        joystickBase.y = app.screen.height - 80

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
    })

})();