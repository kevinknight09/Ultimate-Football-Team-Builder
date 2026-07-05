import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerDataService, Player, Era } from './player-data.service';
import html2canvas from 'html2canvas';

export interface DraftSlot {
  position: string;
  player: Player | null;
  x: number;
  y: number;
}

export interface MatchEvent {
  minute: number;
  type: 'GOAL' | 'OPP_GOAL' | 'MISS' | 'SAVE' | 'INFO';
  text: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  gameState: 'START' | 'DRAFT' | 'SIMULATING' | 'RESULT' = 'START';
  difficulty: 'EASY' | 'HARD' = 'EASY';
  
  dataService = inject(PlayerDataService);
  eras: Era[] = [];
  
  // 4-3-3 Formation Positions with XY coordinates (%)
  draftSlots: DraftSlot[] = [
    { position: 'ST', player: null, x: 50, y: 10 },
    { position: 'LW', player: null, x: 20, y: 20 },
    { position: 'RW', player: null, x: 80, y: 20 },
    { position: 'CAM', player: null, x: 50, y: 30 },
    { position: 'CM', player: null, x: 30, y: 45 },
    { position: 'CM', player: null, x: 70, y: 45 },
    { position: 'LB', player: null, x: 15, y: 65 },
    { position: 'CB', player: null, x: 35, y: 70 },
    { position: 'CB', player: null, x: 65, y: 70 },
    { position: 'RB', player: null, x: 85, y: 65 },
    { position: 'GK', player: null, x: 50, y: 88 }
  ];

  totalSpins = 0;
  isSpinning = false;
  currentSpunEra: Era | null = null;
  lastSpunEra: Era | null = null;
  
  totalRating = 0;
  resultMessage = '';
  matchScore = '';
  motm: Player | null = null;
  teamAnalysis = '';

  showRules = false;

  playerStats: { [playerId: string]: { goals: number, assists: number } } = {};

  // Simulation State
  playerScore = 1;
  oppScore = 4;
  currentMinute = 45;
  liveEvents: MatchEvent[] = [];
  allEvents: MatchEvent[] = [];
  simulationComplete = false;

  ngOnInit() {
    this.eras = this.dataService.getAllEras();
  }

  setDifficulty(diff: 'EASY' | 'HARD') {
    this.difficulty = diff;
  }

  startGame() {
    this.gameState = 'DRAFT';
  }

  toggleRules() {
    this.showRules = !this.showRules;
  }

  cdr = inject(ChangeDetectorRef);

  spin() {
    if (this.totalSpins >= 11) return;
    this.isSpinning = true;
    this.currentSpunEra = null;
    this.cdr.detectChanges();
    
    // Simulate spin delay
    setTimeout(() => {
      // Find all eras that have at least one player matching an empty slot
      const validEras = this.eras.filter(era => this.getAvailablePlayers(era).length > 0);
      
      if (validEras.length > 0) {
        // Try not to pick the exact same era as the *last* one if there are other valid options
        let candidateEras = validEras;
        if (validEras.length > 1 && this.lastSpunEra) {
           candidateEras = validEras.filter(e => e.id !== this.lastSpunEra?.id);
        }
        
        const randomIndex = Math.floor(Math.random() * candidateEras.length);
        this.currentSpunEra = candidateEras[randomIndex];
        this.lastSpunEra = this.currentSpunEra;
      } else {
        // Fallback
        const randomIndex = Math.floor(Math.random() * this.eras.length);
        this.currentSpunEra = this.eras[randomIndex];
      }
      
      this.isSpinning = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  getAvailablePlayers(era: Era): Player[] {
    // Used by spin logic to ensure era has at least one valid player
    return era.players.filter(p => this.isPlayerAvailable(p));
  }

  isPlayerAvailable(player: Player): boolean {
    // 1. Is there an empty slot for this position?
    const hasEmptySlot = this.draftSlots.some(s => s.position === player.position && s.player === null);
    if (!hasEmptySlot) return false;
    
    // 2. Is this exact player already drafted (checking by name to prevent cross-era duplicates)?
    const alreadyDrafted = this.draftSlots.some(s => s.player?.name === player.name);
    return !alreadyDrafted;
  }

  selectPlayer(player: Player) {
    if (!this.isPlayerAvailable(player)) return;
    
    const slot = this.draftSlots.find(s => s.position === player.position && s.player === null);
    if (slot) {
      slot.player = player;
      this.currentSpunEra = null;
      this.totalSpins++;
    }
  }

  simulate() {
    this.gameState = 'SIMULATING';
    this.playerScore = 1;
    this.oppScore = 4;
    this.currentMinute = 45;
    this.liveEvents = [];
    this.allEvents = [];
    this.simulationComplete = false;
    this.playerStats = {};
    
    const players = this.draftSlots.map(s => s.player).filter((p): p is Player => p !== null);
    this.totalRating = players.reduce((sum, p) => sum + p.rating, 0);
    
    players.forEach(p => {
      this.playerStats[p.id] = { goals: 0, assists: 0 };
    });

    const getUnitRating = (positions: string[]) => {
      const unitPlayers = players.filter(p => positions.includes(p.position));
      if (unitPlayers.length === 0) return 0;
      return unitPlayers.reduce((sum, p) => sum + p.rating, 0) / unitPlayers.length;
    };

    const defRating = getUnitRating(['GK', 'CB', 'LB', 'RB']);
    const midRating = getUnitRating(['CM', 'CAM']);
    const attRating = getUnitRating(['ST', 'LW', 'RW']);

    this.allEvents.push({ minute: 45, type: 'INFO', text: 'Second half kicks off! The opposition leads 4-1.' });

    const effectiveDef = defRating + (midRating * 0.2);
    if (effectiveDef < 105) { 
      this.allEvents.push({ minute: this.rand(50, 65), type: 'OPP_GOAL', text: 'Goal for the opposition! The defense was completely exposed.' });
      if (effectiveDef < 100) {
        this.allEvents.push({ minute: this.rand(70, 85), type: 'OPP_GOAL', text: 'Another goal for the opposition. This is turning into a rout.' });
      }
    } else {
      this.allEvents.push({ minute: this.rand(55, 65), type: 'SAVE', text: 'Brilliant defending! The opposition is denied.' });
    }

    const effectiveAtt = attRating + (midRating * 0.2);
    const attackers = players.filter(p => ['ST', 'LW', 'RW', 'CAM'].includes(p.position));
    const midfielders = players.filter(p => ['CAM', 'CM', 'LW', 'RW', 'LB', 'RB'].includes(p.position));
    
    let goalsToScore = 0;
    if (effectiveAtt > 111) goalsToScore = 4;
    else if (effectiveAtt > 109) goalsToScore = 3;
    else if (effectiveAtt > 105) goalsToScore = 2;
    else if (effectiveAtt > 100) goalsToScore = 1;
    else goalsToScore = 0;

    for(let i=0; i<goalsToScore; i++) {
       const min = this.rand(50 + (i*10), 58 + (i*10));
       const scorer = attackers[Math.floor(Math.random() * attackers.length)] || players[0];
       this.playerStats[scorer.id].goals += 1;
       
       let text = `GOAL! ${scorer.name} finds the back of the net!`;
       
       // 70% chance of an assist
       if (Math.random() > 0.3) {
          let potentialAssisters = midfielders.filter(p => p.id !== scorer.id);
          if (potentialAssisters.length === 0) potentialAssisters = players.filter(p => p.id !== scorer.id);
          if (potentialAssisters.length > 0) {
            const assister = potentialAssisters[Math.floor(Math.random() * potentialAssisters.length)];
            this.playerStats[assister.id].assists += 1;
            text = `GOAL! Brilliant assist by ${assister.name}, finished expertly by ${scorer.name}!`;
          }
       }
       
       this.allEvents.push({ minute: min, type: 'GOAL', text });
    }
    
    if (goalsToScore < 4 && effectiveAtt > 100) {
      this.allEvents.push({ minute: this.rand(80, 89), type: 'MISS', text: 'Oh! So close! A golden opportunity missed.' });
    }

    this.allEvents.push({ minute: 90, type: 'INFO', text: 'Full Time whistle blows!' });
    this.allEvents.sort((a, b) => a.minute - b.minute);

    // Calculate MOTM (Goals = 3pts, Assists = 2pts, Base rating = 0.1pts)
    let bestScore = -1;
    this.motm = players[0];
    players.forEach(p => {
       const score = (this.playerStats[p.id].goals * 3) + (this.playerStats[p.id].assists * 2) + (p.rating * 0.1);
       if (score > bestScore) {
         bestScore = score;
         this.motm = p;
       }
    });

    if (effectiveDef < 105) this.teamAnalysis = "The defense was too leaky to mount a serious comeback.";
    else if (effectiveAtt > 111) this.teamAnalysis = "An absolutely lethal attack tore the opposition apart.";
    else if (effectiveAtt > 109) this.teamAnalysis = "A valiant attacking display, but just fell short of the miracle.";
    else this.teamAnalysis = "The frontline lacked the clinical edge needed to turn this game around.";

    this.runSimulation();
  }

  rand(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  runSimulation() {
    let eventIndex = 0;
    const interval = setInterval(() => {
      if (this.currentMinute < 90) {
         this.currentMinute += 1;
      }
      
      while (eventIndex < this.allEvents.length && this.allEvents[eventIndex].minute <= this.currentMinute) {
         const ev = this.allEvents[eventIndex];
         this.liveEvents.unshift(ev);
         
         if (ev.type === 'GOAL') this.playerScore++;
         if (ev.type === 'OPP_GOAL') this.oppScore++;
         
         eventIndex++;
      }
      
      this.cdr.detectChanges();

      if (this.currentMinute >= 90) {
        clearInterval(interval);
        this.simulationComplete = true;
        this.matchScore = `${this.playerScore} - ${this.oppScore}`;
        
        if (this.playerScore > this.oppScore) this.resultMessage = 'COMEBACK COMPLETE';
        else if (this.playerScore === this.oppScore) this.resultMessage = 'SO CLOSE';
        else this.resultMessage = 'CRUSHED';
        
        this.cdr.detectChanges();
      }
    }, 150);
  }

  viewResult() {
    this.gameState = 'RESULT';
  }

  shareSquad() {
    const element = document.getElementById('shareable-result');
    if (!element) return;
    
    html2canvas(element, { backgroundColor: '#0f172a' }).then(canvas => {
      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      
      if (navigator.share) {
        canvas.toBlob(blob => {
          if (blob) {
            const file = new File([blob], 'squad.jpg', { type: 'image/jpeg' });
            navigator.share({
              title: 'My Legendary Squad',
              text: 'Check out the squad I built to attempt the 4-1 comeback!',
              files: [file]
            }).catch(err => {
              console.error('Share failed:', err);
              this.fallbackDownload(imgData);
            });
          }
        }, 'image/jpeg');
      } else {
        this.fallbackDownload(imgData);
      }
    });
  }

  fallbackDownload(imgData: string) {
    const link = document.createElement('a');
    link.download = 'my-legendary-squad.jpg';
    link.href = imgData;
    link.click();
  }

  restart() {
    this.gameState = 'START';
    this.totalSpins = 0;
    this.totalRating = 0;
    this.currentSpunEra = null;
    this.lastSpunEra = null;
    this.draftSlots.forEach(s => s.player = null);
  }

  getRatingClass(rating: number | undefined): string {
    if (!rating) return '';
    if (rating >= 95) return 'rating-gold';
    if (rating >= 90) return 'rating-purple';
    return 'rating-green';
  }

  getScorersAndAssisters() {
    const active = [];
    for (const slot of this.draftSlots) {
      if (slot.player) {
        const stats = this.playerStats[slot.player.id];
        if (stats && (stats.goals > 0 || stats.assists > 0)) {
          active.push({ name: slot.player.name, goals: stats.goals, assists: stats.assists });
        }
      }
    }
    return active;
  }

  getArray(n: number): any[] {
    return Array(n);
  }
}
