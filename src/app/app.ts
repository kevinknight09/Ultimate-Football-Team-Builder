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
  type: 'GOAL' | 'OPP_GOAL' | 'MISS' | 'SAVE' | 'INFO' | 'PEN_SCORE' | 'PEN_MISS' | 'OPP_PEN_SCORE' | 'OPP_PEN_MISS';
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
    { position: 'CAM', player: null, x: 50, y: 32 },
    { position: 'CM', player: null, x: 28, y: 48 },
    { position: 'CM', player: null, x: 72, y: 48 },
    { position: 'LB', player: null, x: 12, y: 68 },
    { position: 'CB', player: null, x: 34, y: 76 },
    { position: 'CB', player: null, x: 66, y: 76 },
    { position: 'RB', player: null, x: 88, y: 68 },
    { position: 'GK', player: null, x: 50, y: 92 }
  ];

  totalSpins = 0;
  isSpinning = false;
  hasRerolled = false;
  currentSpunEra: Era | null = null;
  lastSpunEra: Era | null = null;
  
  totalRating = 0;
  resultMessage = '';
  matchScore = '';
  motm: Player | null = null;
  teamAnalysis = '';

  showRules = false;

  audioCtx: AudioContext | null = null;
  crowdNoiseNode: AudioBufferSourceNode | null = null;

  playerStats: { [playerId: string]: { goals: number, assists: number } } = {};

  // Simulation State
  playerScore = 1;
  oppScore = 4;
  currentMinute = 45;
  liveEvents: MatchEvent[] = [];
  allEvents: MatchEvent[] = [];
  simulationComplete = false;

  wentToExtraTime = false;
  wentToPenalties = false;
  playerPenalties = 0;
  oppPenalties = 0;
  
  isSharing = false;
  showDisclaimer = false;

  showFeedbackModal = false;
  submittingFeedback = false;
  feedbackSuccess = false;

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

  resetGame() {
    this.gameState = 'START';
    this.difficulty = 'EASY';
    this.draftSlots = [
      { position: 'LW', x: 20, y: 20, player: null },
      { position: 'ST', x: 50, y: 10, player: null },
      { position: 'RW', x: 80, y: 20, player: null },
      { position: 'CAM', x: 50, y: 32, player: null },
      { position: 'CM', x: 28, y: 48, player: null },
      { position: 'CM', x: 72, y: 48, player: null },
      { position: 'LB', x: 12, y: 68, player: null },
      { position: 'CB', x: 34, y: 76, player: null },
      { position: 'CB', x: 66, y: 76, player: null },
      { position: 'RB', x: 88, y: 68, player: null },
      { position: 'GK', x: 50, y: 92, player: null }
    ];
    this.totalSpins = 0;
    this.hasRerolled = false;
    this.currentSpunEra = null;
    this.isSpinning = false;
    this.playerScore = 1;
    this.oppScore = 4;
    this.currentMinute = 45;
    this.liveEvents = [];
    this.allEvents = [];
    this.simulationComplete = false;
    this.motm = null;
    this.teamAnalysis = '';
    this.playerStats = {};
    
    this.wentToExtraTime = false;
    this.wentToPenalties = false;
    this.playerPenalties = 0;
    this.oppPenalties = 0;
    
    this.stopCrowd();
  }

  cdr = inject(ChangeDetectorRef);

  initAudio() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playCrowd() {
    this.initAudio();
    if (!this.audioCtx) return;
    
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    
    const bufferSize = this.audioCtx.sampleRate * 2;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    this.crowdNoiseNode = this.audioCtx.createBufferSource();
    this.crowdNoiseNode.buffer = buffer;
    this.crowdNoiseNode.loop = true;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    const gainNode = this.audioCtx.createGain();
    gainNode.gain.value = 0.1;

    this.crowdNoiseNode.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);
    
    this.crowdNoiseNode.start();
  }

  stopCrowd() {
    if (this.crowdNoiseNode) {
      this.crowdNoiseNode.stop();
      this.crowdNoiseNode.disconnect();
      this.crowdNoiseNode = null;
    }
  }

  playGoalWhistle() {
    this.initAudio();
    if (!this.audioCtx) return;
    
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const duration = 0.6; 
    const osc1 = this.audioCtx.createOscillator();
    const osc2 = this.audioCtx.createOscillator();
    
    osc1.type = 'triangle';
    osc2.type = 'triangle';
    
    osc1.frequency.setValueAtTime(2700, this.audioCtx.currentTime);
    osc2.frequency.setValueAtTime(2850, this.audioCtx.currentTime);

    const lfo = this.audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 40; 
    
    const lfoGain = this.audioCtx.createGain();
    lfoGain.gain.value = 100;

    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    lfoGain.connect(osc2.frequency);

    const mainGain = this.audioCtx.createGain();
    mainGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
    mainGain.gain.linearRampToValueAtTime(0.5, this.audioCtx.currentTime + 0.05);
    mainGain.gain.setValueAtTime(0.5, this.audioCtx.currentTime + duration - 0.1);
    mainGain.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + duration);

    osc1.connect(mainGain);
    osc2.connect(mainGain);
    mainGain.connect(this.audioCtx.destination);

    osc1.start();
    osc2.start();
    lfo.start();

    osc1.stop(this.audioCtx.currentTime + duration);
    osc2.stop(this.audioCtx.currentTime + duration);
    lfo.stop(this.audioCtx.currentTime + duration);
  }

  reroll() {
    if (this.hasRerolled || this.totalSpins >= 11) return;
    this.hasRerolled = true;
    this.spin();
  }

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
    
    this.playCrowd();
    
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

    const effectiveDefBase = defRating + (midRating * 0.2);
    
    // Midfield vulnerability check
    const centralMidfielders = players.filter(p => ['CM', 'CAM'].includes(p.position));
    const hasWeakMidfield = centralMidfielders.some(p => p.rating < 90);
    
    const effectiveDef = hasWeakMidfield ? (effectiveDefBase - 15) : effectiveDefBase;
    if (effectiveDef < 110) { 
      this.allEvents.push({ minute: this.rand(50, 65), type: 'OPP_GOAL', text: 'Goal for the opposition! The defense was completely exposed.' });
      if (effectiveDef < 105) {
        this.allEvents.push({ minute: this.rand(70, 85), type: 'OPP_GOAL', text: 'Another goal for the opposition. This is turning into a rout.' });
      }
      if (effectiveDef < 95) {
        this.allEvents.push({ minute: this.rand(86, 89), type: 'OPP_GOAL', text: 'A third goal for the opposition! Total collapse at the back.' });
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

    const addGoalEvent = (minRangeStart: number, minRangeEnd: number) => {
       const min = this.rand(minRangeStart, minRangeEnd);
       const scorer = attackers[Math.floor(Math.random() * attackers.length)] || players[0];
       this.playerStats[scorer.id].goals += 1;
       
       let text = `GOAL! ${scorer.name} finds the back of the net!`;
       
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
    };

    for(let i=0; i<goalsToScore; i++) {
        addGoalEvent(50 + (i*10), 58 + (i*10));
    }
    
    if (goalsToScore < 4 && effectiveAtt > 100) {
      this.allEvents.push({ minute: this.rand(80, 89), type: 'MISS', text: 'Oh! So close! A golden opportunity missed.' });
    }

    let tempPlayerScore = 1;
    let tempOppScore = 4;
    this.allEvents.forEach(e => {
       if (e.type === 'GOAL') tempPlayerScore++;
       if (e.type === 'OPP_GOAL') tempOppScore++;
    });

    if (tempPlayerScore === tempOppScore) {
       this.allEvents.push({ minute: 90, type: 'INFO', text: 'Full Time! We are heading to Extra Time!' });
       this.wentToExtraTime = true;
       
       if (effectiveAtt > 110 && Math.random() > 0.5) {
          addGoalEvent(95, 115);
          tempPlayerScore++;
       }
       if (effectiveDef < 105 && Math.random() > 0.5) {
          this.allEvents.push({ minute: this.rand(95, 115), type: 'OPP_GOAL', text: 'Heartbreak! The opposition scores in Extra Time!' });
          tempOppScore++;
       }
       
       if (tempPlayerScore === tempOppScore) {
           this.allEvents.push({ minute: 120, type: 'INFO', text: '120 Minutes played! It goes to Penalties!' });
           this.wentToPenalties = true;
           
           let pScore = 0;
           let oScore = 0;
           for(let i=1; i<=5; i++) {
               const pScored = Math.random() < 0.75;
               if (pScored) pScore++;
               this.allEvents.push({ minute: 120 + i, type: pScored ? 'PEN_SCORE' : 'PEN_MISS', text: pScored ? `Penalty ${i} scored by you!` : `Penalty ${i} missed by you!` });
               
               if (pScore > oScore + (5 - i + 1)) break;
               if (oScore > pScore + (5 - i)) break;

               const oScored = Math.random() < 0.75;
               if (oScored) oScore++;
               this.allEvents.push({ minute: 120 + i + 0.5, type: oScored ? 'OPP_PEN_SCORE' : 'OPP_PEN_MISS', text: oScored ? `Penalty ${i} scored by opposition.` : `Penalty ${i} missed by opposition.` });
               
               if (pScore > oScore + (5 - i)) break;
               if (oScore > pScore + (5 - i)) break;
           }
           
           let round = 6;
           while(pScore === oScore && round <= 11) {
               const pScored = Math.random() < 0.75;
               if (pScored) pScore++;
               this.allEvents.push({ minute: 120 + round, type: pScored ? 'PEN_SCORE' : 'PEN_MISS', text: pScored ? `Sudden death penalty scored!` : `Sudden death penalty missed!` });
               
               const oScored = Math.random() < 0.75;
               if (oScored) oScore++;
               this.allEvents.push({ minute: 120 + round + 0.5, type: oScored ? 'OPP_PEN_SCORE' : 'OPP_PEN_MISS', text: oScored ? `Opponent answers with a score.` : `Opponent misses!` });
               
               round++;
           }
           
       } else {
           this.allEvents.push({ minute: 120, type: 'INFO', text: 'Extra Time whistle blows!' });
       }
    } else {
       this.allEvents.push({ minute: 90, type: 'INFO', text: 'Full Time whistle blows!' });
    }

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

    if (hasWeakMidfield && effectiveDef < 105) {
      if (effectiveAtt > 109) {
        this.teamAnalysis = "Your attack was world class, but the midfield lacked legendary status and completely exposed the defense.";
      } else {
        this.teamAnalysis = "The midfield lacked the legendary status needed to compete, leaving the defense completely vulnerable.";
      }
    } else if (effectiveDef < 105) {
      this.teamAnalysis = "The defense was too leaky to mount a serious comeback.";
    } else if (effectiveAtt > 111) {
      this.teamAnalysis = "An absolutely lethal attack tore the opposition apart.";
    } else if (effectiveAtt > 109) {
      this.teamAnalysis = "A valiant attacking display, but just fell short of the miracle.";
    } else {
      this.teamAnalysis = "The frontline lacked the clinical edge needed to turn this game around.";
    }

    this.runSimulation();
  }

  rand(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  runSimulation() {
    let eventIndex = 0;
    const maxMinute = this.allEvents[this.allEvents.length - 1]?.minute || 90;
    
    const interval = setInterval(() => {
      if (this.currentMinute < maxMinute) {
         if (this.currentMinute >= 120 && this.wentToPenalties) {
             this.currentMinute += 0.5;
         } else {
             this.currentMinute += 1;
         }
      }
      
      while (eventIndex < this.allEvents.length && this.allEvents[eventIndex].minute <= this.currentMinute) {
         const ev = this.allEvents[eventIndex];
         this.liveEvents.unshift(ev);
         
         if (ev.type === 'GOAL') {
           this.playerScore++;
           this.playGoalWhistle();
         } else if (ev.type === 'OPP_GOAL') {
           this.oppScore++;
           this.playGoalWhistle();
         } else if (ev.type === 'PEN_SCORE') {
           this.playerPenalties++;
           this.playGoalWhistle();
         } else if (ev.type === 'OPP_PEN_SCORE') {
           this.oppPenalties++;
           this.playGoalWhistle();
         }
         
         eventIndex++;
      }
      
      this.cdr.detectChanges();

      if (this.currentMinute >= maxMinute) {
        clearInterval(interval);
        this.simulationComplete = true;
        this.stopCrowd();
        this.gameState = 'RESULT';
        this.matchScore = `${this.playerScore} - ${this.oppScore}`;
        
        let won = this.playerScore > this.oppScore;
        let drawn = this.playerScore === this.oppScore;
        
        if (drawn && this.wentToPenalties) {
            won = this.playerPenalties > this.oppPenalties;
        }

        if (won) this.resultMessage = 'COMEBACK COMPLETE';
        else if (drawn) this.resultMessage = 'SO CLOSE';
        else this.resultMessage = 'CRUSHED';
        
        this.cdr.detectChanges();
      }
    }, 150);
  }

  viewResult() {
    this.gameState = 'RESULT';
  }

  shareSquad() {
    this.isSharing = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      const element = document.getElementById('shareable-result');
      if (!element) return;
      
      html2canvas(element, { backgroundColor: '#0f172a' }).then(canvas => {
        this.isSharing = false;
        this.cdr.detectChanges();

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
      }).catch(err => {
        this.isSharing = false;
        this.cdr.detectChanges();
      });
    }, 50); // tiny delay to let angular render the watermark
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
    this.hasRerolled = false;
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

  openFeedbackModal() {
    this.showFeedbackModal = true;
    this.feedbackSuccess = false;
  }

  closeFeedbackModal() {
    this.showFeedbackModal = false;
  }

  submitFeedback(event: any) {
    event.preventDefault();
    this.submittingFeedback = true;
    
    const formData = new FormData(event.target);
    const data = new URLSearchParams();
    data.append('form-name', 'feedback');
    data.append('name', formData.get('name') as string || 'Anonymous');
    data.append('message', formData.get('message') as string);

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: data.toString()
    }).then(() => {
      this.submittingFeedback = false;
      this.feedbackSuccess = true;
    }).catch(error => {
      console.error('Error submitting feedback', error);
      this.submittingFeedback = false;
      alert('Failed to submit feedback. Please try again later.');
    });
  toggleDisclaimer() {
    this.showDisclaimer = !this.showDisclaimer;
  }
}
