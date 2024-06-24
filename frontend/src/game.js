class FlappyNFT extends Phaser.Scene {
    constructor() {
        super('FlappyNFT');
        this.player = null;
        this.pipes = null;
        this.score = 0;
        this.scoreText = null;
        this.gameOver = false;
        this.background = null;
        this.pipeVerticalSpacing = 200;
        this.scoreTimer = null;
        this.lastPipeGroup = null;
    }

    init(data) {
        this.nftImage = data.nftImage;
    }

    preload() {
        this.load.image('background', 'assets/background.png');
        this.load.image('pipe', 'assets/pipe.png');
        this.load.image('nft', this.nftImage);
    }

    create() {
        // Set game height to match the viewport
        this.gameHeight = this.sys.game.config.height;

        // Add repeating background
        this.background = this.add.tileSprite(0, 0, this.sys.game.config.width, this.gameHeight, 'background');
        this.background.setOrigin(0, 0);

        // Create pipes group
        this.pipes = this.physics.add.group();

        // Set world bounds to match the viewport
        this.physics.world.setBounds(0, 0, this.sys.game.config.width, this.gameHeight);

        // Add player (NFT)
        this.player = this.physics.add.sprite(100, this.gameHeight / 2, 'nft');
        this.player.displayWidth = 40;
        this.player.displayHeight = 40;
        this.player.setCollideWorldBounds(false); // Allow player to fall off screen

        // Add score text above everything else
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
        this.scoreText.setDepth(1);

        // Add input listener
        this.input.on('pointerdown', this.jump, this);

        // Add pipe creation timer
        this.time.addEvent({
            delay: 1500,
            callback: this.addPipes,
            callbackScope: this,
            loop: true
        });

        // Add collision detection
        this.physics.add.collider(this.player, this.pipes, this.hitPipe, null, this);

        // Add score timer
        this.scoreTimer = this.time.addEvent({
            delay: 500,
            callback: this.increaseScore,
            callbackScope: this,
            loop: true
        });

        // Reset game state
        this.gameOver = false;
        this.score = 0;
    }

    update() {
        if (this.gameOver) {
            return;
        }

        // Move background
        this.background.tilePositionX += 2;

        // Check if player is out of bounds
        if (this.player.y > this.gameHeight) {
            this.hitPipe();
            return;
        }

        // Rotate the player based on its velocity
        if (this.player.body.velocity.y > 200) {
            this.player.angle = 90;
        } else {
            this.player.angle = -15;
        }

        // Remove pipes that have moved off screen
        this.pipes.children.entries.forEach((pipe) => {
            if (pipe.x < -pipe.width) {
                this.pipes.remove(pipe, true, true);
            }
        });

        // Increase score when passing pipes
        if (this.lastPipeGroup && !this.lastPipeGroup.scored && this.lastPipeGroup.x < this.player.x) {
            this.score += 10;
            this.scoreText.setText('Score: ' + this.score);
            this.lastPipeGroup.scored = true;
        }
    }

    jump() {
        if (this.gameOver) return;
        this.player.setVelocityY(-250);
    }

    addPipes() {
        if (this.gameOver) return;
    
        const pipeWidth = 70;
        const pipeHeight = 430;
        const pipeHorizontalSpacing = 400;
    
        // Randomly choose the size of the gap, between 150 and 250 pixels
        this.pipeVerticalSpacing = Phaser.Math.Between(150, 250);
    
        // Calculate the Y position for the bottom of the top pipe
        const topPipeBottomY = Phaser.Math.Between(50, this.gameHeight - this.pipeVerticalSpacing - 50);
    
        // Create pipes
        const topPipe = this.pipes.create(this.sys.game.config.width + pipeWidth / 2, topPipeBottomY - pipeHeight / 2, 'pipe');
        const bottomPipe = this.pipes.create(this.sys.game.config.width + pipeWidth / 2, this.gameHeight + pipeHeight / 2, 'pipe');
    
        // Set up pipe properties
        [topPipe, bottomPipe].forEach(pipe => {
            pipe.body.allowGravity = false;
            pipe.body.velocity.x = -200;
            pipe.body.immovable = true;
            pipe.setDisplaySize(pipeWidth, pipeHeight);
        });
    
        // Flip the top pipe
        topPipe.setFlipY(true);
    
        // Group the pipes
        this.lastPipeGroup = { x: topPipe.x, scored: false };
    }

    increaseScore() {
        if (!this.gameOver) {
            this.score += 1;
            this.scoreText.setText('Score: ' + this.score);
        }
    }

    hitPipe() {
        this.physics.pause();
        this.player.setTint(0xff0000);
        this.gameOver = true;
        this.scoreTimer.remove();

        // Display game over text
        this.add.text(this.sys.game.config.width / 2, this.gameHeight / 2, 'Game Over', { fontSize: '64px', fill: '#000' }).setOrigin(0.5);
        this.add.text(this.sys.game.config.width / 2, this.gameHeight / 2 + 50, 'Click to Restart', { fontSize: '32px', fill: '#000' }).setOrigin(0.5);

        // Add click listener to restart
        this.input.on('pointerdown', () => {
            this.scene.restart();
        }, this);
    }
}

export default FlappyNFT;