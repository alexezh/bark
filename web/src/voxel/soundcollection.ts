import { SoundLoader } from "./sound";

export class SoundCollection {
  public sounds = new SoundLoader();

  public constructor() {
    this.sounds.Add({ name: "sniper", file: "assets/sounds/sniper.wav.mp3" });
    this.sounds.Add({ name: "take_heart", file: "assets/sounds/heart.wav.mp3" });
    this.sounds.Add({ name: "walk1", file: "assets/sounds/walk1.wav.mp3" });
    this.sounds.Add({ name: "blood1", file: "assets/sounds/blood1.wav.mp3" });
    this.sounds.Add({ name: "blood2", file: "assets/sounds/blood2.wav.mp3" });
    this.sounds.Add({ name: "blood3", file: "assets/sounds/blood3.wav.mp3" });
    this.sounds.Add({ name: "rocket", file: "assets/sounds/rocket_shoot.wav.mp3" });
    this.sounds.Add({ name: "rocket_explode", file: "assets/sounds/rocket_explode.wav.mp3" });
    this.sounds.Add({ name: "ak47", file: "assets/sounds/ak47.wav.mp3" });
    this.sounds.Add({ name: "p90", file: "assets/sounds/p90.wav.mp3" });
    this.sounds.Add({ name: "pistol", file: "assets/sounds/pistol.mp3" });
    this.sounds.Add({ name: "grenadelauncher", file: "assets/sounds/grenadelauncher.mp3" });
    this.sounds.Add({ name: "shotgun", file: "assets/sounds/shotgun_shoot.wav.mp3" });
    this.sounds.Add({ name: "shotgun_reload", file: "assets/sounds/shotgun_reload.wav.mp3" });
    this.sounds.Add({ name: "minigun", file: "assets/sounds/gunshot1.wav.mp3" });
    this.sounds.Add({ name: "fall", file: "assets/sounds/fall.wav.mp3" });
    this.sounds.Add({ name: "fall2", file: "assets/sounds/scream.wav.mp3" });
    this.sounds.Add({ name: "footsteps", file: "assets/sounds/footsteps.wav.mp3" });
    this.sounds.Add({ name: "heartbeat", file: "assets/sounds/heartbeat.wav.mp3" });
    this.sounds.Add({ name: "painkillers", file: "assets/sounds/painkillers.wav.mp3" });
    this.sounds.Add({ name: "ambient_horror", file: "assets/sounds/ambient_horror.wav.mp3" });
    this.sounds.Add({ name: "ambient_street", file: "assets/sounds/ambient_street.mp3" });
    this.sounds.Add({ name: "hit1", file: "assets/sounds/hit1.wav.mp3" });
    this.sounds.Add({ name: "hit2", file: "assets/sounds/hit2.wav.mp3" });
    this.sounds.Add({ name: "hunt1", file: "assets/sounds/kill_you.wav.mp3" });
    this.sounds.Add({ name: "hunt2", file: "assets/sounds/take_him.wav.mp3" });
    this.sounds.Add({ name: "ammo_fall", file: "assets/sounds/ammo_fall.wav.mp3" });
    this.sounds.Add({ name: "reload", file: "assets/sounds/reload.wav.mp3" });
    this.sounds.Add({ name: "bullet_wall", file: "assets/sounds/bullet_wall.mp3" });
    this.sounds.Add({ name: "bullet_metal", file: "assets/sounds/bullet_metal.mp3" });
  }
}