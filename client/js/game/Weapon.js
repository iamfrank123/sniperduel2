// Weapon - Sniper rifle mechanics
import * as THREE from 'three';
import { GAME_CONSTANTS, WEAPON_STATES } from '../../../shared/constants.js';

export class Weapon {
    constructor(player, scene, network, ui, audioManager) {
        this.player = player;
        this.scene = scene;
        this.network = network;
        this.ui = ui;
        this.audioManager = audioManager;

        this.state = WEAPON_STATES.IDLE;
        this.currentAmmo = GAME_CONSTANTS.MAGAZINE_SIZE;
        this.reserveAmmo = GAME_CONSTANTS.RESERVE_AMMO;
        this.infiniteAmmo = false;
        this.isScoped = false;

        this.lastShotTime = 0;
        this.boltActionStartTime = 0;
        this.reloadStartTime = 0;

        this.targetFOV = GAME_CONSTANTS.DEFAULT_FOV;
        this.currentFOV = GAME_CONSTANTS.DEFAULT_FOV;

        this.updateUI();
    }

    update(deltaTime) {
        // Handle input
        this.handleInput();

        // Update state machine
        this.updateState(deltaTime);

        // Update FOV transition (smooth scope)
        this.updateFOV(deltaTime);
    }

    handleInput() {
        const input = this.player.input;

        switch (this.state) {
            case WEAPON_STATES.IDLE:
                // Scope toggle
                if (input.isMouseRightDown() && !this.isScoped) {
                    this.enterScope();
                }

                // Reload
                if (input.isReloadPressed() && this.currentAmmo < GAME_CONSTANTS.MAGAZINE_SIZE) {
                    this.startReload();
                }
                break;

            case WEAPON_STATES.AIMING:
                // Shoot
                if (input.isMouseLeftDown()) {
                    this.shoot();
                }

                // Exit scope
                if (!input.isMouseRightDown()) {
                    this.exitScope();
                }

                // Reload
                if (input.isReloadPressed() && this.currentAmmo < GAME_CONSTANTS.MAGAZINE_SIZE) {
                    this.exitScope();
                    this.startReload();
                }
                break;
        }
    }

    updateState(deltaTime) {
        const now = Date.now();

        switch (this.state) {
            case WEAPON_STATES.BOLT_ACTION:
                const boltElapsed = (now - this.boltActionStartTime) / 1000;
                if (boltElapsed >= GAME_CONSTANTS.BOLT_ACTION_TIME) {
                    this.state = this.isScoped ? WEAPON_STATES.AIMING : WEAPON_STATES.IDLE;
                }
                break;

            case WEAPON_STATES.RELOADING:
                const reloadElapsed = (now - this.reloadStartTime) / 1000;
                if (reloadElapsed >= GAME_CONSTANTS.RELOAD_TIME) {
                    this.completeReload();
                }
                break;
        }
    }

    updateFOV(deltaTime) {
        // Smooth FOV transition
        const speed = GAME_CONSTANTS.FOV_TRANSITION_SPEED;
        this.currentFOV += (this.targetFOV - this.currentFOV) * speed * deltaTime;
        this.player.camera.fov = this.currentFOV;
        this.player.camera.updateProjectionMatrix();
    }

    shoot() {
        if (this.currentAmmo <= 0 && !this.infiniteAmmo) {
            // Dry fire sound
            return;
        }

        if (this.state !== WEAPON_STATES.AIMING) {
            return;
        }

        // Change state
        this.state = WEAPON_STATES.FIRING;

        if (!this.infiniteAmmo) {
            this.currentAmmo--;
        }

        this.updateUI();

        // Calculate accuracy
        const accuracy = this.calculateAccuracy();

        // Get ray direction from camera
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.player.camera.quaternion);

        // Apply spread
        const spreadDirection = this.applySpread(direction, accuracy);

        // Visual effects
        this.playMuzzleFlash();
        this.createBulletTracer(spreadDirection);
        this.applyCameraRecoil();

        // Play sound
        if (this.audioManager) {
            this.audioManager.playShot();
        }

        // Send to server
        this.network.sendShoot({
            position: {
                x: this.player.camera.position.x,
                y: this.player.camera.position.y,
                z: this.player.camera.position.z
            },
            direction: {
                x: spreadDirection.x,
                y: spreadDirection.y,
                z: spreadDirection.z
            },
            accuracy: accuracy
        });

        // Exit scope immediately
        this.exitScope();

        // Transition to bolt action
        this.boltActionStartTime = Date.now();
        this.state = WEAPON_STATES.BOLT_ACTION;
    }

    calculateAccuracy() {
        if (this.isScoped) {
            return 1.0; // Perfect accuracy when scoped
        }

        let accuracy = GAME_CONSTANTS.HIP_ACCURACY;

        if (this.player.isCrouching) {
            accuracy = GAME_CONSTANTS.SCOPED_CROUCHED; // Using crouched accuracy for hip-fire while crouching? Maybe.
        }

        // Moving penalty for hip-fire
        const speed = Math.sqrt(
            this.player.velocity.x ** 2 + this.player.velocity.z ** 2
        );
        if (speed > 0.5) {
            accuracy *= GAME_CONSTANTS.MOVING_PENALTY;
        }

        // Jumping penalty for hip-fire
        if (!this.player.isGrounded) {
            accuracy = GAME_CONSTANTS.JUMPING_ACCURACY;
        }

        return Math.max(0, Math.min(1, accuracy));
    }

    applySpread(direction, accuracy) {
        const maxSpread = GAME_CONSTANTS.MAX_SPREAD_ANGLE * (Math.PI / 180);
        const spread = maxSpread * (1.0 - accuracy);

        // Random spread in cone
        const randomX = (Math.random() - 0.5) * spread;
        const randomY = (Math.random() - 0.5) * spread;

        const spreadDir = direction.clone();

        // Apply rotation
        const euler = new THREE.Euler(randomY, randomX, 0, 'YXZ');
        spreadDir.applyEuler(euler);
        spreadDir.normalize();

        return spreadDir;
    }

    playMuzzleFlash() {
        // TODO: Particle system for muzzle flash
    }

    createBulletTracer(direction) {
        // Create visual bullet tracer
        const start = this.player.camera.position.clone();
        const end = start.clone().addScaledVector(direction, 100);

        const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
        const material = new THREE.LineBasicMaterial({
            color: 0xffaa00,
            transparent: true,
            opacity: 0.8
        });
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);

        // Fade out and remove
        setTimeout(() => {
            let opacity = 0.8;
            const fadeInterval = setInterval(() => {
                opacity -= 0.1;
                material.opacity = opacity;
                if (opacity <= 0) {
                    clearInterval(fadeInterval);
                    this.scene.remove(line);
                    geometry.dispose();
                    material.dispose();
                }
            }, 30);
        }, 100);
    }

    applyCameraRecoil() {
        // Simple camera kick
        this.player.rotation.pitch += 0.02; // 2 degrees up
    }

    enterScope() {
        this.isScoped = true;
        this.state = WEAPON_STATES.AIMING;
        this.targetFOV = GAME_CONSTANTS.SCOPED_FOV;
        this.ui.showScope(true);
        this.network.sendScopeToggle(true);
    }

    exitScope() {
        this.isScoped = false;
        this.state = WEAPON_STATES.IDLE;
        this.targetFOV = GAME_CONSTANTS.DEFAULT_FOV;
        this.ui.showScope(false);
        this.network.sendScopeToggle(false);
    }

    startReload() {
        if (this.reserveAmmo === 0) {
            return;
        }

        this.state = WEAPON_STATES.RELOADING;
        this.reloadStartTime = Date.now();
        this.network.sendReload();
        // TODO: Play reload animation and sound
    }

    completeReload() {
        const ammoNeeded = GAME_CONSTANTS.MAGAZINE_SIZE - this.currentAmmo;
        const ammoToTake = Math.min(ammoNeeded, this.reserveAmmo);

        this.currentAmmo += ammoToTake;
        this.reserveAmmo -= ammoToTake;

        this.state = WEAPON_STATES.IDLE;
        this.updateUI();
    }

    updateUI() {
        this.ui.updateAmmo(this.currentAmmo, this.reserveAmmo, this.infiniteAmmo);
    }

    reset() {
        this.state = WEAPON_STATES.IDLE;
        this.currentAmmo = GAME_CONSTANTS.MAGAZINE_SIZE;
        this.reserveAmmo = GAME_CONSTANTS.RESERVE_AMMO;
        // Don't reset infiniteAmmo here, it's controlled by room settings
        this.isScoped = false;
        this.targetFOV = GAME_CONSTANTS.DEFAULT_FOV;
        this.currentFOV = GAME_CONSTANTS.DEFAULT_FOV;
        this.updateUI();
        this.ui.showScope(false);
    }
}
