import * as THREE from "three";

export type StarsOptions = {
  particleCount: number;
  minimumDistance: number;
  maximumDistance: number;
};

const SPEED = 0.001;

export class Particles extends THREE.Group {
  private particleCount: number = 50000;

  private minimumDistance: number = 10;
  private maximumDistance: number = 20;

  private positions: Float32Array;
  private colors: Float32Array;
  private velocities: Float32Array;
  private alive: Float32Array;

  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private particles: THREE.Points;

  private spawnPost: number = 0;
  private spawnLike: number = 0;
  private spawnFollow: number = 0;
  private spawnNewUser: number = 0;

  constructor(opts: Partial<StarsOptions> = {}) {
    super();

    this.particleCount = opts.particleCount ?? this.particleCount;
    this.minimumDistance = opts.minimumDistance ?? this.minimumDistance;
    this.maximumDistance = opts.maximumDistance ?? this.maximumDistance;

    this.positions = new Float32Array(this.particleCount * 3);
    this.colors = new Float32Array(this.particleCount * 3);
    this.velocities = new Float32Array(this.particleCount * 3);
    this.alive = new Float32Array(this.particleCount);
    this.setupParticles();
  }

  private setupParticles() {
    for (let i = 0; i < this.particleCount; i++) {
      this.resetParticle(i, false);
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.positions, 3),
    );
    this.geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(this.colors, 3),
    );

    this.material = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
    });

    this.particles = new THREE.Points(this.geometry, this.material);

    this.add(this.particles);
  }

  spawn(color: number) {
    if (color === 1) {
      this.spawnPost += 1;
    } else if (color === 2) {
      this.spawnLike += 1;
    } else if (color === 3) {
      this.spawnFollow += 1;
    } else {
      this.spawnNewUser += 1;
    }
  }

  update(delta: number) {
    for (let i = 0; i < this.particleCount; i++) {
      if (this.alive[i] <= 0) {
        if (this.spawnPost > 0) {
          this.resetParticle(i, true, 1);
          this.spawnPost--;
        } else if (this.spawnLike > 0) {
          this.resetParticle(i, true, 2);
          this.spawnLike--;
        } else if (this.spawnFollow > 0) {
          this.resetParticle(i, true, 3);
          this.spawnFollow--;
        } else if (this.spawnNewUser > 0) {
          this.resetParticle(i, true, 4);
          this.spawnNewUser--;
        }
      }

      const index = i * 3;
      this.positions[index] += this.velocities[index] * delta * SPEED;
      this.positions[index + 1] += this.velocities[index + 1] * delta * SPEED;
      this.positions[index + 2] += this.velocities[index + 2] * delta * SPEED;

      this.alive[i] -= delta;

      if (this.alive[i] <= 0) {
        this.resetParticle(i, false);
      }
    }

    if (
      this.spawnPost > 0 ||
      this.spawnLike > 0 ||
      this.spawnFollow > 0 ||
      this.spawnNewUser > 0
    ) {
      console.log("not enough particles");
    }

    this.geometry.attributes.position.needsUpdate = true;
    // Need to mark colors as needing update too
    this.geometry.attributes.color.needsUpdate = true;
  }

  private resetParticle(i: number, alive: boolean = true, color: number = 1) {
    const index = i * 3;

    let size = 10;
    let angle = Math.random() * Math.PI * 2;
    this.positions[index] = Math.cos(angle) * size;
    this.positions[index + 1] = Math.sin(angle) * size;
    this.positions[index + 2] = -10 + Math.random() * 9;

    // posts are orange
    if (color === 1) {
      this.colors[index] = 0.97;
      this.colors[index + 1] = 0.45;
      this.colors[index + 2] = 0.08;
    } else if (color === 2) {
      // likes are pink
      this.colors[index] = 0.85;
      this.colors[index + 1] = 0.15;
      this.colors[index + 2] = 0.46;
    } else if (color === 3) {
      // follows are cyan
      this.colors[index] = 0.86;
      this.colors[index + 1] = 0.14;
      this.colors[index + 2] = 0.14;
    } else {
      this.colors[index] = 1;
      this.colors[index + 1] = 1;
      this.colors[index + 2] = 1;
    }

    if (!alive) {
      this.colors[index] = 0;
      this.colors[index + 1] = 0;
      this.colors[index + 2] = 0;
    }

    let speed = Math.pow(Math.random(), 4) * 0.5 + 1;
    let move = 0.4;

    this.velocities[index] =
      (-Math.cos(angle) + Math.random() * move - move / 2) * speed;
    this.velocities[index + 1] =
      (-Math.sin(angle) + Math.random() * move - move / 2) * speed;
    this.velocities[index + 2] = Math.random() * move - move / 2;

    this.alive[i] = alive ? 5000 : 0;
  }
}
