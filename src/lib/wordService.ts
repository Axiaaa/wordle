export let words = new Map<number, string>(); 
export let valid_words : string[] = [];
export let tries = 0;
let seed = 1337 ^ 0xDEADBEEF;

function dayOfYear(date: Date): number {
  return Math.floor(
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
      Date.UTC(date.getFullYear(), 0, 0)) /
      86400000
  );
}

function nextRandom(): number { //mulberry32 algo
  seed |= 0;
  seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export const loadWordsFile = async (): Promise<string> => {
  if (words.size > 0) return getTodayWord() || "";
  
  try {
    const response = await fetch('./words.txt');

    if (!response.ok) {
      throw new Error(`Failed to load words.txt (${response.status})`);
    }
    const text = await response.text();
    let split = text.split("\n");
    valid_words = split;

    for (let i = 0; i < 365; i++) {
      const index = Math.floor(nextRandom() * split.length);
      words.set(i, split[index]);
    }

    return getTodayWord() || ""; 
    } catch (err) {
      console.error(err);
      return "";
    }
  };

export function getTodayWord() {
  if (words.size === 0) return "";
  const today = new Date();
  const index = (today.getFullYear() * 366 + dayOfYear(today)) % words.size;
  return words.get(index);
}
    
export function getScore(guess: string, target: string): [string, string] {
    if (!target) return [guess, ""];

    const result: string[] = new Array(guess.length).fill("0");
    const remaining: Record<string, number> = {};

    for (let i = 0; i < guess.length; i++) {
        if (guess[i] === target[i]) {
        result[i] = "2";
        } else {
        const c = target[i];
        remaining[c] = (remaining[c] ?? 0) + 1;
        }
    }

    for (let i = 0; i < guess.length; i++) {
        if (result[i] === "2") continue;

        const char = guess[i];
        if (remaining[char] > 0) {
        result[i] = "1";
        remaining[char]--;
        }
    }

  return [guess, result.join("")];
}


export function updateUiWithScore(score: [string, string]): string[] {
  const rowColors = [...score[1]].map((value) => {
    if (value === "2") return "#538d4e";
    if (value === "1") return "#b59f3b"
    return "#3a3a3c";
  });

  return rowColors;
}

export function checkVictory(score: [string, string]): [string, string] {
  tries += 1;
  if (score[1] === "22222") {
    return  ["Victory !", "The word was "]
  } else if (tries === 7) {
    return  ["You lost !", "The word was "]
  }
  return ["", ""]
}

export function resetTries() {
  tries = 0;
}